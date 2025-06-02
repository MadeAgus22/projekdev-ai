package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config struct
type Config struct {
	Port         int
	DBHost       string
	DBPort       int
	DBUser       string
	DBPassword   string
	DBName       string
	DBSSLMode    string
	DBTimezone   string
	JWTSecretKey string
	JWTExpiry    time.Duration
}

var AppConfig *Config

// LoadConfig memuat konfigurasi dari .env atau environment variables
func LoadConfig() error {
	err := godotenv.Load() // Memuat .env, abaikan error jika file tidak ada (misalnya di produksi)
	if err != nil && !os.IsNotExist(err) {
		fmt.Println("Peringatan: Error memuat file .env:", err)
	}

	portStr := getEnv("PORT", "8080")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return fmt.Errorf("PORT tidak valid: %w", err)
	}

	dbPortStr := getEnv("DB_PORT", "5432")
	dbPort, err := strconv.Atoi(dbPortStr)
	if err != nil {
		return fmt.Errorf("DB_PORT tidak valid: %w", err)
	}

	jwtExpiryHoursStr := getEnv("JWT_EXPIRY_HOURS", "72")
	jwtExpiryHours, err := strconv.Atoi(jwtExpiryHoursStr)
	if err != nil {
		return fmt.Errorf("JWT_EXPIRY_HOURS tidak valid: %w", err)
	}

	AppConfig = &Config{
		Port:         port,
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       dbPort,
		DBUser:       getEnv("DB_USER", "klinik"),
		DBPassword:   getEnv("DB_PASSWORD", "pasadminkliniksword"),
		DBName:       getEnv("DB_NAME", "klinikgigi"),
		DBSSLMode:    getEnv("DB_SSLMODE", "disable"),
		DBTimezone:   getEnv("DB_TIMEZONE", "Asia/Jakarta"),
		JWTSecretKey: getEnv("JWT_SECRET_KEY", "your-secret-key-should-be-long-and-random"),
		JWTExpiry:    time.Duration(jwtExpiryHours) * time.Hour,
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
