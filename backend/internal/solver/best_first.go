package solver

import (
	"container/heap"
	"context"
	"time"

	"github.com/liel-almog/go-algorithm-playground/internal/puzzle"
)

type AStar struct{}
type Greedy struct{}

func (AStar) Metadata() Metadata {
	return Metadata{ID: "astar", Name: "A* search", Description: "Balances distance travelled with Manhattan distance to find a shortest path efficiently.", Optimal: true, Category: "informed"}
}

func (Greedy) Metadata() Metadata {
	return Metadata{ID: "greedy", Name: "Greedy best-first", Description: "Chases the state nearest to the goal. Fast, but its route may cost more moves.", Optimal: false, Category: "informed"}
}

func (algorithm AStar) Solve(ctx context.Context, initial puzzle.Board) (Result, error) {
	return solveBestFirst(ctx, initial, algorithm.Metadata(), false)
}

func (algorithm Greedy) Solve(ctx context.Context, initial puzzle.Board) (Result, error) {
	return solveBestFirst(ctx, initial, algorithm.Metadata(), true)
}

type searchNode struct {
	board    puzzle.Board
	priority int
	cost     int
	order    int
}

type priorityQueue []searchNode

func (q priorityQueue) Len() int { return len(q) }
func (q priorityQueue) Less(i, j int) bool {
	if q[i].priority == q[j].priority {
		return q[i].order < q[j].order
	}
	return q[i].priority < q[j].priority
}
func (q priorityQueue) Swap(i, j int)   { q[i], q[j] = q[j], q[i] }
func (q *priorityQueue) Push(value any) { *q = append(*q, value.(searchNode)) }
func (q *priorityQueue) Pop() any {
	old := *q
	item := old[len(old)-1]
	*q = old[:len(old)-1]
	return item
}

func solveBestFirst(ctx context.Context, initial puzzle.Board, meta Metadata, greedy bool) (Result, error) {
	start := time.Now()
	initialKey := initial.Key()
	parents := map[string]parentStep{initialKey: {board: initial}}
	bestCost := map[string]int{initialKey: 0}
	queue := &priorityQueue{{board: initial, priority: initial.Manhattan()}}
	heap.Init(queue)
	expanded, generated, frontierMax, order := 0, 1, 1, 1
	for queue.Len() > 0 {
		if err := ctx.Err(); err != nil {
			return Result{}, err
		}
		current := heap.Pop(queue).(searchNode)
		key := current.board.Key()
		if known := bestCost[key]; current.cost != known {
			continue
		}
		if current.board.IsGoal() {
			return finish(meta, start, key, parents, expanded, generated, frontierMax), nil
		}
		expanded++
		for _, neighbor := range current.board.Neighbors() {
			nextKey := neighbor.Board.Key()
			nextCost := current.cost + 1
			known, seen := bestCost[nextKey]
			if seen && nextCost >= known {
				continue
			}
			bestCost[nextKey] = nextCost
			parents[nextKey] = parentStep{previous: key, board: neighbor.Board, move: neighbor.Move}
			priority := neighbor.Board.Manhattan()
			if !greedy {
				priority += nextCost
			}
			heap.Push(queue, searchNode{board: neighbor.Board, priority: priority, cost: nextCost, order: order})
			order++
			generated++
		}
		if queue.Len() > frontierMax {
			frontierMax = queue.Len()
		}
	}
	return Result{}, ErrNoSolution
}
