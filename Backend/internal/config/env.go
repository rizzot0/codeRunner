package config

import "os"

func LoadEnv() error {
	return nil
}

func GetEnv(key string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	switch key {
	case "PORT":
		return "8080"
	default:
		return ""
	}
}