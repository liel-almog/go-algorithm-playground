FROM golang:1.27 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 go build -mod=readonly -trimpath -ldflags="-s -w" -o /algorithm-playground ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /algorithm-playground /algorithm-playground
EXPOSE 8080
ENTRYPOINT ["/algorithm-playground"]
