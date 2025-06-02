package utils

import (
	"fmt"
	"time"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/config" // Sesuaikan path

	"github.com/golang-jwt/jwt/v5"
)

// GenerateJWT membuat token JWT baru untuk user
func GenerateJWT(userID uint, username string, role string) (string, error) {
	cfg := config.AppConfig
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(cfg.JWTExpiry).Unix(), // Token expiry
		"iat":      time.Now().Unix(),                    // Issued at
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(cfg.JWTSecretKey))
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

// ValidateJWT memvalidasi token JWT
func ValidateJWT(tokenString string) (*jwt.Token, error) {
	cfg := config.AppConfig
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metode signing tidak terduga: %v", token.Header["alg"])
		}
		return []byte(cfg.JWTSecretKey), nil
	})
}
