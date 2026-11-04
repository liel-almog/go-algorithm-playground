package karger

import (
	"context"
	"errors"
	"math"
	"math/rand/v2"
	"slices"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	maxVertices = 50
	maxEdges    = 1_000
	maxTrials   = 500
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
		trials = min(maxTrials, max(1, int(math.Ceil(float64(n*n)*math.Log(float64(n)+1)))))
	}
	if trials < 1 || trials > maxTrials {
		return Result{}, errors.New("trials must be between 1 and 500")
	}

	best := Result{Algorithm: "karger", CutSize: math.MaxInt, Trials: trials}
	for range trials {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		candidate, err := contract(ctx, graph, indices)
		if err != nil {
			return Result{}, err
		}
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

// Generate returns a connected simple graph. The cycle guarantees connectivity;
// the additional random chords make generated examples more interesting.
func Generate(vertexCount int) (Graph, error) {
	if vertexCount < 3 || vertexCount > maxVertices {
		return Graph{}, errors.New("vertex count must be between 3 and 50")
	}
	vertices := make([]string, vertexCount)
	for i := range vertices {
		vertices[i] = vertexName(i)
	}

	edges := make([]Edge, 0, vertexCount*2)
	seen := make(map[[2]int]struct{}, vertexCount*2)
	addEdge := func(from, to int) {
		if from == to {
			return
		}
		if from > to {
			from, to = to, from
		}
		key := [2]int{from, to}
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		edges = append(edges, Edge{From: vertices[from], To: vertices[to]})
	}
	for i := range vertexCount {
		addEdge(i, (i+1)%vertexCount)
	}
	for i := range vertexCount {
		addEdge(i, (i+2)%vertexCount)
	}
	for range max(1, vertexCount/3) {
		addEdge(rand.IntN(vertexCount), rand.IntN(vertexCount))
	}
	return Graph{Vertices: vertices, Edges: edges}, nil
}

func vertexName(index int) string {
	name := ""
	for {
		name = string(rune('A'+index%26)) + name
		index = index/26 - 1
		if index < 0 {
			return name
		}
	}
}

func validate(graph Graph) (map[string]int, error) {
	if len(graph.Vertices) < 2 || len(graph.Vertices) > maxVertices {
		return nil, errors.New("a graph must have between 2 and 50 vertices")
	}
	indices := make(map[string]int, len(graph.Vertices))
	for index, vertex := range graph.Vertices {
		if strings.TrimSpace(vertex) == "" || utf8.RuneCountInString(vertex) > 100 || strings.IndexFunc(vertex, unicode.IsControl) >= 0 {
			return nil, errors.New("vertex names must contain 1 to 100 characters and no control characters")
		}
		if _, exists := indices[vertex]; exists {
			return nil, errors.New("vertex names must be unique")
		}
		indices[vertex] = index
	}
	if len(graph.Edges) < 1 || len(graph.Edges) > maxEdges {
		return nil, errors.New("a graph must have between 1 and 1000 edges")
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

func contract(ctx context.Context, graph Graph, indices map[string]int) (Result, error) {
	sets := newDisjointSet(len(graph.Vertices))

	components := len(graph.Vertices)
	for components > 2 {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		edge := graph.Edges[rand.IntN(len(graph.Edges))]
		if sets.union(indices[edge.From], indices[edge.To]) {
			components--
		}
	}
	root := sets.find(0)
	result := Result{Algorithm: "karger"}
	for index, vertex := range graph.Vertices {
		partition := 1
		if sets.find(index) == root {
			partition = 0
		}
		result.Partitions[partition] = append(result.Partitions[partition], vertex)
	}
	for _, edge := range graph.Edges {
		if sets.find(indices[edge.From]) != sets.find(indices[edge.To]) {
			result.CrossingEdges = append(result.CrossingEdges, edge)
		}
	}
	result.CutSize = len(result.CrossingEdges)
	return result, nil
}
