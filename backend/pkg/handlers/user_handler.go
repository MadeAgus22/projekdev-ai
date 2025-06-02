package handlers

import (
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/database"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/dto"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/models"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// userValidate instance, bisa didefinisikan global di package handlers atau di-pass
var userValidate = validator.New()

// RegisterUserByAdmin mendaftarkan pengguna baru (biasanya oleh admin)
func RegisterUserByAdmin(c *fiber.Ctx) error {
	req := new(dto.CreateUserRequest)
	if err := c.BodyParser(req); err != nil {
		fmt.Printf("[RegisterUserByAdmin] Error parsing body: %v. Body: %s\n", err, string(c.Body()))
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid, format body salah", err.Error())
	}

	fmt.Printf("[RegisterUserByAdmin] Received CreateUserRequest: %+v\n", req)

	if err := userValidate.Struct(req); err != nil {
		fmt.Printf("[RegisterUserByAdmin] Validation errors: %+v\n", err)
		var errors []string
		for _, errValidation := range err.(validator.ValidationErrors) {
			errors = append(errors, fmt.Sprintf("Field '%s' gagal validasi pada tag '%s' (nilai: '%v')", errValidation.Field(), errValidation.Tag(), errValidation.Value()))
		}
		return utils.ValidationErrorResponse(c, errors)
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal hashing password", err.Error())
	}

	status := "aktif" // Default status
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

	// Cek duplikasi username atau email
	var existingUser models.User
	errCheck := database.DB.Where("LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)", req.Username, req.Email).First(&existingUser).Error
	if errCheck == nil { // Jika tidak ada error, berarti user ditemukan (sudah ada)
		if strings.ToLower(existingUser.Username) == strings.ToLower(req.Username) {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Username '%s' sudah digunakan.", req.Username))
		}
		if strings.ToLower(existingUser.Email) == strings.ToLower(req.Email) {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Email '%s' sudah digunakan.", req.Email))
		}
	} else if errCheck != gorm.ErrRecordNotFound {
		// Jika errornya bukan karena tidak ditemukan, berarti ada masalah lain dengan DB
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server saat memeriksa pengguna", errCheck.Error())
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat pengguna baru", err.Error())
	}

	responseUser := dto.UserResponse{
		ID:          newUser.ID,
		NamaLengkap: newUser.NamaLengkap,
		Username:    newUser.Username,
		Email:       newUser.Email,
		Role:        newUser.Role,
		Status:      newUser.Status,
		PhoneNumber: newUser.PhoneNumber,
		CreatedAt:   newUser.CreatedAt,
		UpdatedAt:   newUser.UpdatedAt,
	}
	return utils.SuccessResponse(c, fiber.StatusCreated, "Pengguna berhasil diregistrasi", responseUser)
}

// GetAllUsers mengambil semua pengguna dengan pagination dan search
func GetAllUsers(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	if limit <= 0 {
		limit = 10 // Default limit jika tidak valid atau 0
	}
	if page <= 0 {
		page = 1 // Halaman tidak boleh kurang dari 1
	}

	offset := (page - 1) * limit
	search := strings.ToLower(c.Query("search", "")) // Konversi search ke lowercase

	var users []models.User
	var totalRecords int64

	query := database.DB.Model(&models.User{})
	countQuery := database.DB.Model(&models.User{})

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("LOWER(nama_lengkap) LIKE ? OR LOWER(username) LIKE ? OR LOWER(email) LIKE ?", searchPattern, searchPattern, searchPattern)
		countQuery = countQuery.Where("LOWER(nama_lengkap) LIKE ? OR LOWER(username) LIKE ? OR LOWER(email) LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	if err := countQuery.Count(&totalRecords).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menghitung total pengguna", err.Error())
	}

	// Hanya query data jika totalRecords > 0 atau tidak ada pencarian (untuk kasus awal)
	// dan pastikan limit tidak menyebabkan error jika totalRecords kecil
	if totalRecords > 0 || search == "" {
		if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data pengguna", err.Error())
		}
	}

	userResponses := []dto.UserResponse{}
	for _, user := range users {
		userResponses = append(userResponses, dto.UserResponse{
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
		})
	}

	totalPages := 0
	if limit > 0 && totalRecords > 0 { // Pastikan limit > 0 dan ada record sebelum pembagian
		totalPages = int(math.Ceil(float64(totalRecords) / float64(limit)))
	} else if totalRecords == 0 {
		totalPages = 0 // Atau 1 jika Anda ingin selalu ada minimal 1 halaman
	}

	paginationData := fiber.Map{
		"currentPage":  page,
		"totalPages":   totalPages,
		"totalRecords": totalRecords,
		"pageSize":     limit,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success":    true,
		"data":       userResponses,
		"pagination": paginationData,
		"message":    "Data pengguna berhasil diambil",
	})
}

// GetUserByID mengambil pengguna berdasarkan ID
func GetUserByID(c *fiber.Ctx) error {
	userIDParam := c.Params("userId")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "User ID tidak valid: harus berupa angka positif")
	}

	var user models.User
	if err := database.DB.First(&user, uint(userID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pengguna tidak ditemukan")
		}
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	responseUser := dto.UserResponse{
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
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Data pengguna berhasil diambil", responseUser)
}

// UpdateUser memperbarui data pengguna
func UpdateUser(c *fiber.Ctx) error {
	userIDParam := c.Params("userId")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "User ID tidak valid")
	}

	var user models.User
	if err := database.DB.First(&user, uint(userID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pengguna tidak ditemukan")
		}
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	req := new(dto.UpdateUserRequest)
	if err := c.BodyParser(req); err != nil {
		fmt.Printf("[UpdateUser] Error parsing body: %v. Body: %s\n", err, string(c.Body()))
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}
	fmt.Printf("[UpdateUser] Received UpdateUserRequest for ID %d: %+v\n", userID, req)

	if err := userValidate.Struct(req); err != nil {
		fmt.Printf("[UpdateUser] Validation errors: %+v\n", err)
		var errors []string
		for _, errValidation := range err.(validator.ValidationErrors) {
			errors = append(errors, fmt.Sprintf("Field '%s' gagal validasi pada tag '%s' (nilai: '%v')", errValidation.Field(), errValidation.Tag(), errValidation.Value()))
		}
		return utils.ValidationErrorResponse(c, errors)
	}

	// Cek duplikasi username atau email jika diubah dan berbeda dari user lain
	var existingUser models.User
	if req.Username != "" && strings.ToLower(req.Username) != strings.ToLower(user.Username) {
		if errDb := database.DB.Where("LOWER(username) = LOWER(?) AND id != ?", req.Username, user.ID).First(&existingUser).Error; errDb == nil {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Username '%s' sudah digunakan oleh pengguna lain.", req.Username))
		} else if errDb != gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server saat memeriksa username", errDb.Error())
		}
	}
	if req.Email != "" && strings.ToLower(req.Email) != strings.ToLower(user.Email) {
		if errDb := database.DB.Where("LOWER(email) = LOWER(?) AND id != ?", req.Email, user.ID).First(&existingUser).Error; errDb == nil {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Email '%s' sudah digunakan oleh pengguna lain.", req.Email))
		} else if errDb != gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server saat memeriksa email", errDb.Error())
		}
	}

	// Update fields yang diizinkan
	if req.NamaLengkap != "" {
		user.NamaLengkap = req.NamaLengkap
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.Status != "" {
		user.Status = req.Status
	}
	if req.PhoneNumber != "" {
		user.PhoneNumber = req.PhoneNumber
	}

	if req.Password != "" { // Jika password ingin diubah
		hashedPassword, errHash := utils.HashPassword(req.Password)
		if errHash != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal hashing password baru", errHash.Error())
		}
		user.PasswordHash = hashedPassword
	}

	if err := database.DB.Save(&user).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal memperbarui pengguna", err.Error())
	}

	responseUser := dto.UserResponse{
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
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Data pengguna berhasil diperbarui", responseUser)
}

// DeleteUser menghapus pengguna (soft delete)
func DeleteUser(c *fiber.Ctx) error {
	userIDParam := c.Params("userId")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "User ID tidak valid")
	}

	var user models.User
	if err := database.DB.First(&user, uint(userID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pengguna tidak ditemukan")
		}
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menghapus pengguna", err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Pengguna berhasil dihapus (dinonaktifkan)", nil)
}
