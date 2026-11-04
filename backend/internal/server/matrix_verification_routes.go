package server

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/matrixverification/freivalds"
)

const (
	matrixVerificationID = "matrix-verification"
	freivaldsID          = "freivalds"
)

type matrixSolveRequest struct {
	A       freivalds.Matrix  `json:"a"`
	B       freivalds.Matrix  `json:"b"`
	C       *freivalds.Matrix `json:"c"`
	Product freivalds.Matrix  `json:"product"`
	Rounds  *int              `json:"rounds" validate:"omitempty,min=1,max=15"`
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

type matrixVerificationProblem struct{}

func (matrixVerificationProblem) describe() problemDescription {
	return problemDescription{
		ID: matrixVerificationID, Title: "Matrix multiplication verification", Algorithm: "Freivalds' algorithm",
		Description:      "Check whether a claimed product C is equal to A multiplied by B without recomputing the full matrix product.",
		SolutionApproach: "For each round the backend samples a binary vector r and compares A(Br) with Cr. Any mismatch proves the claim false; repeated matches reduce the false-positive probability.",
		Limits:           []string{"binary matrices: 1x1 to 100x100", "one random check for a, b, c; 1 to 15 rounds with product", "runtime: 5 seconds"},
	}
}

func (matrixVerificationProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Tools: []algorithmTool{{
		ID: freivaldsID, Name: "Freivalds matrix verification", Category: "matrix", Endpoint: algorithmSolveEndpoint(matrixVerificationID, freivaldsID),
	}}}
}

func (p matrixVerificationProblem) register(routes problemRoutes) {
	routes.generate(p.generate)
	routes.solve(p.solve)
	routes.solveWith(freivaldsID, p.solve)
}

func (matrixVerificationProblem) generate(c *echo.Context) error {
	var request matrixGenerateRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := freivalds.Generate(request.Size)
	return writeResult(c, result, err)
}

func (matrixVerificationProblem) solve(c *echo.Context) error {
	var request matrixSolveRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	if request.C != nil {
		if request.Product != nil || request.Rounds != nil {
			return writeRequestError(c, errors.New("c cannot be combined with product or rounds; use product for multiple rounds"))
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
	rounds := 1
	if request.Rounds != nil {
		rounds = *request.Rounds
	}
	result, err := freivalds.Solve(c.Request().Context(), request.A, request.B, request.Product, rounds)
	return writeResult(c, result, err)
}
