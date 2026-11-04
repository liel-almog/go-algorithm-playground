package services

import (
	"context"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/polynomialidentity/schwartzippel"
)

func GeneratePolynomial(degree int) (any, error) { return schwartzippel.Generate(degree) }
func SolvePolynomial(ctx context.Context, left, right []int64, rounds int) (any, error) {
	return schwartzippel.Solve(ctx, left, right, rounds)
}

const (
	PolynomialIdentityID = "polynomial-identity"
	SchwartzZippelID     = "schwartz-zippel"
)

type polynomialIdentityProblem struct{}

func (polynomialIdentityProblem) describe() problemDescription {
	return problemDescription{
		ID: PolynomialIdentityID, Title: "Polynomial identity testing", Algorithm: "Schwartz-Zippel",
		Description:      "Determine whether two coefficient lists represent the same polynomial over the finite field F_101.",
		SolutionApproach: "The backend evaluates both polynomials at random nonzero field points using Horner's method. A mismatch proves they differ; repeated matches provide probabilistic evidence of identity.",
		Limits:           []string{"maximum degree: 20", "10 verification rounds", "runtime: 5 seconds"},
	}
}

func (polynomialIdentityProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Tools: []algorithmTool{{
		ID: SchwartzZippelID, Name: "Schwartz-Zippel polynomial identity test", Category: "polynomial", Endpoint: algorithmSolveEndpoint(PolynomialIdentityID, SchwartzZippelID),
	}}}
}
