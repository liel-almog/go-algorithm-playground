package puzzle

import "testing"

func TestRectangularBoard(t *testing.T) {
	board, err := New(2, 3, []int{1, 2, 3, 4, 0, 5})
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}

	if !board.IsSolvable() {
		t.Fatal("expected board to be solvable")
	}
	if board.Manhattan() != 1 {
		t.Fatalf("Manhattan() = %d, want 1", board.Manhattan())
	}
	if got := len(board.Neighbors()); got != 3 {
		t.Fatalf("len(Neighbors()) = %d, want 3", got)
	}
}

func TestRectangularBoardRejectsWrongTileCount(t *testing.T) {
	if _, err := New(2, 3, []int{1, 2, 3, 4}); err == nil {
		t.Fatal("New() accepted a tile count that does not match rows * columns")
	}
}

func TestRectangularBoardSolvabilityUsesColumnCount(t *testing.T) {
	board, err := New(3, 2, []int{1, 2, 3, 4, 0, 5})
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}
	if !board.IsSolvable() {
		t.Fatal("expected board reached by one legal move from the goal to be solvable")
	}

	unsolvable, err := New(3, 2, []int{2, 1, 3, 4, 5, 0})
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}
	if unsolvable.IsSolvable() {
		t.Fatal("expected swapped tiles to be unsolvable")
	}
}
