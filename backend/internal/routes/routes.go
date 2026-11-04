package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/controllers"
	"github.com/liel-almog/go-algorithm-playground/internal/services"
)

type apiRegistrar func(*echo.Group, string, string, echo.HandlerFunc, ...echo.MiddlewareFunc)

// Register delegates the actual Echo registration to the server so its
// request validation, limits, and method tracking apply to every API route.
func Register(e *echo.Echo, h *controllers.Controller, add apiRegistrar, limit echo.MiddlewareFunc) {
	e.GET("/", h.Index)

	api := e.Group("/api")
	problems := api.Group("/problems")

	registerMetadataRoutes(api, problems, h, add)
	registerPuzzleRoutes(problems.Group("/"+services.EightPuzzleID), h, add, limit)
	registerMinimumCutRoutes(problems.Group("/"+services.MinimumCutID), h, add, limit)
	registerMatrixVerificationRoutes(problems.Group("/"+services.MatrixVerificationID), h, add, limit)
	registerPolynomialIdentityRoutes(problems.Group("/"+services.PolynomialIdentityID), h, add, limit)
}
