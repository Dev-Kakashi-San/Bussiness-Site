package routes

import (
	"rama-kuti-rentings/controllers"
	"rama-kuti-rentings/middleware"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(router *gin.RouterGroup) {
	admin := router.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/dashboard", controllers.GetDashboardStats)
		admin.GET("/users", controllers.GetAllUsers)
		admin.GET("/rentals", controllers.GetAllRentals)
		admin.GET("/overdue", controllers.GetOverdueRentals)
	}
}