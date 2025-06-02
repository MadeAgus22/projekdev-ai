package utils

import "github.com/gofiber/fiber/v2"

// SuccessResponse membuat respons JSON sukses standar
func SuccessResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(fiber.Map{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// ErrorResponse membuat respons JSON error standar
func ErrorResponse(c *fiber.Ctx, statusCode int, message string, errDetails ...string) error {
	errMap := fiber.Map{
		"success": false,
		"message": message,
	}
	if len(errDetails) > 0 && errDetails[0] != "" {
		errMap["details"] = errDetails[0]
	}
	return c.Status(statusCode).JSON(errMap)
}

// ValidationErrorResponse membuat respons untuk error validasi
func ValidationErrorResponse(c *fiber.Ctx, errors interface{}) error {
	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		"success": false,
		"message": "Data input tidak valid",
		"errors":  errors,
	})
}
