package server

import (
	"fmt"
	"log/slog"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/liel-almog/go-algorithm-playground/internal/errors/apperrors"
)

const (
	defaultPort       = "8080"
	portEnv           = "PORT"
	allowedOriginsEnv = "CORS_ALLOWED_ORIGINS"
)

// allowedOriginsFromEnv requires at least one exact HTTP(S) origin.
func allowedOriginsFromEnv() ([]string, error) {
	value, ok := os.LookupEnv(allowedOriginsEnv)
	if !ok {
		return nil, apperrors.ErrInvalidEnv
	}

	value = strings.TrimSpace(value)
	if value == "" {
		return nil, fmt.Errorf("%s must contain at least one HTTP(S) origin: %w", allowedOriginsEnv, apperrors.ErrInvalidEnv)
	}
	var origins []string
	for _, part := range strings.Split(value, ",") {
		origin := strings.TrimSpace(part)
		if !isExactHTTPOrigin(origin) {
			return nil, fmt.Errorf("invalid %s origin %q: expected an exact HTTP(S) origin", allowedOriginsEnv, origin)
		}
		origins = append(origins, origin)
	}

	return origins, nil
}

func isExactHTTPOrigin(origin string) bool {
	parsed, err := url.Parse(origin)
	if err != nil || parsed == nil {
		return false
	}
	validScheme := parsed.Scheme == "http" || parsed.Scheme == "https"
	hasOriginShape := parsed.Hostname() != "" && parsed.User == nil &&
		parsed.Path == "" && parsed.RawQuery == "" && parsed.Fragment == ""
	return validScheme && hasOriginShape && parsed.String() == origin
}

func parsePort() string {
	port := strings.TrimSpace(os.Getenv(portEnv))
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
