package puzzle

import (
	"errors"
	"fmt"
	"math/rand/v2"
)

const (
	MinSize = 2
	MaxSize = 4
)

var ErrInvalidBoard = errors.New("invalid puzzle board")

// Board is an immutable square sliding-puzzle state. Zero is the blank tile.
type Board struct {
	Size  int
	Tiles []int
}

type Neighbor struct {
	Board Board
	Move  string
}

func New(size int, tiles []int) (Board, error) {
	if size < MinSize || size > MaxSize {
		return Board{}, fmt.Errorf("%w: size must be between %d and %d", ErrInvalidBoard, MinSize, MaxSize)
	}
	if len(tiles) != size*size {
		return Board{}, fmt.Errorf("%w: expected %d tiles", ErrInvalidBoard, size*size)
	}
	seen := make([]bool, len(tiles))
	for _, tile := range tiles {
		if tile < 0 || tile >= len(tiles) || seen[tile] {
			return Board{}, fmt.Errorf("%w: tiles must contain each value from 0 to %d exactly once", ErrInvalidBoard, len(tiles)-1)
		}
		seen[tile] = true
	}
	return Board{Size: size, Tiles: append([]int(nil), tiles...)}, nil
}

func Goal(size int) Board {
	tiles := make([]int, size*size)
	for i := range len(tiles) - 1 {
		tiles[i] = i + 1
	}
	return Board{Size: size, Tiles: tiles}
}

func (b Board) IsGoal() bool {
	for i := range len(b.Tiles) - 1 {
		if b.Tiles[i] != i+1 {
			return false
		}
	}
	return b.Tiles[len(b.Tiles)-1] == 0
}

func (b Board) IsSolvable() bool {
	inversions := 0
	for i, left := range b.Tiles {
		if left == 0 {
			continue
		}
		for _, right := range b.Tiles[i+1:] {
			if right != 0 && left > right {
				inversions++
			}
		}
	}
	if b.Size%2 == 1 {
		return inversions%2 == 0
	}
	blank := 0
	for i, tile := range b.Tiles {
		if tile == 0 {
			blank = i
			break
		}
	}
	blankRowFromBottom := b.Size - blank/b.Size
	return (blankRowFromBottom%2 == 0) != (inversions%2 == 0)
}

func (b Board) Key() string {
	key := make([]byte, len(b.Tiles))
	for i, tile := range b.Tiles {
		key[i] = byte(tile)
	}
	return string(key)
}

func (b Board) Neighbors() []Neighbor {
	blank := 0
	for i, tile := range b.Tiles {
		if tile == 0 {
			blank = i
			break
		}
	}
	row, col := blank/b.Size, blank%b.Size
	type direction struct {
		dr, dc int
		name   string
	}
	directions := [...]direction{{-1, 0, "up"}, {0, 1, "right"}, {1, 0, "down"}, {0, -1, "left"}}
	result := make([]Neighbor, 0, 4)
	for _, d := range directions {
		nr, nc := row+d.dr, col+d.dc
		if nr < 0 || nr >= b.Size || nc < 0 || nc >= b.Size {
			continue
		}
		next := append([]int(nil), b.Tiles...)
		target := nr*b.Size + nc
		next[blank], next[target] = next[target], next[blank]
		result = append(result, Neighbor{Board: Board{Size: b.Size, Tiles: next}, Move: d.name})
	}
	return result
}

func (b Board) Manhattan() int {
	total := 0
	for index, tile := range b.Tiles {
		if tile == 0 {
			continue
		}
		goal := tile - 1
		row, col := index/b.Size, index%b.Size
		goalRow, goalCol := goal/b.Size, goal%b.Size
		total += abs(row-goalRow) + abs(col-goalCol)
	}
	return total
}

func Random(size, scramble int) (Board, error) {
	if size < MinSize || size > MaxSize {
		return Board{}, fmt.Errorf("%w: size must be between %d and %d", ErrInvalidBoard, MinSize, MaxSize)
	}
	if scramble < 1 || scramble > 200 {
		return Board{}, fmt.Errorf("%w: scramble must be between 1 and 200", ErrInvalidBoard)
	}
	board := Goal(size)
	previous := ""
	for range scramble {
		neighbors := board.Neighbors()
		choices := neighbors[:0]
		for _, neighbor := range neighbors {
			if opposite(neighbor.Move) != previous || len(neighbors) == 1 {
				choices = append(choices, neighbor)
			}
		}
		chosen := choices[rand.IntN(len(choices))]
		board = chosen.Board
		previous = chosen.Move
	}
	if board.IsGoal() {
		board = board.Neighbors()[rand.IntN(len(board.Neighbors()))].Board
	}
	return board, nil
}

func opposite(move string) string {
	switch move {
	case "up":
		return "down"
	case "right":
		return "left"
	case "down":
		return "up"
	default:
		return "right"
	}
}

func abs(value int) int {
	if value < 0 {
		return -value
	}

	return value
}
