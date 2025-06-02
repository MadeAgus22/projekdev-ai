package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/models" // Sesuaikan
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"  // Sesuaikan

	"github.com/MadeAgus22/dental-clinic-backend/pkg/database" // Sesuaikan
	"github.com/MadeAgus22/dental-clinic-backend/pkg/dto"      // Sesuaikan

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var validate = validator.New()

// CreatePatient membuat pasien baru
func CreatePatient(c *fiber.Ctx) error {
	req := new(dto.CreatePatientRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}

	// Validasi input menggunakan validator
	if err := validate.Struct(req); err != nil {
		// Logika untuk mengembalikan error validasi yang lebih detail bisa ditambahkan di sini
		return utils.ValidationErrorResponse(c, err.Error())
	}

	var tglLahir *time.Time
	if req.TanggalLahir != nil && *req.TanggalLahir != "" {
		parsedDate, err := time.Parse("2006-01-02", *req.TanggalLahir)
		if err != nil {
			return utils.ErrorResponse(c, fiber.StatusBadRequest, "Format tanggal lahir tidak valid (YYYY-MM-DD)", err.Error())
		}
		tglLahir = &parsedDate
	}

	patient := models.Patient{
		NoRM:            fmt.Sprintf("RM-%d", time.Now().Unix()), // Contoh pembuatan NoRM
		NamaLengkap:     req.NamaLengkap,
		TanggalLahir:    tglLahir,
		JenisKelamin:    req.JenisKelamin,
		Alamat:          req.Alamat,
		NomorTelepon:    req.NomorTelepon,
		Email:           req.Email,
		Alergi:          req.Alergi,
		RiwayatPenyakit: req.RiwayatPenyakit,
	}

	if err := database.DB.Create(&patient).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menyimpan pasien", err.Error())
	}

	response := dto.PatientResponse{
		ID:              patient.ID,
		NoRM:            patient.NoRM,
		NamaLengkap:     patient.NamaLengkap,
		TanggalLahir:    patient.TanggalLahir,
		JenisKelamin:    patient.JenisKelamin,
		Alamat:          patient.Alamat,
		NomorTelepon:    patient.NomorTelepon,
		Email:           patient.Email,
		Alergi:          patient.Alergi,
		RiwayatPenyakit: patient.RiwayatPenyakit,
		CreatedAt:       patient.CreatedAt,
		UpdatedAt:       patient.UpdatedAt,
	}
	return utils.SuccessResponse(c, fiber.StatusCreated, "Pasien berhasil dibuat", response)
}

// GetPatients mengambil semua pasien dengan pagination
func GetPatients(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit
	search := c.Query("search", "") // Parameter pencarian

	var patients []models.Patient
	var totalRecords int64

	query := database.DB.Model(&models.Patient{})
	countQuery := database.DB.Model(&models.Patient{})

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("nama_lengkap ILIKE ? OR no_rm ILIKE ?", searchPattern, searchPattern)
		countQuery = countQuery.Where("nama_lengkap ILIKE ? OR no_rm ILIKE ?", searchPattern, searchPattern)
	}

	if err := countQuery.Count(&totalRecords).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menghitung total pasien", err.Error())
	}

	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&patients).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data pasien", err.Error())
	}

	var patientResponses []dto.PatientResponse
	for _, p := range patients {
		patientResponses = append(patientResponses, dto.PatientResponse{
			ID:              p.ID,
			NoRM:            p.NoRM,
			NamaLengkap:     p.NamaLengkap,
			TanggalLahir:    p.TanggalLahir,
			JenisKelamin:    p.JenisKelamin,
			Alamat:          p.Alamat,
			NomorTelepon:    p.NomorTelepon,
			Email:           p.Email,
			Alergi:          p.Alergi,
			RiwayatPenyakit: p.RiwayatPenyakit,
			CreatedAt:       p.CreatedAt,
			UpdatedAt:       p.UpdatedAt,
		})
	}

	// Data untuk pagination di frontend
	paginationData := fiber.Map{
		"currentPage":  page,
		"totalPages":   (totalRecords + int64(limit) - 1) / int64(limit), // Ceiling division
		"totalRecords": totalRecords,
		"pageSize":     limit,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success":    true,
		"data":       patientResponses,
		"pagination": paginationData,
	})
}

// GetPatientByIDOrNoRM mengambil pasien berdasarkan ID atau NoRM
func GetPatientByIDOrNoRM(c *fiber.Ctx) error {
	idParam := c.Params("id")
	var patient models.Patient

	// Preload relasi jika diperlukan, contoh: EMR terakhir
	query := database.DB.Preload("MedicalRecords", func(db *gorm.DB) *gorm.DB {
		return db.Order("medical_records.exam_date DESC").Limit(5) // Ambil 5 EMR terakhir
	}).Preload("Reservations", func(db *gorm.DB) *gorm.DB {
		return db.Where("tanggal >= ?", time.Now().Format("2006-01-02")).Order("tanggal asc, waktu asc").Limit(5) // Reservasi mendatang
	})

	// Coba cari berdasarkan ID (uint) dulu
	if patientID, err := strconv.ParseUint(idParam, 10, 32); err == nil {
		if errDb := query.First(&patient, uint(patientID)).Error; errDb != nil {
			if errDb == gorm.ErrRecordNotFound {
				// Jika tidak ketemu, coba cari berdasarkan NoRM
				if errDbNoRM := query.Where("no_rm = ?", idParam).First(&patient).Error; errDbNoRM != nil {
					if errDbNoRM == gorm.ErrRecordNotFound {
						return utils.ErrorResponse(c, fiber.StatusNotFound, "Pasien tidak ditemukan")
					}
					return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan database", errDbNoRM.Error())
				}
			} else {
				return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan database", errDb.Error())
			}
		}
	} else {
		// Jika idParam bukan angka, anggap sebagai NoRM
		if errDb := query.Where("no_rm = ?", idParam).First(&patient).Error; errDb != nil {
			if errDb == gorm.ErrRecordNotFound {
				return utils.ErrorResponse(c, fiber.StatusNotFound, "Pasien tidak ditemukan")
			}
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan database", errDb.Error())
		}
	}

	response := dto.PatientResponse{
		ID:              patient.ID,
		NoRM:            patient.NoRM,
		NamaLengkap:     patient.NamaLengkap,
		TanggalLahir:    patient.TanggalLahir,
		JenisKelamin:    patient.JenisKelamin,
		Alamat:          patient.Alamat,
		NomorTelepon:    patient.NomorTelepon,
		Email:           patient.Email,
		Alergi:          patient.Alergi,
		RiwayatPenyakit: patient.RiwayatPenyakit,
		CreatedAt:       patient.CreatedAt,
		UpdatedAt:       patient.UpdatedAt,
	}
	// Anda mungkin ingin menambahkan data relasi (EMR, Reservasi) ke respons jika diperlukan
	// Misal, response.MedicalRecords = patient.MedicalRecords

	return utils.SuccessResponse(c, fiber.StatusOK, "Pasien ditemukan", response)
}

// UpdatePatient memperbarui data pasien
func UpdatePatient(c *fiber.Ctx) error {
	idParam := c.Params("id")
	var patient models.Patient

	// Cari pasien
	if patientID, err := strconv.ParseUint(idParam, 10, 32); err == nil {
		if errDb := database.DB.First(&patient, uint(patientID)).Error; errDb != nil { // ...
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pasien tidak ditemukan")
		}
	} else {
		if errDb := database.DB.Where("no_rm = ?", idParam).First(&patient).Error; errDb != nil { // ...
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pasien tidak ditemukan")
		}
	}

	req := new(dto.UpdatePatientRequest)
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}
	if err := validate.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error())
	}

	if req.NamaLengkap != "" {
		patient.NamaLengkap = req.NamaLengkap
	}
	if req.TanggalLahir != nil && *req.TanggalLahir != "" {
		parsedDate, err := time.Parse("2006-01-02", *req.TanggalLahir)
		if err != nil {
			return utils.ErrorResponse(c, fiber.StatusBadRequest, "Format tanggal lahir tidak valid (YYYY-MM-DD)", err.Error())
		}
		patient.TanggalLahir = &parsedDate
	}
	if req.JenisKelamin != "" {
		patient.JenisKelamin = req.JenisKelamin
	}
	if req.Alamat != "" {
		patient.Alamat = req.Alamat
	}
	if req.NomorTelepon != "" {
		patient.NomorTelepon = req.NomorTelepon
	}
	if req.Email != "" {
		patient.Email = req.Email
	}
	if req.Alergi != "" {
		patient.Alergi = req.Alergi
	}
	if req.RiwayatPenyakit != "" {
		patient.RiwayatPenyakit = req.RiwayatPenyakit
	}

	if err := database.DB.Save(&patient).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal memperbarui pasien", err.Error())
	}

	response := dto.PatientResponse{
		// ... (map field ke response DTO)
		ID: patient.ID, NamaLengkap: patient.NamaLengkap, NoRM: patient.NoRM, //...
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Data pasien berhasil diperbarui", response)
}

// DeletePatient menghapus data pasien (soft delete)
func DeletePatient(c *fiber.Ctx) error {
	idParam := c.Params("id")
	var patient models.Patient

	if patientID, err := strconv.ParseUint(idParam, 10, 32); err == nil {
		if errDb := database.DB.First(&patient, uint(patientID)).Error; errDb != nil {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pasien tidak ditemukan")
		}
	} else {
		if errDb := database.DB.Where("no_rm = ?", idParam).First(&patient).Error; errDb != nil {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "Pasien tidak ditemukan")
		}
	}

	if err := database.DB.Delete(&patient).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menghapus pasien", err.Error())
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Pasien berhasil dihapus", nil)
}
