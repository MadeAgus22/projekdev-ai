package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/database" // Sesuaikan dengan path module Anda
	"github.com/MadeAgus22/dental-clinic-backend/pkg/dto"      // Sesuaikan
	"github.com/MadeAgus22/dental-clinic-backend/pkg/models"   // Sesuaikan
	"github.com/MadeAgus22/dental-clinic-backend/pkg/utils"    // Sesuaikan

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CreateEMR membuat rekam medis baru
func CreateEMR(c *fiber.Ctx) error {
	req := new(dto.CreateEMRRequest) // Anda perlu membuat DTO ini
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}

	if err := validate.Struct(req); err != nil { // Asumsi Anda menggunakan 'validate' dari patient_handler
		return utils.ValidationErrorResponse(c, err.Error())
	}

	// Mapping DTO ke Model EMR
	emr := models.MedicalRecord{
		VisitID:       fmt.Sprintf("VISIT-%d-%s", req.PatientID, time.Now().Format("20060102150405")), // Contoh VisitID
		PatientID:     req.PatientID,
		DoctorID:      req.DoctorID,
		DoctorName:    req.DoctorName, // Sebaiknya diambil dari data dokter berdasarkan DoctorID
		ExamDate:      time.Now(),     // Atau dari request jika bisa diatur
		VisitType:     req.VisitType,
		Complaint:     req.Complaint,
		Examination:   req.Examination,
		Diagnosis:     req.Diagnosis,
		TreatmentPlan: req.TreatmentPlan,
		Notes:         req.Notes,
		BillingStatus: "Belum Lunas", // Default
	}

	// Handle Treatments
	for _, treatmentDTO := range req.Treatments {
		// Anda mungkin perlu mencari TreatmentCatalogID berdasarkan kode tindakan
		// Untuk sementara, kita asumsikan TreatmentCatalogID sudah ada di DTO atau kode unik
		item := models.MedicalRecordTreatmentItem{
			// TreatmentCatalogID: treatmentDTO.TreatmentCatalogID, // atau cari berdasarkan kode
			ToothNumber:     treatmentDTO.ToothNumber,
			Quantity:        treatmentDTO.Quantity,
			PriceAtTime:     treatmentDTO.PriceAtTime, // Ambil harga dari master saat itu
			DiscountPercent: treatmentDTO.DiscountPercent,
			SubTotal:        treatmentDTO.SubTotal, // Hitung di frontend atau backend
			Notes:           treatmentDTO.Notes,
		}
		emr.Treatments = append(emr.Treatments, item)
	}

	// Handle Medications
	for _, medDTO := range req.Medications {
		item := models.MedicalRecordMedicationItem{
			// MedicationCatalogID: medDTO.MedicationCatalogID, // atau cari berdasarkan kode
			Quantity:           medDTO.Quantity,
			PricePerUnitAtTime: medDTO.PricePerUnitAtTime,
			SubTotal:           medDTO.SubTotal,
			Instruction:        medDTO.Instruction,
		}
		emr.Medications = append(emr.Medications, item)
	}

	// Handle Odontogram
	for _, odontoDTO := range req.Odontogram {
		detail := models.OdontogramDetail{
			ToothNumber:   odontoDTO.ToothNumber,
			Condition:     odontoDTO.Condition,
			TreatmentNote: odontoDTO.TreatmentNote,
		}
		for _, historyDTO := range odontoDTO.History {
			parsedDate, _ := time.Parse("2006-01-02", historyDTO.Date) // Sebaiknya handle error
			historyEntry := models.OdontogramHistory{
				Date:          parsedDate,
				DoctorName:    historyDTO.DoctorName,
				FromCondition: historyDTO.FromCondition,
				ToCondition:   historyDTO.ToCondition,
				Note:          historyDTO.Note,
			}
			detail.History = append(detail.History, historyEntry)
		}
		emr.Odontogram = append(emr.Odontogram, detail)
	}

	// Transaksi Database
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&emr).Error; err != nil {
			return err
		}
		// GORM akan otomatis menyimpan relasi has many (Treatments, Medications, Odontogram)
		// jika primary key EMR sudah ter-generate dan foreign key di-set dengan benar.
		// Namun, untuk OdontogramHistory yang nested, Anda mungkin perlu menyimpannya secara manual
		// setelah OdontogramDetail disimpan dan mendapatkan ID-nya.

		// Atau, Anda bisa menyimpan EMR dulu, lalu menyimpan relasinya
		// dan mengupdate OdontogramDetail dengan history-nya.

		// Contoh eksplisit menyimpan history setelah OdontogramDetail dibuat (jika GORM tidak otomatis):
		for i := range emr.Odontogram {
			emr.Odontogram[i].MedicalRecordID = emr.ID                // Pastikan FK ter-set
			if err := tx.Save(&emr.Odontogram[i]).Error; err != nil { // Simpan detail dulu untuk dapat ID
				return err
			}
			for j := range emr.Odontogram[i].History {
				emr.Odontogram[i].History[j].OdontogramDetailID = emr.Odontogram[i].ID // Set FK history
				if err := tx.Create(&emr.Odontogram[i].History[j]).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal menyimpan EMR", err.Error())
	}

	// Ambil ulang EMR dengan semua relasinya untuk respons
	var createdEMR models.MedicalRecord
	database.DB.Preload("Patient").
		Preload("Treatments.TreatmentCatalog"). // Asumsi ada relasi ini di model
		Preload("Medications.MedicationCatalog").
		Preload("Odontogram.History").
		First(&createdEMR, emr.ID)

	return utils.SuccessResponse(c, fiber.StatusCreated, "EMR berhasil dibuat", createdEMR)
}

// GetEMRsByPatient mengambil semua EMR untuk seorang pasien
func GetEMRsByPatient(c *fiber.Ctx) error {
	patientIDParam := c.Params("patientId")
	patientID, err := strconv.ParseUint(patientIDParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Patient ID tidak valid")
	}

	var emrs []models.MedicalRecord
	query := database.DB.Where("patient_id = ?", uint(patientID)).
		Preload("Patient").
		Preload("Treatments.TreatmentCatalog").
		Preload("Medications.MedicationCatalog").
		Preload("Odontogram.History").
		Order("exam_date desc")

	if err := query.Find(&emrs).Error; err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil EMR pasien", err.Error())
	}

	if len(emrs) == 0 {
		return utils.SuccessResponse(c, fiber.StatusOK, "Tidak ada EMR ditemukan untuk pasien ini", []models.MedicalRecord{})
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "EMR pasien berhasil diambil", emrs)
}

// GetEMRByID mengambil EMR berdasarkan ID kunjungan (VisitID) atau ID internal EMR
func GetEMRByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	var emr models.MedicalRecord

	query := database.DB.
		Preload("Patient").
		Preload("Treatments.TreatmentCatalog").
		Preload("Medications.MedicationCatalog").
		Preload("Odontogram.History")

	// Coba cari berdasarkan ID internal EMR (angka) dulu
	if emrID, err := strconv.ParseUint(idParam, 10, 32); err == nil {
		if errDb := query.First(&emr, uint(emrID)).Error; errDb != nil {
			if errDb == gorm.ErrRecordNotFound {
				// Jika tidak ketemu, coba cari berdasarkan VisitID
				if errDbVisit := query.Where("visit_id = ?", idParam).First(&emr).Error; errDbVisit != nil {
					if errDbVisit == gorm.ErrRecordNotFound {
						return utils.ErrorResponse(c, fiber.StatusNotFound, "EMR tidak ditemukan")
					}
					return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan database", errDbVisit.Error())
				}
			} else {
				return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan database", errDb.Error())
			}
		}
	} else {
		// Jika idParam bukan angka, anggap sebagai VisitID
		if errDb := query.Where("visit_id = ?", idParam).First(&emr).Error; errDb != nil {
			if errDb == gorm.ErrRecordNotFound {
				return utils.ErrorResponse(c, fiber.StatusNotFound, "EMR tidak ditemukan")
			}
			return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Kesalahan database", errDb.Error())
		}
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "EMR berhasil diambil", emr)
}

// UpdateEMR memperbarui data EMR
func UpdateEMR(c *fiber.Ctx) error {
	idParam := c.Params("id")
	var existingEMR models.MedicalRecord

	// Cari EMR yang ada berdasarkan ID internal atau VisitID
	query := database.DB.Preload("Treatments").Preload("Medications").Preload("Odontogram.History")
	if emrID, err := strconv.ParseUint(idParam, 10, 32); err == nil {
		if errDb := query.First(&existingEMR, uint(emrID)).Error; errDb != nil {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "EMR tidak ditemukan (by ID)")
		}
	} else {
		if errDb := query.Where("visit_id = ?", idParam).First(&existingEMR).Error; errDb != nil {
			return utils.ErrorResponse(c, fiber.StatusNotFound, "EMR tidak ditemukan (by VisitID)")
		}
	}

	req := new(dto.UpdateEMRRequest) // Anda perlu membuat DTO ini
	if err := c.BodyParser(req); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid", err.Error())
	}
	if err := validate.Struct(req); err != nil {
		return utils.ValidationErrorResponse(c, err.Error())
	}

	// Update field EMR utama
	existingEMR.VisitType = req.VisitType
	existingEMR.Complaint = req.Complaint
	existingEMR.Examination = req.Examination
	existingEMR.Diagnosis = req.Diagnosis
	existingEMR.TreatmentPlan = req.TreatmentPlan
	existingEMR.Notes = req.Notes
	existingEMR.BillingStatus = req.BillingStatus
	if req.DoctorID != 0 { // Hanya update jika ada perubahan
		existingEMR.DoctorID = req.DoctorID
		existingEMR.DoctorName = req.DoctorName // Asumsi nama dokter juga diupdate
	}
	// existingEMR.ExamDate bisa diupdate jika diizinkan

	errTx := database.DB.Transaction(func(tx *gorm.DB) error {
		// Update EMR utama
		if err := tx.Save(&existingEMR).Error; err != nil {
			return err
		}

		// Hapus Treatments, Medications, Odontogram lama (atau gunakan pendekatan update yang lebih canggih)
		if err := tx.Where("medical_record_id = ?", existingEMR.ID).Delete(&models.MedicalRecordTreatmentItem{}).Error; err != nil {
			return err
		}
		if err := tx.Where("medical_record_id = ?", existingEMR.ID).Delete(&models.MedicalRecordMedicationItem{}).Error; err != nil {
			return err
		}

		// Hapus OdontogramHistory dulu sebelum OdontogramDetail
		var oldOdontogramDetails []models.OdontogramDetail
		if err := tx.Where("medical_record_id = ?", existingEMR.ID).Find(&oldOdontogramDetails).Error; err == nil {
			for _, detail := range oldOdontogramDetails {
				if err := tx.Where("odontogram_detail_id = ?", detail.ID).Delete(&models.OdontogramHistory{}).Error; err != nil {
					return err
				}
			}
		}
		if err := tx.Where("medical_record_id = ?", existingEMR.ID).Delete(&models.OdontogramDetail{}).Error; err != nil {
			return err
		}

		// Tambahkan Treatments baru
		for _, treatmentDTO := range req.Treatments {
			item := models.MedicalRecordTreatmentItem{
				MedicalRecordID: existingEMR.ID,
				// TreatmentCatalogID: treatmentDTO.TreatmentCatalogID,
				ToothNumber:     treatmentDTO.ToothNumber,
				Quantity:        treatmentDTO.Quantity,
				PriceAtTime:     treatmentDTO.PriceAtTime,
				DiscountPercent: treatmentDTO.DiscountPercent,
				SubTotal:        treatmentDTO.SubTotal,
				Notes:           treatmentDTO.Notes,
			}
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}

		// Tambahkan Medications baru
		for _, medDTO := range req.Medications {
			item := models.MedicalRecordMedicationItem{
				MedicalRecordID: existingEMR.ID,
				// MedicationCatalogID: medDTO.MedicationCatalogID,
				Quantity:           medDTO.Quantity,
				PricePerUnitAtTime: medDTO.PricePerUnitAtTime,
				SubTotal:           medDTO.SubTotal,
				Instruction:        medDTO.Instruction,
			}
			if err := tx.Create(&item).Error; err != nil {
				return err
			}
		}

		// Tambahkan Odontogram baru
		for _, odontoDTO := range req.Odontogram {
			detail := models.OdontogramDetail{
				MedicalRecordID: existingEMR.ID,
				ToothNumber:     odontoDTO.ToothNumber,
				Condition:       odontoDTO.Condition,
				TreatmentNote:   odontoDTO.TreatmentNote,
			}
			if err := tx.Create(&detail).Error; err != nil {
				return err
			} // Simpan detail untuk dapat ID

			for _, historyDTO := range odontoDTO.History {
				parsedDate, _ := time.Parse("2006-01-02", historyDTO.Date)
				historyEntry := models.OdontogramHistory{
					OdontogramDetailID: detail.ID, // Gunakan ID dari detail yang baru disimpan
					Date:               parsedDate,
					DoctorName:         historyDTO.DoctorName,
					FromCondition:      historyDTO.FromCondition,
					ToCondition:        historyDTO.ToCondition,
					Note:               historyDTO.Note,
				}
				if err := tx.Create(&historyEntry).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if errTx != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal memperbarui EMR", errTx.Error())
	}

	// Ambil ulang EMR yang sudah diupdate
	var updatedEMR models.MedicalRecord
	database.DB.Preload("Patient").
		Preload("Treatments.TreatmentCatalog").
		Preload("Medications.MedicationCatalog").
		Preload("Odontogram.History").
		First(&updatedEMR, existingEMR.ID)

	return utils.SuccessResponse(c, fiber.StatusOK, "EMR berhasil diperbarui", updatedEMR)
}

// Anda juga perlu membuat DTO untuk CreateEMRRequest dan UpdateEMRRequest di pkg/dto/emr_dto.go
// Contoh dto.CreateEMRRequest:
/* //
package dto

import "dental_clinic_
*/ //
