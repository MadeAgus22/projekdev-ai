package handlers

import (
	"fmt"
	"strings"
	"time" // Tambahkan import time jika belum ada

	"github.com/MadeAgus22/dental-clinic-backend/pkg/database"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/dto"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/models"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var validateAuth = validator.New()

// Helper function to get permission codes for a role
func getPermissionCodesForRole(roleKode string) ([]string, error) {
	var roleWithPerms models.Role
	if err := database.DB.Preload("Permissions").Where("kode = ?", roleKode).First(&roleWithPerms).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return []string{}, fmt.Errorf("role dengan kode '%s' tidak ditemukan", roleKode)
		}
		return nil, err
	}

	var permissionKodes []string
	for _, p := range roleWithPerms.Permissions {
		permissionKodes = append(permissionKodes, p.Kode)
	}
	return permissionKodes, nil
}

func LoginUser(c *fiber.Ctx) error {
	req := new(dto.LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}

	if err := validateAuth.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error())
	}

	var user models.User
	if err := database.DB.Where("LOWER(username) = ? AND role = ?", strings.ToLower(req.Username), req.Role).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Username, password, atau peran tidak sesuai.")
		}
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	if user.Status != "aktif" {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Akun pengguna tidak aktif.")
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, "Username, password, atau peran tidak sesuai.")
	}

	// Update LastLogin
	now := time.Now()
	user.LastLogin = &now
	database.DB.Save(&user)

	token, err := utils.GenerateJWT(user.ID, user.Username, user.Role)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat token", err.Error())
	}

	permissionKodes, err := getPermissionCodesForRole(user.Role)
	if err != nil {
		// Log error tapi tetap lanjutkan login, mungkin dengan permission kosong
		fmt.Printf("Peringatan: Gagal mengambil permission untuk role %s: %v\n", user.Role, err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Login berhasil", dto.LoginResponse{
		Token:       token,
		ID:          user.ID,
		Username:    user.Username,
		NamaLengkap: user.NamaLengkap,
		Email:       user.Email,
		Role:        user.Role,
		Permissions: permissionKodes, // Sertakan permission
	})
}

func GetCurrentUser(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "User tidak ditemukan")
	}

	permissionKodes, err := getPermissionCodesForRole(user.Role)
	if err != nil {
		fmt.Printf("Peringatan: Gagal mengambil permission untuk role %s saat GetCurrentUser: %v\n", user.Role, err)
	}

	// Buat DTO UserResponse
	userResponse := dto.UserResponse{
		ID:          user.ID,
		NamaLengkap: user.NamaLengkap,
		Username:    user.Username,
		Email:       user.Email,
		Role:        user.Role,
		Status:      user.Status,
		PhoneNumber: user.PhoneNumber,
		LastLogin:   user.LastLogin,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
		Permissions: permissionKodes, // Sertakan permission
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Data user berhasil diambil", userResponse)
}

// Fungsi RegisterUser Anda (jika masih relevan dan terpisah dari RegisterUserByAdmin)
// bisa dibiarkan seperti sebelumnya atau disesuaikan jika perlu.
// Untuk saat ini, RegisterUserByAdmin di user_handler.go lebih relevan.
func RegisterUser(c *fiber.Ctx) error {
	// ... (Implementasi RegisterUser jika masih diperlukan)
	// Jika Anda menggunakan ini, pastikan juga untuk mengambil dan menyertakan permissionKodes
	// setelah user berhasil dibuat, mirip dengan LoginUser.
	return utils.ErrorResponse(c, fiber.StatusNotImplemented, "Endpoint ini mungkin tidak digunakan, gunakan /admin/users/register")
}
