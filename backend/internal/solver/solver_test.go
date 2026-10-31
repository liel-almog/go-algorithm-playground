package solver

import (
	"context"
	"testing"

	"github.com/liel-almog/go-algorithm-playground/internal/puzzle"
)

func TestDefaultAlgorithmsSolveKnownBoard(t *testing.T) {
	board, err := puzzle.New(3, []int{1, 2, 3, 4, 5, 6, 0, 7, 8})
	if err != nil {
		t.Fatal(err)
	}
	registry := DefaultRegistry()
	for _, meta := range registry.List() {
		t.Run(meta.ID, func(t *testing.T) {
			algorithm, _ := registry.Get(meta.ID)
			result, err := algorithm.Solve(context.Background(), board)
			if err != nil {
				t.Fatal(err)
			}
			if result.MoveCount != 2 {
				t.Fatalf("MoveCount = %d, want 2", result.MoveCount)
			}
			if len(result.Path) != 3 {
				t.Fatalf("path length = %d, want 3", len(result.Path))
			}
			goal, err := puzzle.New(3, result.Path[len(result.Path)-1])
			if err != nil || !goal.IsGoal() {
				t.Fatalf("result does not end at goal: %v", err)
			}
		})
	}
}

func TestRegistryRejectsDuplicate(t *testing.T) {
	registry := NewRegistry(BFS{})
	if err := registry.Register(BFS{}); err == nil {
		t.Fatal("expected duplicate registration error")
	}
}

func TestOptimalAlgorithmsAgreeOnRandomBoards(t *testing.T) {
	for run := range 8 {
		board, err := puzzle.Random(3, 12)
		if err != nil {
			t.Fatal(err)
		}
		bfs, err := (BFS{}).Solve(context.Background(), board)
		if err != nil {
			t.Fatalf("run %d BFS: %v", run, err)
		}
		astar, err := (AStar{}).Solve(context.Background(), board)
		if err != nil {
			t.Fatalf("run %d A*: %v", run, err)
		}
		if bfs.MoveCount != astar.MoveCount {
			t.Fatalf("run %d: BFS cost %d != A* cost %d", run, bfs.MoveCount, astar.MoveCount)
		}
	}
}
