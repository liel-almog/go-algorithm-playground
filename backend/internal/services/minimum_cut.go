package services

import (
	"context"
	"errors"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/minimumcut/karger"
)

const maxMinCutWork = 250_000

func GenerateMinimumCut(vertices int) (any, error) { return karger.Generate(vertices) }

func SolveMinimumCut(ctx context.Context, vertices []string, edges []karger.Edge, trials int) (any, error) {
	if len(edges)*trials > maxMinCutWork {
		return nil, errors.New("edges multiplied by trials must not exceed 250000")
	}
	return karger.Solve(ctx, karger.Graph{Vertices: vertices, Edges: edges}, trials)
}

const (
	MinimumCutID = "minimum-cut"
	KargerID     = "karger"
)

type minimumCutProblem struct{}

func (minimumCutProblem) describe() problemDescription {
	return problemDescription{
		ID: MinimumCutID, Title: "Minimum cut", Algorithm: "Karger's randomized contraction",
		Description:      "Find a small set of edges whose removal separates a connected graph into two groups.",
		SolutionApproach: "Each trial repeatedly contracts a random edge until two components remain. The backend returns the smallest crossing cut found across all requested trials.",
		Limits:           []string{"50 vertices", "1,000 edges", "500 trials", "250,000 edge-trial units", "runtime: 5 seconds"},
	}
}

func (minimumCutProblem) algorithms() algorithmCatalog {
	return algorithmCatalog{Tools: []algorithmTool{{
		ID: KargerID, Name: "Karger randomized minimum cut", Category: "graph", Endpoint: algorithmSolveEndpoint(MinimumCutID, KargerID),
	}}}
}
