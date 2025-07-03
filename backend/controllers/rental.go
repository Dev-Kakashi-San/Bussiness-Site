package controllers

import (
	"context"
	"net/http"
	"time"
	"rama-kuti-rentings/config"
	"rama-kuti-rentings/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetUserRentals(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("rentals")
	
	// Create aggregation pipeline to get rental with property details
	pipeline := []bson.M{
		{"$match": bson.M{"tenantId": objectID}},
		{"$lookup": bson.M{
			"from":         "properties",
			"localField":   "propertyId",
			"foreignField": "_id",
			"as":           "property",
		}},
		{"$unwind": "$property"},
		{"$sort": bson.M{"createdAt": -1}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch rentals",
		})
		return
	}
	defer cursor.Close(context.Background())

	var rentals []bson.M
	if err = cursor.All(context.Background(), &rentals); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode rentals",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"rentals": rentals,
		"message": "आपकी किराएदारी की जानकारी",
	})
}

func GetRentalDues(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("rentals")
	filter := bson.M{
		"tenantId": objectID,
		"status":   "active",
		"dueAmount": bson.M{"$gt": 0},
	}

	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch due amounts",
		})
		return
	}
	defer cursor.Close(context.Background())

	var rentals []models.Rental
	if err = cursor.All(context.Background(), &rentals); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode dues",
		})
		return
	}

	totalDue := 0.0
	for _, rental := range rentals {
		totalDue += rental.DueAmount
	}

	c.JSON(http.StatusOK, gin.H{
		"dues":     rentals,
		"totalDue": totalDue,
		"message":  "आपका बकाया किराया",
	})
}

func CreateRental(c *gin.Context) {
	var req models.RentalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
			"message": "कृपया सभी जानकारी भरें",
		})
		return
	}

	propertyID, err := primitive.ObjectIDFromHex(req.PropertyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid property ID"})
		return
	}

	tenantID, err := primitive.ObjectIDFromHex(req.TenantID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	// Check if property is available
	propertyCollection := config.GetCollection("properties")
	var property models.Property
	err = propertyCollection.FindOne(context.Background(), bson.M{"_id": propertyID}).Decode(&property)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Property not found",
		})
		return
	}

	if property.Status != "available" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Property not available",
			"message": "यह सम्पत्ति उपलब्ध नहीं है",
		})
		return
	}

	// Create rental
	rental := models.Rental{
		ID:              primitive.NewObjectID(),
		PropertyID:      propertyID,
		TenantID:        tenantID,
		StartDate:       req.StartDate,
		MonthlyRent:     req.MonthlyRent,
		SecurityDeposit: req.SecurityDeposit,
		Status:          "active",
		DueAmount:       req.MonthlyRent, // First month rent
		NextDueDate:     req.StartDate.AddDate(0, 1, 0),
		Agreement:       req.Agreement,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	collection := config.GetCollection("rentals")
	_, err = collection.InsertOne(context.Background(), rental)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create rental",
		})
		return
	}

	// Update property status
	propertyCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": propertyID},
		bson.M{"$set": bson.M{"status": "occupied", "updatedAt": time.Now()}},
	)

	c.JSON(http.StatusCreated, gin.H{
		"message": "किराएदारी समझौता बन गया",
		"rental":  rental,
	})
}

func RecordPayment(c *gin.Context) {
	rentalID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(rentalID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rental ID"})
		return
	}

	var payment models.Payment
	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	payment.ID = primitive.NewObjectID()
	payment.PaymentDate = time.Now()
	payment.Status = "paid"
	payment.CreatedAt = time.Now()

	collection := config.GetCollection("rentals")
	
	// Update rental with payment and reduce due amount
	update := bson.M{
		"$push": bson.M{"paymentHistory": payment},
		"$inc":  bson.M{"dueAmount": -payment.Amount},
		"$set":  bson.M{"updatedAt": time.Now()},
	}

	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to record payment",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Rental not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "भुगतान दर्ज हो गया",
		"payment": payment,
	})
}