// Package matrixverify implements Freivalds' randomized matrix product check.
package matrixverify

import (
	"context"
	"errors"
	"math/rand/v2"
)

const (
	maxSize   = 10
	maxRounds = 10
)

type Matrix [][]int64

type Claim struct {
	A       Matrix `json:"a"`
	B       Matrix `json:"b"`
	Product Matrix `json:"product"`
}

type Trial struct {
	Vector []int64 `json:"vector"`
	Left   []int64 `json:"left"`
	Right  []int64 `json:"right"`
	Passed bool    `json:"passed"`
}

type Result struct {
	Algorithm          string  `json:"algorithm"`
	Accepted           bool    `json:"accepted"`
	Trials             []Trial `json:"trials"`
	FalsePositiveBound float64 `json:"falsePositiveBound"`
}

func Generate(size int) (Claim, error) {
	if size < 2 || size > maxSize {
		return Claim{}, errors.New("matrix size must be between 2 and 10")
	}
	a := randomMatrix(size)
	b := randomMatrix(size)
	return Claim{A: a, B: b, Product: multiply(a, b)}, nil
}

func Solve(ctx context.Context, a, b, product Matrix, rounds int) (Result, error) {
	if rounds < 1 || rounds > maxRounds {
		return Result{}, errors.New("rounds must be between 1 and 10")
	}
	size, err := validateMatrices(a, b, product)
	if err != nil {
		return Result{}, err
	}

	result := Result{
		Algorithm:          "freivalds",
		Accepted:           true,
		Trials:             make([]Trial, 0, rounds),
		FalsePositiveBound: 1 / float64(uint64(1)<<rounds),
	}
	for range rounds {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		vector := make([]int64, size)
		for i := range vector {
			vector[i] = int64(rand.IntN(2))
		}
		left := multiplyVector(a, multiplyVector(b, vector))
		right := multiplyVector(product, vector)
		passed := equal(left, right)
		result.Trials = append(result.Trials, Trial{Vector: vector, Left: left, Right: right, Passed: passed})
		if !passed {
			result.Accepted = false
		}
	}
	return result, nil
}

func validateMatrices(matrices ...Matrix) (int, error) {
	size := len(matrices[0])
	if size < 2 || size > maxSize {
		return 0, errors.New("matrices must be between 2x2 and 10x10")
	}
	for _, matrix := range matrices {
		if len(matrix) != size {
			return 0, errors.New("a, b, and product must have the same dimensions")
		}
		for _, row := range matrix {
			if len(row) != size {
				return 0, errors.New("all matrices must be square")
			}
			for _, value := range row {
				if value < -1_000_000 || value > 1_000_000 {
					return 0, errors.New("matrix values must be between -1000000 and 1000000")
				}
			}
		}
	}
	return size, nil
}

func randomMatrix(size int) Matrix {
	matrix := make(Matrix, size)
	for row := range matrix {
		matrix[row] = make([]int64, size)
		for column := range matrix[row] {
			matrix[row][column] = int64(rand.IntN(7) - 3)
		}
	}
	return matrix
}

func multiply(a, b Matrix) Matrix {
	result := make(Matrix, len(a))
	for row := range result {
		result[row] = make([]int64, len(a))
		for column := range result[row] {
			for i := range a[row] {
				result[row][column] += a[row][i] * b[i][column]
			}
		}
	}
	return result
}

func multiplyVector(matrix Matrix, vector []int64) []int64 {
	result := make([]int64, len(matrix))
	for row := range matrix {
		for column, value := range matrix[row] {
			result[row] += value * vector[column]
		}
	}
	return result
}

func equal(a, b []int64) bool {
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
