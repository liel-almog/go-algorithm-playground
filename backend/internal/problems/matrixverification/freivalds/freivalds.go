// Package freivalds implements Freivalds' randomized matrix product check.
package freivalds

import (
	"context"
	"encoding/json"
	"errors"
	"math/rand/v2"

	"gonum.org/v1/gonum/mat"
)

const (
	maxSize    = 100
	maxRounds  = 15
	binaryZero = float64(0)
	binaryOne  = float64(1)
)

type Matrix [][]float64

// UnmarshalJSON preserves the distinction between a binary value and JSON null.
func (m *Matrix) UnmarshalJSON(data []byte) error {
	var rows [][]*float64
	if err := json.Unmarshal(data, &rows); err != nil {
		return err
	}

	matrix := make(Matrix, len(rows))
	for i, row := range rows {
		matrix[i] = make([]float64, len(row))
		for j, value := range row {
			if value == nil || (*value != binaryZero && *value != binaryOne) {
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
	Vector []float64 `json:"vector"`
	Left   []float64 `json:"left"`
	Right  []float64 `json:"right"`
	Passed bool      `json:"passed"`
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
		b[row] = make([]float64, size)
		b[row][column] = binaryOne
	}
	var product mat.Dense
	product.Mul(denseMatrix(a), denseMatrix(b))
	productRows := make(Matrix, size)
	for row := range productRows {
		productRows[row] = mat.Row(nil, row, &product)
	}
	return Claim{A: a, B: b, Product: productRows}, nil
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
	denseA, denseB, denseProduct := denseMatrix(a), denseMatrix(b), denseMatrix(product)
	for range rounds {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}

		vector := make([]float64, size)
		for i := range vector {
			vector[i] = randomBinaryValue()
		}

		randomVector := mat.NewVecDense(size, vector)
		var intermediate, left, right mat.VecDense
		intermediate.MulVec(denseB, randomVector)
		left.MulVec(denseA, &intermediate)
		right.MulVec(denseProduct, randomVector)

		passed := mat.Equal(&left, &right)
		result.Trials = append(result.Trials, Trial{
			Vector: vector,
			Left:   left.RawVector().Data,
			Right:  right.RawVector().Data,
			Passed: passed,
		})
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
				if value != binaryZero && value != binaryOne {
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
		matrix[row] = make([]float64, size)
		for column := range matrix[row] {
			matrix[row][column] = randomBinaryValue()
		}
	}
	return matrix
}

func randomBinaryValue() float64 {
	return float64(rand.IntN(2))
}

func denseMatrix(matrix Matrix) *mat.Dense {
	size := len(matrix)
	data := make([]float64, 0, size*size)
	for _, row := range matrix {
		data = append(data, row...)
	}
	return mat.NewDense(size, size, data)
}
