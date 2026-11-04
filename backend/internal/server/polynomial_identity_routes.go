package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
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

func (s *Server) registerPolynomialIdentityRoutes(e *echo.Echo) {
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/polynomial-identity/generate", s.generatePolynomial)
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/polynomial-identity/solve", s.solvePolynomialIdentity, s.limitAlgorithm)
}

func (s *Server) generatePolynomial(c *echo.Context) error {
	var request polynomialGenerateRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := schwartzippel.Generate(request.Degree)
	return writeResult(c, result, err)
}

func (s *Server) solvePolynomialIdentity(c *echo.Context) error {
	var request polynomialSolveRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := schwartzippel.Solve(c.Request().Context(), request.Left, request.Right, request.Rounds)
	return writeResult(c, result, err)
}
