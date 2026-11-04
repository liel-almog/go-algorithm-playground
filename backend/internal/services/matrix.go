package services

import (
	"context"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/matrixverification/freivalds"
)

func GenerateMatrix(size int) (any, error) { return freivalds.Generate(size) }

// CheckMatrix keeps the original single-round response shape for the c input.
func CheckMatrix(ctx context.Context, a, b, c freivalds.Matrix) (any, error) {
	result, err := freivalds.Solve(ctx, a, b, c, 1)
	if err != nil {
		return nil, err
	}
	trial := result.Trials[0]
	return matrixCheckResponse{Vector: trial.Vector, Left: trial.Left, Right: trial.Right, Equal: trial.Passed}, nil
}

type matrixCheckResponse struct {
	Vector []float64 `json:"vector"`
	Left   []float64 `json:"left"`
	Right  []float64 `json:"right"`
	Equal  bool      `json:"equal"`
}

func SolveMatrix(ctx context.Context, a, b, product freivalds.Matrix, rounds int) (any, error) {
	return freivalds.Solve(ctx, a, b, product, rounds)
}

const (
	MatrixVerificationID = "matrix-verification"
	FreivaldsID          = "freivalds"
)

type matrixVerificationProblem struct{}

func (matrixVerificationProblem) describe() problemDescription {
	return problemDescription{
		ID: MatrixVerificationID, Title: "Matrix multiplication verification", Algorithm: "Freivalds' algorithm",
		Description:      "Check whether a claimed product C is equal to A multiplied by B without recomputing the full matrix product.",
		SolutionApproach: "For each round the backend samples a binary vector r and compares A(Br) with Cr. Any mismatch proves the claim false; repeated matches reduce the false-positive probability.",
		Limits:           []string{"binary matrices: 1x1 to 100x100", "one random check for a, b, c; 1 to 15 rounds with product", "runtime: 5 seconds"},
	}
}

func (matrixVerificationProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Tools: []algorithmTool{{
		ID: FreivaldsID, Name: "Freivalds matrix verification", Category: "matrix", Endpoint: algorithmSolveEndpoint(MatrixVerificationID, FreivaldsID),
	}}}
}
