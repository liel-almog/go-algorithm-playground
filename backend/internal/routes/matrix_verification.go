package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func registerMatrixVerificationRoutes(group *echo.Group, h *controllers.Controller, add apiRegistrar, limit echo.MiddlewareFunc) {
	add(group, http.MethodPost, "/generate", h.GenerateMatrix)
	add(group, http.MethodPost, "/solve", h.SolveMatrix, limit)
	add(group, http.MethodPost, "/"+services.FreivaldsID+"/solve", h.SolveMatrix, limit)
}
