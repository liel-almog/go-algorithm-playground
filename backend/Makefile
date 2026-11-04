.PHONY: run test build fmt fmt-check vet check

run:
	air -c .air.toml

test:
	go test ./...

build:
	go build -o bin/algorithm-playground ./cmd/server

fmt:
	gofmt -w $$(find . -name '*.go' -not -path './.git/*')

fmt-check:
	@test -z "$$(gofmt -l cmd internal)" || (gofmt -l cmd internal; exit 1)

vet:
	go vet ./...

check: fmt-check vet test build
