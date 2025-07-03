package controllers

import (
	"context"
	"net/http"
	"rama-kuti-rentings/config"
	"rama-kuti-rentings/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetDashboardStats(c *gin.Context) {
	ctx := context.Background()
	
	// Get collection counts
	propertiesCollection := config.GetCollection("properties")
	usersCollection := config.GetCollection("users")
	rentalsCollection := config.GetCollection("rentals")

	totalProperties, _ := propertiesCollection.CountDocuments(ctx, bson.M{})
	availableProperties, _ := propertiesCollection.CountDocuments(ctx, bson.M{"status": "available"})
	occupiedProperties, _ := propertiesCollection.CountDocuments(ctx, bson.M{"status": "occupied"})
	
	totalUsers, _ := usersCollection.CountDocuments(ctx, bson.M{})
	activeUsers, _ := usersCollection.CountDocuments(ctx, bson.M{"isActive": true})
	
	activeRentals, _ := rentalsCollection.CountDocuments(ctx, bson.M{"status": "active"})
	
	// Calculate total revenue and dues
	pipeline := []bson.M{
		{"$match": bson.M{"status": "active"}},
		{"$group": bson.M{
			"_id": nil,
			"totalRent": bson.M{"$sum": "$monthlyRent"},
			"totalDues": bson.M{"$sum": "$dueAmount"},
		}},
	}
	
	cursor, err := rentalsCollection.Aggregate(ctx, pipeline)
	var revenueData struct {
		TotalRent float64 `bson:"totalRent"`
		TotalDues float64 `bson:"totalDues"`
	}
	
	if err == nil && cursor.Next(ctx) {
		cursor.Decode(&revenueData)
	}
	cursor.Close(ctx)

	stats := gin.H{
		"properties": gin.H{
			"total":     totalProperties,
			"available": availableProperties,
			"occupied":  occupiedProperties,
		},
		"users": gin.H{
			"total":  totalUsers,
			"active": activeUsers,
		},
		"rentals": gin.H{
			"active": activeRentals,
		},
		"revenue": gin.H{
			"monthlyRent": revenueData.TotalRent,
			"totalDues":   revenueData.TotalDues,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"stats":   stats,
		"message": "डैशबोर्ड की जानकारी",
	})
}

func GetAllUsers(c *gin.Context) {
	collection := config.GetCollection("users")
	
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := collection.Find(context.Background(), bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch users",
		})
		return
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err = cursor.All(context.Background(), &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode users",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users":   users,
		"message": "सभी उपयोगकर्ता",
	})
}

func GetAllRentals(c *gin.Context) {
	collection := config.GetCollection("rentals")
	
	// Aggregation to get rental with property and tenant details
	pipeline := []bson.M{
		{"$lookup": bson.M{
			"from":         "properties",
			"localField":   "propertyId",
			"foreignField": "_id",
			"as":           "property",
		}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "tenantId",
			"foreignField": "_id",
			"as":           "tenant",
		}},
		{"$unwind": "$property"},
		{"$unwind": "$tenant"},
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
		"message": "सभी किराएदारी",
	})
}

func GetOverdueRentals(c *gin.Context) {
	collection := config.GetCollection("rentals")
	
	filter := bson.M{
		"status": "active",
		"dueAmount": bson.M{"$gt": 0},
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$lookup": bson.M{
			"from":         "properties",
			"localField":   "propertyId",
			"foreignField": "_id",
			"as":           "property",
		}},
		{"$lookup": bson.M{
			"from":         "users",
			"localField":   "tenantId",
			"foreignField": "_id",
			"as":           "tenant",
		}},
		{"$unwind": "$property"},
		{"$unwind": "$tenant"},
		{"$sort": bson.M{"nextDueDate": 1}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch overdue rentals",
		})
		return
	}
	defer cursor.Close(context.Background())

	var rentals []bson.M
	if err = cursor.All(context.Background(), &rentals); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode overdue rentals",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"overdueRentals": rentals,
		"message":        "बकाया किराया",
	})
}