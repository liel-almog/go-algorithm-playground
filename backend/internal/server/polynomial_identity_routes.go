package server

import (
	"net/http"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/polynomialidentity/schwartzippel"
)

type polynomialSolveRequest struct {
	Left   []int64 `json:"left" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Right  []int64 `json:"right" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Rounds int     `json:"rounds" validate:"required,min=1,max=10"`
}

type polynomialGenerateRequest struct {
	Degree int `json:"degree" validate:"required,min=1,max=20"`
}

func (s *Server) registerPolynomialIdentityRoutes(mux *http.ServeMux) {
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/polynomial-identity/generate", s.generatePolynomial)
	s.registerAPI(mux, http.MethodPost, problemRoutePrefix+"/polynomial-identity/solve", s.limitAlgorithm(s.solvePolynomialIdentity))
}

func (s *Server) generatePolynomial(w http.ResponseWriter, r *http.Request) {
	var request polynomialGenerateRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := schwartzippel.Generate(request.Degree)
	writeResult(w, result, err)
}

func (s *Server) solvePolynomialIdentity(w http.ResponseWriter, r *http.Request) {
	var request polynomialSolveRequest
	if !s.decodeAndValidate(w, r, &request) {
		return
	}
	result, err := schwartzippel.Solve(r.Context(), request.Left, request.Right, request.Rounds)
	writeResult(w, result, err)
}
