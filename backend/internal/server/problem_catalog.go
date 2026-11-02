package server

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

type problemDescription struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Algorithm        string   `json:"algorithm"`
	Description      string   `json:"description"`
	SolutionApproach string   `json:"solutionApproach"`
	GenerateEndpoint string   `json:"generateEndpoint"`
	SolveEndpoint    string   `json:"solveEndpoint"`
	Limits           []string `json:"limits"`
}

func (s *Server) problems(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{"problems": problemCatalog()})
}

func problemCatalog() []problemDescription {
	return []problemDescription{
		{
			ID: "eight-puzzle", Title: "Sliding puzzle", Algorithm: "A*, breadth-first search, or iterative-deepening DFS",
			Description:      "Rearrange numbered tiles into ascending order by sliding one tile at a time into the empty space.",
			SolutionApproach: "The backend validates that the board is solvable, explores neighboring board states with the selected search strategy, and reconstructs the move-by-move path when it reaches the goal.",
			GenerateEndpoint: problemRoutePrefix + "/eight-puzzle/generate", SolveEndpoint: problemRoutePrefix + "/eight-puzzle/solve",
			Limits: []string{"rows and columns: 2 to 4", "runtime: 5 seconds"},
		},
		{
			ID: "minimum-cut", Title: "Minimum cut", Algorithm: "Karger's randomized contraction",
			Description:      "Find a small set of edges whose removal separates a connected graph into two groups.",
			SolutionApproach: "Each trial repeatedly contracts a random edge until two components remain. The backend returns the smallest crossing cut found across all requested trials.",
			GenerateEndpoint: problemRoutePrefix + "/minimum-cut/generate", SolveEndpoint: problemRoutePrefix + "/minimum-cut/solve",
			Limits: []string{"50 vertices", "1,000 edges", "500 trials", "250,000 edge-trial units", "runtime: 5 seconds"},
		},
		{
			ID: "matrix-verification", Title: "Matrix multiplication verification", Algorithm: "Freivalds' algorithm",
			Description:      "Check whether a claimed product C is equal to A multiplied by B without recomputing the full matrix product.",
			SolutionApproach: "For each round the backend samples a binary vector r and compares A(Br) with Cr. Any mismatch proves the claim false; repeated matches reduce the false-positive probability.",
			GenerateEndpoint: problemRoutePrefix + "/matrix-verification/generate", SolveEndpoint: problemRoutePrefix + "/matrix-verification/solve",
			Limits: []string{"matrix size: 2x2 to 10x10", "10 verification rounds", "runtime: 5 seconds"},
		},
		{
			ID: "polynomial-identity", Title: "Polynomial identity testing", Algorithm: "Schwartz-Zippel",
			Description:      "Determine whether two coefficient lists represent the same polynomial over the finite field F_101.",
			SolutionApproach: "The backend evaluates both polynomials at random nonzero field points using Horner's method. A mismatch proves they differ; repeated matches provide probabilistic evidence of identity.",
			GenerateEndpoint: problemRoutePrefix + "/polynomial-identity/generate", SolveEndpoint: problemRoutePrefix + "/polynomial-identity/solve",
			Limits: []string{"maximum degree: 20", "10 verification rounds", "runtime: 5 seconds"},
		},
	}
}
