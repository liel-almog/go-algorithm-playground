package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/matrixverification/freivalds"
)

type matrixSolveRequest struct {
	A       freivalds.Matrix `json:"a" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	B       freivalds.Matrix `json:"b" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	Product freivalds.Matrix `json:"product" validate:"required,min=2,max=10,dive,required,min=2,max=10,dive,gte=-1000000,lte=1000000"`
	Rounds  int              `json:"rounds" validate:"required,min=1,max=10"`
}

type matrixGenerateRequest struct {
	Size int `json:"size" validate:"required,min=2,max=10"`
}

func (s *Server) registerMatrixVerificationRoutes(e *echo.Echo) {
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/matrix-verification/generate", s.generateMatrices)
	s.registerAPI(e, http.MethodPost, problemRoutePrefix+"/matrix-verification/solve", s.solveMatrixVerification, s.limitAlgorithm)
}

func (s *Server) generateMatrices(c *echo.Context) error {
	var request matrixGenerateRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := freivalds.Generate(request.Size)
	return writeResult(c, result, err)
}

func (s *Server) solveMatrixVerification(c *echo.Context) error {
	var request matrixSolveRequest
	if err := s.decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := freivalds.Solve(c.Request().Context(), request.A, request.B, request.Product, request.Rounds)
	return writeResult(c, result, err)
}
