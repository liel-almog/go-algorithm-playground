package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func registerMinimumCutRoutes(group *echo.Group, h *controllers.Controller, add apiRegistrar, limit echo.MiddlewareFunc) {
	add(group, http.MethodPost, "/generate", h.GenerateMinimumCut)
	add(group, http.MethodPost, "/solve", h.SolveMinimumCut, limit)
	add(group, http.MethodPost, "/"+services.KargerID+"/solve", h.SolveMinimumCut, limit)
}
