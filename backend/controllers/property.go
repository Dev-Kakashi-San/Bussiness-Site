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
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetProperties(c *gin.Context) {
	collection := config.GetCollection("properties")
	
	// Pagination
	page := 1
	limit := 12
	if p := c.Query("page"); p != "" {
		// Parse page number
	}
	if l := c.Query("limit"); l != "" {
		// Parse limit
	}

	// Filters
	filter := bson.M{}
	if status := c.Query("status"); status != "" {
		filter["status"] = status
	}
	if propertyType := c.Query("type"); propertyType != "" {
		filter["type"] = propertyType
	}
	if city := c.Query("city"); city != "" {
		filter["location.city"] = primitive.Regex{Pattern: city, Options: "i"}
	}

	skip := (page - 1) * limit
	opts := options.Find().SetSkip(int64(skip)).SetLimit(int64(limit)).SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := collection.Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch properties"})
		return
	}
	defer cursor.Close(context.Background())

	var properties []models.Property
	if err = cursor.All(context.Background(), &properties); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode properties"})
		return
	}

	// Get total count
	total, _ := collection.CountDocuments(context.Background(), filter)

	c.JSON(http.StatusOK, gin.H{
		"properties": properties,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
		"message": "सम्पत्तियाँ मिल गईं",
	})
}

func GetProperty(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid property ID"})
		return
	}

	collection := config.GetCollection("properties")
	var property models.Property
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&property)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Property not found",
			"message": "सम्पत्ति नहीं मिली",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"property": property,
	})
}

func CreateProperty(c *gin.Context) {
	var property models.Property
	if err := c.ShouldBindJSON(&property); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
			"message": "कृपया सभी आवश्यक जानकारी भरें",
		})
		return
	}

	userID := c.GetString("userID")
	createdBy, _ := primitive.ObjectIDFromHex(userID)

	property.ID = primitive.NewObjectID()
	property.CreatedBy = createdBy
	property.Status = "available"
	property.CreatedAt = time.Now()
	property.UpdatedAt = time.Now()

	collection := config.GetCollection("properties")
	_, err := collection.InsertOne(context.Background(), property)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create property",
			"message": "सम्पत्ति बनाने में त्रुटि",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "सम्पत्ति सफलतापूर्वक बनाई गई",
		"property": property,
	})
}

func UpdateProperty(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid property ID"})
		return
	}

	var updates bson.M
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates["updatedAt"] = time.Now()

	collection := config.GetCollection("properties")
	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": updates},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update property",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Property not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "सम्पत्ति अपडेट हो गई",
	})
}

func DeleteProperty(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid property ID"})
		return
	}

	collection := config.GetCollection("properties")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete property",
		})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Property not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "सम्पत्ति हटा दी गई",
	})
}