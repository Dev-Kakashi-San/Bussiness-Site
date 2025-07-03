package routes

import (
	"rama-kuti-rentings/controllers"
	"rama-kuti-rentings/middleware"

	"github.com/gin-gonic/gin"
)

func PropertyRoutes(router *gin.RouterGroup) {
	properties := router.Group("/properties")
	{
		properties.GET("/", controllers.GetProperties)
		properties.GET("/:id", controllers.GetProperty)
		
		// Protected routes
		properties.Use(middleware.AuthMiddleware())
		properties.POST("/", middleware.AdminMiddleware(), controllers.CreateProperty)
		properties.PUT("/:id", middleware.AdminMiddleware(), controllers.UpdateProperty)
		properties.DELETE("/:id", middleware.AdminMiddleware(), controllers.DeleteProperty)
		
		// Image upload
		properties.POST("/upload", middleware.AdminMiddleware(), controllers.UploadPropertyImages)
		properties.DELETE("/image/*path", middleware.AdminMiddleware(), controllers.DeletePropertyImage)
	}
}