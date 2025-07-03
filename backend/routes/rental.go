package routes

import (
	"rama-kuti-rentings/controllers"
	"rama-kuti-rentings/middleware"

	"github.com/gin-gonic/gin"
)

func RentalRoutes(router *gin.RouterGroup) {
	rentals := router.Group("/rentals")
	rentals.Use(middleware.AuthMiddleware())
	{
		// User routes
		rentals.GET("/my-rentals", controllers.GetUserRentals)
		rentals.GET("/my-dues", controllers.GetRentalDues)
		
		// Admin routes
		rentals.POST("/", middleware.AdminMiddleware(), controllers.CreateRental)
		rentals.POST("/:id/payment", controllers.RecordPayment)
	}
}