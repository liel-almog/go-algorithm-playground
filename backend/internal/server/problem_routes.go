package server

import "net/http"

const problemRoutePrefix = "/api/problems"

func (s *Server) registerProblemRoutes(mux *http.ServeMux) {
	s.registerAPI(mux, http.MethodGet, problemRoutePrefix, s.problems)
	s.registerAPI(mux, http.MethodGet, problemRoutePrefix+"/", s.problems)
	s.registerEightPuzzleRoutes(mux)
	s.registerMinimumCutRoutes(mux)
	s.registerMatrixVerificationRoutes(mux)
	s.registerPolynomialIdentityRoutes(mux)
}
