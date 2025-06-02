package dto

import (
	"github.com/MadeAgus22/dental-clinic-backend/types" // Sesuaikan dengan path module Anda
)

// OdontogramDetailDTO untuk request/response
type OdontogramDetailDTO struct {
	ToothNumber   string                 `json:"toothNumber" validate:"required"`
	Condition     types.ToothCondition   `json:"condition" validate:"required"` // Menggunakan tipe dari pkg/types
	TreatmentNote string                 `json:"treatmentNote,omitempty"`
	History       []OdontogramHistoryDTO `json:"history,omitempty,dive"` // `dive` untuk validasi nested struct
}

// OdontogramHistoryDTO untuk request/response
type OdontogramHistoryDTO struct {
	Date          string               `json:"date" validate:"required,datetime=2006-01-02"` // Validasi format tanggal
	DoctorName    string               `json:"doctorName" validate:"required"`
	FromCondition types.ToothCondition `json:"fromCondition" validate:"required"`
	ToCondition   types.ToothCondition `json:"toCondition" validate:"required"`
	Note          string               `json:"note,omitempty"`
}

// MedicalRecordTreatmentItemDTO untuk request/response
type MedicalRecordTreatmentItemDTO struct {
	// TreatmentCatalogID uint    `json:"treatmentCatalogId,omitempty"` // Bisa juga berdasarkan Kode
	TreatmentCode   string  `json:"code" validate:"required"`
	ToothNumber     string  `json:"toothNumber,omitempty"` // Nomor gigi jika spesifik
	Quantity        int     `json:"quantity" validate:"required,min=1"`
	PriceAtTime     float64 `json:"priceAtTime" validate:"required,gte=0"`
	DiscountPercent float64 `json:"discountPercent" validate:"omitempty,min=0,max=100"`
	SubTotal        float64 `json:"subTotal" validate:"required,gte=0"` // Sebaiknya dihitung di backend
	Notes           string  `json:"notes,omitempty"`
}

// MedicalRecordMedicationItemDTO untuk request/response
type MedicalRecordMedicationItemDTO struct {
	// MedicationCatalogID uint    `json:"medicationCatalogId,omitempty"` // Bisa juga berdasarkan Kode
	MedicationCode     string  `json:"code" validate:"required"`
	Quantity           int     `json:"quantity" validate:"required,min=1"`
	PricePerUnitAtTime float64 `json:"pricePerUnitAtTime" validate:"required,gte=0"`
	SubTotal           float64 `json:"subTotal" validate:"required,gte=0"` // Sebaiknya dihitung di backend
	Instruction        string  `json:"instruction,omitempty"`
}

// CreateEMRRequest DTO untuk membuat EMR baru
type CreateEMRRequest struct {
	PatientID     uint   `json:"patientId" validate:"required"`
	DoctorID      uint   `json:"doctorId" validate:"required"`
	DoctorName    string `json:"doctorName,omitempty"` // Bisa diisi otomatis dari data dokter di backend
	VisitType     string `json:"visitType,omitempty"`
	Complaint     string `json:"complaint" validate:"required"`
	Examination   string `json:"examination,omitempty"`
	Diagnosis     string `json:"diagnosis,omitempty"`
	TreatmentPlan string `json:"treatmentPlan,omitempty"`
	Notes         string `json:"notes,omitempty"`
	// BillingStatus string `json:"billingStatus,omitempty"` // Biasanya di-set terpisah atau default

	Treatments  []MedicalRecordTreatmentItemDTO  `json:"treatments,omitempty,dive"`
	Medications []MedicalRecordMedicationItemDTO `json:"medications,omitempty,dive"`
	Odontogram  []OdontogramDetailDTO            `json:"odontogram,omitempty,dive"`
}

// UpdateEMRRequest DTO untuk memperbarui EMR
type UpdateEMRRequest struct {
	DoctorID      uint   `json:"doctorId,omitempty"` // Hanya update jika memang ingin diganti
	DoctorName    string `json:"doctorName,omitempty"`
	VisitType     string `json:"visitType,omitempty"`
	Complaint     string `json:"complaint,omitempty"` // Biasanya keluhan utama tidak diupdate, tapi tergantung kasus
	Examination   string `json:"examination,omitempty"`
	Diagnosis     string `json:"diagnosis,omitempty"`
	TreatmentPlan string `json:"treatmentPlan,omitempty"`
	Notes         string `json:"notes,omitempty"`
	BillingStatus string `json:"billingStatus,omitempty"` // Status pembayaran bisa diupdate di sini atau endpoint terpisah

	Treatments  []MedicalRecordTreatmentItemDTO  `json:"treatments,omitempty,dive"`
	Medications []MedicalRecordMedicationItemDTO `json:"medications,omitempty,dive"`
	Odontogram  []OdontogramDetailDTO            `json:"odontogram,omitempty,dive"`
}
