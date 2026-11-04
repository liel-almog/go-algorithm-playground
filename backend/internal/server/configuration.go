package server

import (
	"log/slog"
	"os"
	"strconv"
	"strings"
)

const defaultPort = "8080"

func AllowedOriginsFromEnv() []string {
	value := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if value == "" {
		return []string{"*"}
	}
	result := make([]string, 0)
	for _, part := range strings.Split(value, ",") {
		if origin := strings.TrimSpace(part); origin != "" {
			result = append(result, origin)
		}
	}
	return result
}

func ParsePort() string {
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		return defaultPort
	}
	value, err := strconv.Atoi(port)
	if err != nil || value < 1 || value > 65535 {
		slog.Warn("invalid PORT; using default", "port", port, "default", defaultPort)
		return defaultPort
	}
	return strconv.Itoa(value)
}
