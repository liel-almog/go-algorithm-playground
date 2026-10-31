.PHONY: run test build fmt

run:
	go run ./cmd/server

test:
	go test ./...

build:
	go build -o bin/algorithm-playground ./cmd/server

fmt:
	gofmt -w $$(find . -name '*.go' -not -path './.git/*')
