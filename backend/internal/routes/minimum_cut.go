package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func registerMinimumCutRoutes(group *echo.Group, h *controllers.Controller, limit echo.MiddlewareFunc) {
	group.POST("/generate", h.GenerateMinimumCut)
	group.POST("/solve", h.SolveMinimumCut, limit)
	group.POST("/"+services.KargerID+"/solve", h.SolveMinimumCut, limit)
}
