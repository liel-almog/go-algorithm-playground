package solver

import (
	"fmt"

	"github.com/liel-almog/go-algorithm-playground/internal/problems/eightpuzzle/board"
)

// Heuristic estimates the number of moves still needed to reach the goal. A*
// stays optimal only when the estimate never overestimates.
type Heuristic func(board.Board) int

const (
	HeuristicManhattan = "manhattan"
	HeuristicMisplaced = "misplaced"
)

// ParseHeuristic returns the heuristic with the given ID. An empty ID selects
// the default, Manhattan distance.
func ParseHeuristic(id string) (Heuristic, error) {
	switch id {
	case "", HeuristicManhattan:
		return board.Board.Manhattan, nil
	case HeuristicMisplaced:
		return board.Board.MisplacedTiles, nil
	default:
		return nil, fmt.Errorf("heuristic must be %q or %q", HeuristicManhattan, HeuristicMisplaced)
	}
}
