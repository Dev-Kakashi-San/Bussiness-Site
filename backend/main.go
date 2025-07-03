package main

import (
	"log"
	"os"
	"rama-kuti-rentings/config"
	"rama-kuti-rentings/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	config.ConnectDB()

	// Initialize Gin router
	router := gin.Default()

	// Configure CORS for React frontend
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Serve static files for property images
	router.Static("/uploads", "./uploads")

	// API routes
	api := router.Group("/api/v1")
	{
		routes.AuthRoutes(api)
		routes.PropertyRoutes(api)
		routes.UserRoutes(api)
		routes.AdminRoutes(api)
		routes.RentalRoutes(api)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "success",
			"message": "राम राम! Rama Kuti Rentings API is running",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🏛️ राम राम! Server starting on port %s", port)
	router.Run(":" + port)
}