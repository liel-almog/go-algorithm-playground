package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/httpapi"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

func Register(e *echo.Echo, h *controllers.Controller, limit echo.MiddlewareFunc) {
	e.GET("/", h.Index)

	api := e.Group("/api", httpapi.ValidateAPIRequest)
	problems := api.Group("/problems")

	registerMetadataRoutes(api, problems, h)
	registerPuzzleRoutes(problems.Group("/"+services.EightPuzzleID), h, limit)
	registerMinimumCutRoutes(problems.Group("/"+services.MinimumCutID), h, limit)
	registerMatrixVerificationRoutes(problems.Group("/"+services.MatrixVerificationID), h, limit)
	registerPolynomialIdentityRoutes(problems.Group("/"+services.PolynomialIdentityID), h, limit)
}
