package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

const problemRoutePrefix = "/api/problems"

func (s *Server) registerProblemRoutes(e *echo.Echo) {
	s.registerAPI(e, http.MethodGet, problemRoutePrefix, s.problems)
	s.registerAPI(e, http.MethodGet, problemRoutePrefix+"/", s.problems)
	s.registerEightPuzzleRoutes(e)
	s.registerMinimumCutRoutes(e)
	s.registerMatrixVerificationRoutes(e)
	s.registerPolynomialIdentityRoutes(e)
}
