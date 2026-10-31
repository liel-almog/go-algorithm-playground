package mincut

import (
	"context"
	"errors"
	"math"
	"math/rand/v2"
	"slices"
	"time"
)

type Edge struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type Graph struct {
	Vertices []string `json:"vertices"`
	Edges    []Edge   `json:"edges"`
}

type Result struct {
	Algorithm     string      `json:"algorithm"`
	CutSize       int         `json:"cutSize"`
	Partitions    [2][]string `json:"partitions"`
	CrossingEdges []Edge      `json:"crossingEdges"`
	Trials        int         `json:"trials"`
	Confidence    float64     `json:"confidence"`
	DurationUS    int64       `json:"durationUs"`
}

func Solve(ctx context.Context, graph Graph, trials int) (Result, error) {
	start := time.Now()
	indices, err := validate(graph)
	if err != nil {
		return Result{}, err
	}
	if trials == 0 {
		n := len(graph.Vertices)
		trials = max(1, int(math.Ceil(float64(n*n)*math.Log(float64(n)+1))))
	}
	if trials < 1 || trials > 10_000 {
		return Result{}, errors.New("trials must be between 1 and 10000")
	}

	best := Result{Algorithm: "karger", CutSize: math.MaxInt, Trials: trials}
	for range trials {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		candidate := contract(graph, indices)
		if candidate.CutSize < best.CutSize {
			best.CutSize = candidate.CutSize
			best.Partitions = candidate.Partitions
			best.CrossingEdges = candidate.CrossingEdges
		}
	}
	n := float64(len(graph.Vertices))
	singleTrialSuccess := 2 / (n * (n - 1))
	best.Confidence = math.Round((1-math.Pow(1-singleTrialSuccess, float64(trials)))*10_000) / 100
	best.DurationUS = time.Since(start).Microseconds()
	return best, nil
}

func validate(graph Graph) (map[string]int, error) {
	if len(graph.Vertices) < 2 || len(graph.Vertices) > 100 {
		return nil, errors.New("a graph must have between 2 and 100 vertices")
	}
	indices := make(map[string]int, len(graph.Vertices))
	for index, vertex := range graph.Vertices {
		if vertex == "" {
			return nil, errors.New("vertex names cannot be empty")
		}
		if _, exists := indices[vertex]; exists {
			return nil, errors.New("vertex names must be unique")
		}
		indices[vertex] = index
	}
	if len(graph.Edges) < 1 || len(graph.Edges) > 10_000 {
		return nil, errors.New("a graph must have between 1 and 10000 edges")
	}
	adjacency := make([][]int, len(graph.Vertices))
	for _, edge := range graph.Edges {
		from, fromOK := indices[edge.From]
		to, toOK := indices[edge.To]
		if !fromOK || !toOK {
			return nil, errors.New("every edge endpoint must name a vertex")
		}
		if from == to {
			return nil, errors.New("self-loop edges are not supported")
		}
		adjacency[from] = append(adjacency[from], to)
		adjacency[to] = append(adjacency[to], from)
	}
	seen := make([]bool, len(graph.Vertices))
	queue := []int{0}
	seen[0] = true
	for head := 0; head < len(queue); head++ {
		for _, next := range adjacency[queue[head]] {
			if !seen[next] {
				seen[next] = true
				queue = append(queue, next)
			}
		}
	}
	if slices.Contains(seen, false) {
		return nil, errors.New("the graph must be connected")
	}
	return indices, nil
}

func contract(graph Graph, indices map[string]int) Result {
	parents := make([]int, len(graph.Vertices))
	ranks := make([]int, len(graph.Vertices))
	for i := range parents {
		parents[i] = i
	}
	var find func(int) int
	find = func(value int) int {
		if parents[value] != value {
			parents[value] = find(parents[value])
		}
		return parents[value]
	}
	union := func(a, b int) bool {
		a, b = find(a), find(b)
		if a == b {
			return false
		}
		if ranks[a] < ranks[b] {
			a, b = b, a
		}
		parents[b] = a
		if ranks[a] == ranks[b] {
			ranks[a]++
		}
		return true
	}

	components := len(graph.Vertices)
	for components > 2 {
		edge := graph.Edges[rand.IntN(len(graph.Edges))]
		if union(indices[edge.From], indices[edge.To]) {
			components--
		}
	}
	root := find(0)
	result := Result{Algorithm: "karger"}
	for index, vertex := range graph.Vertices {
		partition := 1
		if find(index) == root {
			partition = 0
		}
		result.Partitions[partition] = append(result.Partitions[partition], vertex)
	}
	for _, edge := range graph.Edges {
		if find(indices[edge.From]) != find(indices[edge.To]) {
			result.CrossingEdges = append(result.CrossingEdges, edge)
		}
	}
	result.CutSize = len(result.CrossingEdges)
	return result
}
