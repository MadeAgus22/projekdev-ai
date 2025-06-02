package handlers

import (
	"fmt"
	"strings"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/database"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/dto"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/models"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"

	"github.com/go-playground/validator/v10" // Import validator
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// validate instance, bisa didefinisikan global di package handlers atau di-pass
var validateAuth = validator.New()

// LoginUser menghandle permintaan login
func LoginUser(c *fiber.Ctx) error {
	req := new(dto.LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}

	// Validasi input DTO
	if err := validateAuth.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error()) // Menggunakan helper response
	}

	var user models.User
	// Cari user berdasarkan username DAN role
	if err := database.DB.Where("LOWER(username) = ? AND role = ?", strings.ToLower(req.Username), req.Role).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Username, password, atau peran tidak sesuai.")
		}
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	// Cek status user
	if user.Status != "aktif" {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Akun pengguna tidak aktif.")
	}

	// Verifikasi password
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Username, password, atau peran tidak sesuai.")
	}

	// Generate JWT Token
	token, err := utils.GenerateJWT(user.ID, user.Username, user.Role)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat token", err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Login berhasil", dto.LoginResponse{
		Token:       token,
		ID:          user.ID,
		Username:    user.Username,
		NamaLengkap: user.NamaLengkap,
		Email:       user.Email,
		Role:        user.Role,
	})
}

// RegisterUser (contoh, mungkin hanya bisa dilakukan oleh admin)
func RegisterUser(c *fiber.Ctx) error {
	req := new(dto.RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}
	if err := validateAuth.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error())
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal hashing password", err.Error())
	}

	status := "aktif"
	if req.Status != "" {
		status = req.Status
	}

	newUser := models.User{
		NamaLengkap:  req.NamaLengkap,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Role:         req.Role,
		Status:       status,
		PhoneNumber:  req.PhoneNumber,
	}

	// Cek apakah username atau email sudah ada
	var existingUser models.User
	if err := database.DB.Where("username = ? OR email = ?", newUser.Username, newUser.Email).First(&existingUser).Error; err == nil {
		if existingUser.Username == newUser.Username {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Username '%s' sudah digunakan.", newUser.Username))
		}
		if existingUser.Email == newUser.Email {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Email '%s' sudah digunakan.", newUser.Email))
		}
	} else if err != gorm.ErrRecordNotFound {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server saat memeriksa user", err.Error())
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat user baru", err.Error())
	}

	// Jangan kirim password hash dalam response
	newUser.PasswordHash = ""
	return utils.SuccessResponse(c, fiber.StatusCreated, "User berhasil diregistrasi", newUser)
}

// GetCurrentUser (contoh, membutuhkan middleware autentikasi)
func GetCurrentUser(c *fiber.Ctx) error {
	// User ID dan role biasanya diambil dari klaim JWT di middleware
	userID := c.Locals("user_id").(uint) // Asumsi middleware menyimpan user_id sebagai uint

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "User tidak ditemukan")
	}
	user.PasswordHash = "" // Jangan kirim hash
	return utils.SuccessResponse(c, fiber.StatusOK, "Data user berhasil diambil", user)
}
