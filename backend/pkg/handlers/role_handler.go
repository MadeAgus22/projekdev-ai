package handlers

import (
	"fmt"
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

var roleValidate = validator.New()

// mapPermissionsToSimpleDTO adalah helper untuk mengubah []models.Permission menjadi []dto.PermissionSimpleDTO
func mapPermissionsToSimpleDTO(permissions []models.Permission) []dto.PermissionSimpleDTO {
	var dtos []dto.PermissionSimpleDTO
	if permissions == nil { // Tambahkan pengecekan nil untuk menghindari panic
		return dtos
	}
	for _, p := range permissions {
		dtos = append(dtos, dto.PermissionSimpleDTO{
			ID:   p.ID,
			Kode: p.Kode,
			Nama: p.Nama,
			Grup: p.Grup, // Pastikan field 'Grup' ada dan diekspor di dto.PermissionSimpleDTO
		})
	}
	return dtos
}

// CreateRole membuat role baru beserta hak aksesnya
func CreateRole(c *fiber.Ctx) error {
	req := new(dto.CreateRoleRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}
	if err := roleValidate.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error())
	}

	var existingRole models.Role
	if err := database.DB.Where("LOWER(kode) = LOWER(?)", req.Kode).First(&existingRole).Error; err == nil {
		return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Role dengan kode '%s' sudah ada.", req.Kode))
	} else if err != gorm.ErrRecordNotFound {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	newRole := models.Role{
		Nama:      req.Nama,
		Kode:      strings.ToLower(req.Kode),
		Deskripsi: req.Deskripsi,
	}

	var permissionsToAssign []models.Permission
	if len(req.PermissionKodes) > 0 {
		if err := database.DB.Where("kode IN ?", req.PermissionKodes).Find(&permissionsToAssign).Error; err != nil {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data permission untuk assignment", err.Error())
		}
		if len(permissionsToAssign) != len(req.PermissionKodes) {
			return utils.ErrorResponse(c, fiber.StatusBadRequest, "Satu atau lebih kode permission tidak valid/tidak ditemukan.")
		}
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&newRole).Error; err != nil {
			return err
		}
		if len(permissionsToAssign) > 0 {
			// GORM akan menghapus asosiasi lama dan menambahkan yang baru dengan Replace
			if err := tx.Model(&newRole).Association("Permissions").Replace(&permissionsToAssign); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat role baru", err.Error())
	}

	// Load ulang role dengan permissions untuk respons yang akurat
	var createdRoleWithPermissions models.Role
	database.DB.Preload("Permissions").First(&createdRoleWithPermissions, newRole.ID)

	return utils.SuccessResponse(c, fiber.StatusCreated, "Role berhasil dibuat", dto.RoleResponse{
		ID: createdRoleWithPermissions.ID, Nama: createdRoleWithPermissions.Nama, Kode: createdRoleWithPermissions.Kode, Deskripsi: createdRoleWithPermissions.Deskripsi,
		Permissions: mapPermissionsToSimpleDTO(createdRoleWithPermissions.Permissions),
		CreatedAt:   createdRoleWithPermissions.CreatedAt, UpdatedAt: createdRoleWithPermissions.UpdatedAt,
	})
}

// GetAllRoles mengambil semua role
func GetAllRoles(c *fiber.Ctx) error {
	var roles []models.Role
	if err := database.DB.Preload("Permissions").Order("nama asc").Find(&roles).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data role", err.Error())
	}

	roleResponses := []dto.RoleResponse{}
	for _, role := range roles {
		roleResponses = append(roleResponses, dto.RoleResponse{
			ID:          role.ID,
			Nama:        role.Nama,
			Kode:        role.Kode,
			Deskripsi:   role.Deskripsi,
			Permissions: mapPermissionsToSimpleDTO(role.Permissions),
			CreatedAt:   role.CreatedAt,
			UpdatedAt:   role.UpdatedAt,
		})
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Data role berhasil diambil", roleResponses)
}

// GetRoleByID mengambil role berdasarkan ID
func GetRoleByID(c *fiber.Ctx) error {
	roleID, err := strconv.ParseUint(c.Params("roleId"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Role ID tidak valid")
	}
	var role models.Role
	if err := database.DB.Preload("Permissions").First(&role, uint(roleID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Role tidak ditemukan")
		}
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database", err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Data role berhasil diambil", dto.RoleResponse{
		ID: role.ID, Nama: role.Nama, Kode: role.Kode, Deskripsi: role.Deskripsi,
		Permissions: mapPermissionsToSimpleDTO(role.Permissions),
		CreatedAt:   role.CreatedAt, UpdatedAt: role.UpdatedAt,
	})
}

// UpdateRole memperbarui data role dan hak aksesnya
func UpdateRole(c *fiber.Ctx) error {
	roleID, err := strconv.ParseUint(c.Params("roleId"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Role ID tidak valid")
	}

	var role models.Role
	if err := database.DB.Preload("Permissions").First(&role, uint(roleID)).Error; err != nil { // Preload agar bisa diupdate asosiasinya
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Role tidak ditemukan")
	}

	req := new(dto.UpdateRoleRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}
	if err := roleValidate.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error())
	}

	if req.Kode != "" && strings.ToLower(req.Kode) != strings.ToLower(role.Kode) {
		var existingRole models.Role
		if errCheck := database.DB.Where("LOWER(kode) = LOWER(?) AND id != ?", req.Kode, role.ID).First(&existingRole).Error; errCheck == nil {
			return utils.ErrorResponse(c, fiber.StatusConflict, fmt.Sprintf("Role dengan kode '%s' sudah ada.", req.Kode))
		} else if errCheck != gorm.ErrRecordNotFound {
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan server database saat memeriksa kode role", errCheck.Error())
		}
	}

	// Update fields
	if req.Nama != "" {
		role.Nama = req.Nama
	}
	if req.Kode != "" {
		role.Kode = strings.ToLower(req.Kode)
	}
	if req.Deskripsi != "" {
		role.Deskripsi = req.Deskripsi
	} // Memperbolehkan deskripsi kosong jika dikirim string kosong

	errTx := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&role).Error; err != nil {
			return err
		}

		if req.PermissionKodes != nil {
			var permissionsToAssign []models.Permission
			if len(req.PermissionKodes) > 0 {
				if err := tx.Where("kode IN ?", req.PermissionKodes).Find(&permissionsToAssign).Error; err != nil {
					return err
				}
				if len(permissionsToAssign) != len(req.PermissionKodes) {
					return fmt.Errorf("satu atau lebih kode permission tidak valid/tidak ditemukan saat update")
				}
			}
			if err := tx.Model(&role).Association("Permissions").Replace(&permissionsToAssign); err != nil {
				return err
			}
		}
		return nil
	})

	if errTx != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal memperbarui role", errTx.Error())
	}

	var updatedRoleWithPermissions models.Role
	database.DB.Preload("Permissions").First(&updatedRoleWithPermissions, role.ID)

	return utils.SuccessResponse(c, fiber.StatusOK, "Role berhasil diperbarui", dto.RoleResponse{
		ID: updatedRoleWithPermissions.ID, Nama: updatedRoleWithPermissions.Nama, Kode: updatedRoleWithPermissions.Kode, Deskripsi: updatedRoleWithPermissions.Deskripsi,
		Permissions: mapPermissionsToSimpleDTO(updatedRoleWithPermissions.Permissions),
		CreatedAt:   updatedRoleWithPermissions.CreatedAt, UpdatedAt: updatedRoleWithPermissions.UpdatedAt,
	})
}

// DeleteRole menghapus role
func DeleteRole(c *fiber.Ctx) error {
	roleID, err := strconv.ParseUint(c.Params("roleId"), 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Role ID tidak valid")
	}

	var roleToDelete models.Role
	if err := database.DB.First(&roleToDelete, uint(roleID)).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Role tidak ditemukan")
	}

	var userCount int64
	database.DB.Model(&models.User{}).Where("role = ?", roleToDelete.Kode).Count(&userCount)
	if userCount > 0 {
		return utils.ErrorResponse(c, fiber.StatusConflict, "Role tidak dapat dihapus karena masih digunakan oleh pengguna.")
	}

	errTx := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&roleToDelete).Association("Permissions").Clear(); err != nil {
			return err
		}
		if err := tx.Delete(&roleToDelete).Error; err != nil { // GORM akan soft delete jika DeletedAt ada di model
			return err
		}
		return nil
	})

	if errTx != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menghapus role", errTx.Error())
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Role berhasil dihapus", nil)
}
