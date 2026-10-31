package puzzle

import "testing"

func TestNewRejectsInvalidBoards(t *testing.T) {
	tests := []struct {
		name  string
		size  int
		tiles []int
	}{
		{"wrong length", 3, []int{1, 2, 3}},
		{"duplicate", 2, []int{0, 1, 1, 3}},
		{"out of range", 2, []int{0, 1, 2, 4}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if _, err := New(test.size, test.tiles); err == nil {
				t.Fatal("expected validation error")
			}
		})
	}
}

func TestRandomProducesValidNonGoalBoard(t *testing.T) {
	for range 20 {
		board, err := Random(3, 20)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := New(board.Size, board.Tiles); err != nil {
			t.Fatalf("generated invalid board: %v", err)
		}
		if board.IsGoal() {
			t.Fatal("expected a scrambled board")
		}
	}
}

func TestManhattan(t *testing.T) {
	board, _ := New(3, []int{1, 2, 3, 4, 5, 6, 0, 7, 8})
	if got := board.Manhattan(); got != 2 {
		t.Fatalf("Manhattan() = %d, want 2", got)
	}
}

func TestSolvability(t *testing.T) {
	solvable, _ := New(3, []int{1, 2, 3, 4, 5, 6, 0, 7, 8})
	unsolvable, _ := New(3, []int{1, 2, 3, 4, 5, 6, 8, 7, 0})
	if !solvable.IsSolvable() {
		t.Fatal("expected board to be solvable")
	}
	if unsolvable.IsSolvable() {
		t.Fatal("expected board to be unsolvable")
	}
	evenSolvable, _ := New(4, []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15})
	if !evenSolvable.IsSolvable() {
		t.Fatal("expected 4x4 board to be solvable")
	}
}
