package eightpuzzle

import (
	"context"
	"errors"
	"math"
	"slices"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/solver"
)

type Service struct {
	registry *solver.Registry
}

var (
	ErrUnsolvable        = errors.New("this tile arrangement is not solvable")
	ErrAlgorithmNotFound = solver.ErrNotFound
)

func IsSolverTimeout(err error) bool {
	return errors.Is(err, context.DeadlineExceeded)
}

func IsSolverLimit(err error) bool {
	return errors.Is(err, solver.ErrSearchLimit)
}

type Algorithm struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Optimal     bool   `json:"optimal"`
	Category    string `json:"category"`
}

type BoardRequest struct {
	Rows    int
	Columns int
	Tiles   []int
}

type SolveRequest struct {
	BoardRequest
	Algorithm string
}

type RandomPuzzleRequest struct {
	Rows     int
	Columns  int
	Scramble int
}

type CompareRequest struct {
	BoardRequest
	Algorithms []string
}

type ExperimentRequest struct {
	Size       int
	Scramble   int
	Runs       int
	Algorithms []string
}

type Comparison struct {
	Results []solver.Result   `json:"results"`
	Errors  map[string]string `json:"errors,omitempty"`
	Winner  string            `json:"winner,omitempty"`
	Rule    string            `json:"rule"`
}

type Aggregate struct {
	Algorithm       string  `json:"algorithm"`
	Successes       int     `json:"successes"`
	Failures        int     `json:"failures"`
	AverageMoves    float64 `json:"averageMoves"`
	AverageExpanded float64 `json:"averageExpanded"`
	AverageDuration float64 `json:"averageDurationUs"`
}

func New(registry *solver.Registry) *Service {
	if registry == nil {
		registry = solver.DefaultRegistry()
	}
	return &Service{registry: registry}
}

func (s *Service) Algorithms() []Algorithm {
	metadata := s.registry.List()
	algorithms := make([]Algorithm, 0, len(metadata))
	for _, meta := range metadata {
		algorithms = append(algorithms, Algorithm{
			ID: meta.ID, Name: meta.Name, Description: meta.Description,
			Optimal: meta.Optimal, Category: meta.Category,
		})
	}
	return algorithms
}

func (s *Service) RandomPuzzle(request RandomPuzzleRequest) (map[string]any, error) {
	if request.Rows == 0 {
		request.Rows = 3
	}
	if request.Columns == 0 {
		request.Columns = 3
	}
	if request.Scramble == 0 {
		request.Scramble = 20
	}
	board, err := board.Random(request.Rows, request.Columns, request.Scramble)
	if err != nil {
		return nil, err
	}
	return map[string]any{"row": board.Rows, "column": board.Columns, "tiles": board.Tiles, "scramble": request.Scramble}, nil
}

func (s *Service) Solve(ctx context.Context, request SolveRequest) (solver.Result, error) {
	board, err := board.New(request.Rows, request.Columns, request.Tiles)
	if err != nil {
		return solver.Result{}, err
	}
	if !board.IsSolvable() {
		return solver.Result{}, ErrUnsolvable
	}
	algorithm, err := s.registry.Get(request.Algorithm)
	if err != nil {
		return solver.Result{}, err
	}
	return runWithTimeout(ctx, algorithm, board)
}

func (s *Service) Compare(ctx context.Context, request CompareRequest) (Comparison, error) {
	board, err := board.New(request.Rows, request.Columns, request.Tiles)
	if err != nil {
		return Comparison{}, err
	}
	if !board.IsSolvable() {
		return Comparison{}, ErrUnsolvable
	}
	return s.compareBoard(ctx, board, request.Algorithms)
}

func (s *Service) Experiment(ctx context.Context, request ExperimentRequest) (map[string]any, error) {
	if request.Size == 0 {
		request.Size = 3
	}
	if request.Scramble == 0 {
		request.Scramble = 20
	}
	if request.Runs == 0 {
		request.Runs = 5
	}
	if request.Size > 3 {
		return nil, errors.New("experiment puzzle size must be at most 3")
	}
	if request.Scramble > 100 {
		return nil, errors.New("experiment scramble must be at most 100")
	}
	if request.Runs < 1 || request.Runs > 5 {
		return nil, errors.New("runs must be between 1 and 5")
	}
	if len(request.Algorithms) == 0 {
		request.Algorithms = []string{"astar", "bfs", "dfs"}
	}
	totals := make(map[string]*Aggregate)
	for _, id := range request.Algorithms {
		if _, err := s.registry.Get(id); err != nil {
			return nil, err
		}
		totals[id] = &Aggregate{Algorithm: id}
	}
	for range request.Runs {
		if err := ctx.Err(); err != nil {
			return nil, err
		}
		board, err := board.Random(request.Size, request.Size, request.Scramble)
		if err != nil {
			return nil, err
		}
		comparison, err := s.compareBoard(ctx, board, request.Algorithms)
		if err != nil {
			return nil, err
		}
		for _, result := range comparison.Results {
			total := totals[result.Algorithm]
			total.Successes++
			total.AverageMoves += float64(result.MoveCount)
			total.AverageExpanded += float64(result.Expanded)
			total.AverageDuration += float64(result.DurationUS)
		}
		for id := range comparison.Errors {
			totals[id].Failures++
		}
	}
	rows := make([]Aggregate, 0, len(totals))
	for _, total := range totals {
		if total.Successes > 0 {
			count := float64(total.Successes)
			total.AverageMoves = round(total.AverageMoves/count, 2)
			total.AverageExpanded = round(total.AverageExpanded/count, 2)
			total.AverageDuration = round(total.AverageDuration/count, 2)
		}
		rows = append(rows, *total)
	}
	slices.SortFunc(rows, func(a, b Aggregate) int {
		if a.Successes != b.Successes {
			return b.Successes - a.Successes
		}
		if a.AverageMoves != b.AverageMoves {
			if a.AverageMoves < b.AverageMoves {
				return -1
			}
			return 1
		}
		if a.AverageExpanded < b.AverageExpanded {
			return -1
		}
		if a.AverageExpanded > b.AverageExpanded {
			return 1
		}
		return 0
	})
	winner := ""
	if len(rows) > 0 && rows[0].Successes > 0 {
		winner = rows[0].Algorithm
	}
	return map[string]any{
		"runs": request.Runs, "size": request.Size, "scramble": request.Scramble,
		"results": rows, "winner": winner,
		"rule": "most successful runs, then lowest average move cost, then fewest expanded states",
	}, nil
}

func (s *Service) compareBoard(ctx context.Context, board board.Board, ids []string) (Comparison, error) {
	if len(ids) == 0 {
		for _, meta := range s.registry.List() {
			ids = append(ids, meta.ID)
		}
	}
	if len(ids) > 4 {
		return Comparison{}, errors.New("at most 4 algorithms may be compared")
	}
	result := Comparison{Errors: make(map[string]string), Rule: "fewest moves, then fewest expanded states, then fastest runtime"}
	seen := make(map[string]bool)
	for _, id := range ids {
		if err := ctx.Err(); err != nil {
			return Comparison{}, err
		}
		if seen[id] {
			continue
		}
		seen[id] = true
		algorithm, err := s.registry.Get(id)
		if err != nil {
			return Comparison{}, err
		}
		solution, err := runWithTimeout(ctx, algorithm, board)
		if err != nil {
			result.Errors[id] = publicError(err)
			continue
		}
		result.Results = append(result.Results, solution)
	}
	slices.SortFunc(result.Results, func(a, b solver.Result) int {
		if a.MoveCount != b.MoveCount {
			return a.MoveCount - b.MoveCount
		}
		if a.Expanded != b.Expanded {
			return a.Expanded - b.Expanded
		}
		return int(a.DurationUS - b.DurationUS)
	})
	if len(result.Results) > 0 {
		result.Winner = result.Results[0].Algorithm
	}
	if len(result.Errors) == 0 {
		result.Errors = nil
	}
	return result, nil
}

func runWithTimeout(parent context.Context, algorithm solver.Algorithm, board board.Board) (solver.Result, error) {
	ctx, cancel := context.WithTimeout(parent, 5*time.Second)
	defer cancel()
	return algorithm.Solve(ctx, board)
}

func publicError(err error) string {
	if errors.Is(err, context.DeadlineExceeded) {
		return "the algorithm exceeded its 5 second time limit"
	}
	return err.Error()
}

func round(value float64, places int) float64 {
	power := math.Pow10(places)
	return math.Round(value*power) / power
}
