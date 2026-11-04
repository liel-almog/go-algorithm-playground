package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func (s *Server) registerProblemRoutes(e *echo.Echo) {
	s.registerAPI(e, http.MethodGet, problemRoutePrefix, s.listProblems)
	s.registerAPI(e, http.MethodGet, problemRoutePrefix+"/", s.listProblems)
	for _, p := range s.problems {
		p.register(problemRoutes{server: s, echo: e, prefix: problemPath(p.describe().ID)})
	}
}
