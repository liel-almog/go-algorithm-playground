package server

import (
	"github.com/labstack/echo/v5"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/polynomialidentity/schwartzippel"
)

const polynomialIdentityID = "polynomial-identity"

type polynomialSolveRequest struct {
	Left   []int64 `json:"left" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Right  []int64 `json:"right" validate:"required,min=1,max=21,dive,gte=0,lte=100"`
	Rounds int     `json:"rounds" validate:"required,min=1,max=10"`
}

type polynomialGenerateRequest struct {
	Degree int `json:"degree" validate:"required,min=1,max=20"`
}

type polynomialIdentityProblem struct{}

func (polynomialIdentityProblem) describe() problemDescription {
	return problemDescription{
		ID: polynomialIdentityID, Title: "Polynomial identity testing", Algorithm: "Schwartz-Zippel",
		Description:      "Determine whether two coefficient lists represent the same polynomial over the finite field F_101.",
		SolutionApproach: "The backend evaluates both polynomials at random nonzero field points using Horner's method. A mismatch proves they differ; repeated matches provide probabilistic evidence of identity.",
		Limits:           []string{"maximum degree: 20", "10 verification rounds", "runtime: 5 seconds"},
	}
}

func (polynomialIdentityProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Tools: []algorithmTool{{
		ID: "schwartz-zippel", Name: "Schwartz-Zippel polynomial identity test", Category: "polynomial", Endpoint: solveEndpoint(polynomialIdentityID),
	}}}
}

func (p polynomialIdentityProblem) register(routes problemRoutes) {
	routes.generate(p.generate)
	routes.solve(p.solve)
}

func (polynomialIdentityProblem) generate(c *echo.Context) error {
	var request polynomialGenerateRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := schwartzippel.Generate(request.Degree)
	return writeResult(c, result, err)
}

func (polynomialIdentityProblem) solve(c *echo.Context) error {
	var request polynomialSolveRequest
	if err := decodeAndValidate(c, &request); err != nil {
		return writeRequestError(c, err)
	}
	result, err := schwartzippel.Solve(c.Request().Context(), request.Left, request.Right, request.Rounds)
	return writeResult(c, result, err)
}
