package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
)

func registerMetadataRoutes(api, problems *echo.Group, h *controllers.Controller) {
	api.GET("/health", h.Health)
	api.GET("/algorithms", h.Algorithms)
	problems.GET("", h.Problems)
	problems.GET("/", h.Problems)
}
