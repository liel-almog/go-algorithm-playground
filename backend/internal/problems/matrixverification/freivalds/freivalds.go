// Package freivalds implements Freivalds' randomized matrix product check.
package freivalds

import (
	"context"
	"encoding/json"
	"errors"
	"math/rand/v2"
)

const (
	maxSize   = 100
	maxRounds = 15
)

type Matrix [][]int64

// UnmarshalJSON preserves the distinction between a binary value and JSON null.
func (m *Matrix) UnmarshalJSON(data []byte) error {
	var rows [][]*int64
	if err := json.Unmarshal(data, &rows); err != nil {
		return err
	}
	matrix := make(Matrix, len(rows))
	for i, row := range rows {
		matrix[i] = make([]int64, len(row))
		for j, value := range row {
			if value == nil || (*value != 0 && *value != 1) {
				return errors.New("matrix values must be 0 or 1")
			}
			matrix[i][j] = *value
		}
	}
	*m = matrix
	return nil
}

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
	if size < 1 || size > maxSize {
		return Claim{}, errors.New("matrix size must be between 1 and 100")
	}
	a := randomMatrix(size)
	b := make(Matrix, size)
	for row, column := range rand.Perm(size) {
		b[row] = make([]int64, size)
		b[row][column] = 1
	}
	return Claim{A: a, B: b, Product: multiply(a, b)}, nil
}

func Solve(ctx context.Context, a, b, product Matrix, rounds int) (Result, error) {
	if rounds < 1 || rounds > maxRounds {
		return Result{}, errors.New("rounds must be between 1 and 15")
	}
	size, err := ValidateMatrices(a, b, product)
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

// ValidateMatrices checks that A, B, and C are equally sized binary square matrices.
func ValidateMatrices(a, b, c Matrix) (int, error) {
	size := len(a)
	if size < 1 || size > maxSize {
		return 0, errors.New("matrices must be square with a size between 1 and 100")
	}
	for _, matrix := range [...]Matrix{a, b, c} {
		if len(matrix) != size {
			return 0, errors.New("a, b, and c must have the same dimensions")
		}
		for _, row := range matrix {
			if len(row) != size {
				return 0, errors.New("all matrices must be square")
			}
			for _, value := range row {
				if value != 0 && value != 1 {
					return 0, errors.New("matrix values must be 0 or 1")
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
			matrix[row][column] = int64(rand.IntN(2))
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
