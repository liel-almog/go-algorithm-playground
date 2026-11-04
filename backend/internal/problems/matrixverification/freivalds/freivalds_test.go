package freivalds

import (
	"context"
	"reflect"
	"testing"
)

func TestSolveAcceptsCorrectMatrixProduct(t *testing.T) {
	a := Matrix{{1, 1}, {0, 1}}
	b := Matrix{{0, 1}, {1, 0}}
	product := Matrix{{1, 1}, {1, 0}}

	result, err := Solve(context.Background(), a, b, product, 3)
	if err != nil {
		t.Fatalf("Solve() error = %v", err)
	}
	if !result.Accepted {
		t.Fatal("Solve() rejected a correct matrix product")
	}
	if len(result.Trials) != 3 {
		t.Fatalf("len(Trials) = %d, want 3", len(result.Trials))
	}
	if result.FalsePositiveBound != 0.125 {
		t.Fatalf("FalsePositiveBound = %v, want 0.125", result.FalsePositiveBound)
	}
	for i, trial := range result.Trials {
		if !trial.Passed || !reflect.DeepEqual(trial.Left, trial.Right) {
			t.Fatalf("trial %d failed for a correct product: %+v", i, trial)
		}
	}
}

func TestSolveRejectsIncorrectMatrixProduct(t *testing.T) {
	const size = 10
	a := make(Matrix, size)
	b := make(Matrix, size)
	product := make(Matrix, size)
	for i := range a {
		a[i] = make([]float64, size)
		b[i] = make([]float64, size)
		product[i] = make([]float64, size)
		product[i][i] = 1
	}

	result, err := Solve(context.Background(), a, b, product, 10)
	if err != nil {
		t.Fatalf("Solve() error = %v", err)
	}
	if result.Accepted {
		t.Fatal("Solve() accepted an incorrect matrix product")
	}
	if len(result.Trials) != 10 {
		t.Fatalf("len(Trials) = %d, want 10", len(result.Trials))
	}
	for i, trial := range result.Trials {
		if trial.Passed != reflect.DeepEqual(trial.Left, trial.Right) {
			t.Fatalf("trial %d passed flag disagrees with its vectors: %+v", i, trial)
		}
	}
}
