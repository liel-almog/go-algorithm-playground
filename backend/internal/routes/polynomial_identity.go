package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func registerPolynomialIdentityRoutes(group *echo.Group, h *controllers.Controller, limit echo.MiddlewareFunc) {
	group.POST("/generate", h.GeneratePolynomial)
	group.POST("/solve", h.SolvePolynomial, limit)
	group.POST("/"+services.SchwartzZippelID+"/solve", h.SolvePolynomial, limit)
}
