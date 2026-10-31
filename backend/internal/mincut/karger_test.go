package mincut

import (
	"context"
	"testing"
)

func TestKargerFindsTriangleMinimumCut(t *testing.T) {
	graph := Graph{
		Vertices: []string{"A", "B", "C"},
		Edges:    []Edge{{"A", "B"}, {"B", "C"}, {"C", "A"}},
	}
	result, err := Solve(context.Background(), graph, 20)
	if err != nil {
		t.Fatal(err)
	}
	if result.CutSize != 2 {
		t.Fatalf("cut size = %d, want 2", result.CutSize)
	}
	if len(result.Partitions[0])+len(result.Partitions[1]) != 3 {
		t.Fatal("partitions lost vertices")
	}
}

func TestKargerRejectsDisconnectedGraph(t *testing.T) {
	graph := Graph{Vertices: []string{"A", "B", "C"}, Edges: []Edge{{"A", "B"}}}
	if _, err := Solve(context.Background(), graph, 10); err == nil {
		t.Fatal("expected validation error")
	}
}
