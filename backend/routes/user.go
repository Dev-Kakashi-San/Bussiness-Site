package routes

import (
	"rama-kuti-rentings/controllers"
	"rama-kuti-rentings/middleware"

	"github.com/gin-gonic/gin"
)

func UserRoutes(router *gin.RouterGroup) {
	users := router.Group("/user")
	users.Use(middleware.AuthMiddleware())
	{
		users.GET("/profile", controllers.GetProfile)
	}
}