package solver

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"sync"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/puzzle"
)

var (
	ErrNotFound    = errors.New("algorithm not found")
	ErrNoSolution  = errors.New("no solution found")
	ErrSearchLimit = errors.New("search limit reached")
)

type Metadata struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Optimal     bool   `json:"optimal"`
	Category    string `json:"category"`
}

type Result struct {
	Algorithm   string   `json:"algorithm"`
	Path        [][]int  `json:"path"`
	Moves       []string `json:"moves"`
	MoveCount   int      `json:"moveCount"`
	Expanded    int      `json:"expanded"`
	Generated   int      `json:"generated"`
	FrontierMax int      `json:"frontierMax"`
	DurationUS  int64    `json:"durationUs"`
	Optimal     bool     `json:"optimal"`
}

type Algorithm interface {
	Metadata() Metadata
	Solve(context.Context, puzzle.Board) (Result, error)
}

type Registry struct {
	mu         sync.RWMutex
	algorithms map[string]Algorithm
}

func NewRegistry(algorithms ...Algorithm) *Registry {
	registry := &Registry{algorithms: make(map[string]Algorithm)}
	for _, algorithm := range algorithms {
		if err := registry.Register(algorithm); err != nil {
			panic(err)
		}
	}
	return registry
}

func DefaultRegistry() *Registry {
	return NewRegistry(BFS{}, AStar{}, Greedy{}, IDDFS{})
}

func (r *Registry) Register(algorithm Algorithm) error {
	meta := algorithm.Metadata()
	if meta.ID == "" || meta.Name == "" {
		return errors.New("algorithm ID and name are required")
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.algorithms[meta.ID]; exists {
		return fmt.Errorf("algorithm %q is already registered", meta.ID)
	}
	r.algorithms[meta.ID] = algorithm
	return nil
}

func (r *Registry) List() []Metadata {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make([]Metadata, 0, len(r.algorithms))
	for _, algorithm := range r.algorithms {
		result = append(result, algorithm.Metadata())
	}
	slices.SortFunc(result, func(a, b Metadata) int { return compare(a.Name, b.Name) })
	return result
}

func (r *Registry) Get(id string) (Algorithm, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	algorithm, found := r.algorithms[id]
	if !found {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, id)
	}
	return algorithm, nil
}

type parentStep struct {
	previous string
	board    puzzle.Board
	move     string
}

func finish(meta Metadata, start time.Time, goalKey string, parents map[string]parentStep, expanded, generated, frontierMax int) Result {
	boards := make([][]int, 0)
	moves := make([]string, 0)
	for key := goalKey; key != ""; {
		step := parents[key]
		boards = append(boards, append([]int(nil), step.board.Tiles...))
		if step.move != "" {
			moves = append(moves, step.move)
		}
		key = step.previous
	}
	slices.Reverse(boards)
	slices.Reverse(moves)
	return Result{
		Algorithm: meta.ID, Path: boards, Moves: moves, MoveCount: len(moves),
		Expanded: expanded, Generated: generated, FrontierMax: frontierMax,
		DurationUS: time.Since(start).Microseconds(), Optimal: meta.Optimal,
	}
}

func compare(a, b string) int {
	if a < b {
		return -1
	}
	if a > b {
		return 1
	}
	return 0
}
