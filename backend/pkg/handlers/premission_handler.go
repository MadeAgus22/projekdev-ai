package handlers

import (
	"github.com/MadeAgus22/dental-clinic-backend/pkg/database"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/dto"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/models"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

// GetAllPermissions mengambil semua permission yang tersedia
func GetAllPermissions(c *fiber.Ctx) error {
	var permissions []models.Permission
	// Urutkan berdasarkan grup lalu nama untuk tampilan yang lebih teratur di frontend
	if err := database.DB.Order("grup asc, nama asc").Find(&permissions).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data permission", err.Error())
	}

	permissionResponses := []dto.PermissionResponse{}
	for _, p := range permissions {
		permissionResponses = append(permissionResponses, dto.PermissionResponse{
			ID:        p.ID,
			Nama:      p.Nama,
			Kode:      p.Kode,
			Deskripsi: p.Deskripsi,
			Grup:      p.Grup,
			CreatedAt: p.CreatedAt,
			UpdatedAt: p.UpdatedAt,
		})
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Data permission berhasil diambil", permissionResponses)
}

// TODO: Tambahkan handler CreatePermission, UpdatePermission, DeletePermission jika Anda ingin
// mengelola permission melalui API. Biasanya, permission lebih statis dan bisa di-seed.
// Jika Anda membuat CRUD untuk permission, pastikan juga membuat DTO yang sesuai.
