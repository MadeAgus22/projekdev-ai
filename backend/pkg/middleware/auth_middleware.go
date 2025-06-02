package middleware

import (
	"strings"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/config" // Sesuaikan path
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"  // Sesuaikan path

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// JWTMiddleware memverifikasi token JWT
func JWTMiddleware() fiber.Handler {
	cfg := config.AppConfig
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Header Authorization tidak ada")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Format header Authorization tidak valid (expected: Bearer <token>)")
		}

		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Metode signing token tidak terduga")
			}
			return []byte(cfg.JWTSecretKey), nil
		})

		if err != nil {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Token tidak valid atau kedaluwarsa", err.Error())
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Simpan informasi user dari token ke Locals untuk digunakan di handler selanjutnya
			// Pastikan tipe data sesuai saat mengambil dari c.Locals()
			c.Locals("user_id", uint(claims["user_id"].(float64))) // JWT numbers are float64
			c.Locals("username", claims["username"].(string))
			c.Locals("role", claims["role"].(string))
			return c.Next()
		}

		return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Klaim token tidak valid")
	}
}

// AuthorizeRole adalah middleware untuk membatasi akses berdasarkan role
func AuthorizeRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		currentRole, ok := c.Locals("role").(string)
		if !ok {
			return utils.ErrorResponse(c, fiber.StatusForbidden, "Role pengguna tidak dapat diidentifikasi")
		}

		for _, role := range allowedRoles {
			if currentRole == role {
				return c.Next()
			}
		}
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Anda tidak memiliki izin untuk mengakses sumber daya ini")
	}
}
