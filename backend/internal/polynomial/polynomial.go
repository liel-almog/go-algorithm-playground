// Package polynomial implements randomized polynomial identity testing over F_101.
package polynomial

import (
	"context"
	"errors"
	"math/rand/v2"
)

const Prime int64 = 101

const (
	maxDegree = 20
	maxRounds = 10
)

type Identity struct {
	Left  []int64 `json:"left"`
	Right []int64 `json:"right"`
}

type Check struct {
	Point  int64 `json:"point"`
	Left   int64 `json:"left"`
	Right  int64 `json:"right"`
	Passed bool  `json:"passed"`
}

type Result struct {
	Algorithm          string  `json:"algorithm"`
	Accepted           bool    `json:"accepted"`
	Checks             []Check `json:"checks"`
	Prime              int64   `json:"prime"`
	FalsePositiveBound float64 `json:"falsePositiveBound"`
}

func Generate(degree int) (Identity, error) {
	if degree < 1 || degree > maxDegree {
		return Identity{}, errors.New("degree must be between 1 and 20")
	}
	coefficients := make([]int64, degree+1)
	for i := range coefficients {
		coefficients[i] = int64(rand.IntN(13))
	}
	return Identity{Left: coefficients, Right: append([]int64(nil), coefficients...)}, nil
}

func Solve(ctx context.Context, left, right []int64, rounds int) (Result, error) {
	if err := validate(left, right, rounds); err != nil {
		return Result{}, err
	}
	degree := max(len(left), len(right)) - 1
	result := Result{
		Algorithm:          "schwartz-zippel",
		Accepted:           true,
		Checks:             make([]Check, 0, rounds),
		Prime:              Prime,
		FalsePositiveBound: pow(float64(degree)/float64(Prime-1), rounds),
	}
	for range rounds {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		point := int64(1 + rand.IntN(int(Prime-1)))
		leftValue := evaluate(left, point)
		rightValue := evaluate(right, point)
		passed := leftValue == rightValue
		result.Checks = append(result.Checks, Check{Point: point, Left: leftValue, Right: rightValue, Passed: passed})
		if !passed {
			result.Accepted = false
		}
	}
	return result, nil
}

func validate(left, right []int64, rounds int) error {
	if len(left) < 1 || len(left) > maxDegree+1 || len(right) < 1 || len(right) > maxDegree+1 {
		return errors.New("each polynomial must contain between 1 and 21 coefficients")
	}
	if rounds < 1 || rounds > maxRounds {
		return errors.New("rounds must be between 1 and 10")
	}
	for _, coefficients := range [][]int64{left, right} {
		for _, coefficient := range coefficients {
			if coefficient < 0 || coefficient >= Prime {
				return errors.New("coefficients must be between 0 and 100")
			}
		}
	}
	return nil
}

func evaluate(coefficients []int64, point int64) int64 {
	value := int64(0)
	for i := len(coefficients) - 1; i >= 0; i-- {
		value = (value*point + coefficients[i]) % Prime
	}
	return value
}

func pow(base float64, exponent int) float64 {
	result := 1.0
	for range exponent {
		result *= base
	}
	return result
}
