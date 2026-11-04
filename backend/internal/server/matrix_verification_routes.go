package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/matrixverification/freivalds"
)

type matrixSolveRequest struct {
	A       freivalds.Matrix  `json:"a"`
	B       freivalds.Matrix  `json:"b"`
	C       *freivalds.Matrix `json:"c"`
	Product freivalds.Matrix  `json:"product"`
	Rounds  int               `json:"rounds"`
}

type matrixGenerateRequest struct {
	Size int `json:"size" validate:"required,min=1,max=100"`
}

type matrixCheckResponse struct {
	Vector []int64 `json:"vector"`
	Left   []int64 `json:"left"`
	Right  []int64 `json:"right"`
	Equal  bool    `json:"equal"`
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
	if request.C != nil {
		if _, err := freivalds.ValidateMatrices(request.A, request.B, *request.C); err != nil {
			return writeRequestError(c, err)
		}
		result, err := freivalds.Solve(c.Request().Context(), request.A, request.B, *request.C, 1)
		if err != nil {
			return writeResult(c, nil, err)
		}
		trial := result.Trials[0]
		return c.JSON(http.StatusOK, matrixCheckResponse{
			Vector: trial.Vector,
			Left:   trial.Left,
			Right:  trial.Right,
			Equal:  trial.Passed,
		})
	}
	rounds := request.Rounds
	if rounds == 0 {
		rounds = 1
	}
	if _, err := freivalds.ValidateMatrices(request.A, request.B, request.Product); err != nil {
		return writeRequestError(c, err)
	}
	result, err := freivalds.Solve(c.Request().Context(), request.A, request.B, request.Product, rounds)
	return writeResult(c, result, err)
}
