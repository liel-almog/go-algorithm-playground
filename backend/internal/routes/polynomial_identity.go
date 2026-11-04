package routes

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func registerPolynomialIdentityRoutes(group *echo.Group, h *controllers.Controller, add apiRegistrar, limit echo.MiddlewareFunc) {
	add(group, http.MethodPost, "/generate", h.GeneratePolynomial)
	add(group, http.MethodPost, "/solve", h.SolvePolynomial, limit)
	add(group, http.MethodPost, "/"+services.SchwartzZippelID+"/solve", h.SolvePolynomial, limit)
}
