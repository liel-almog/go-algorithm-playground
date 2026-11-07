package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func registerMatrixVerificationRoutes(group *echo.Group, h *controllers.Controller, limit echo.MiddlewareFunc) {
	group.POST("/generate", h.GenerateMatrix)
	group.POST("/solve", h.SolveMatrix, limit)
	group.POST("/"+services.FreivaldsID+"/solve", h.SolveMatrix, limit)
}
