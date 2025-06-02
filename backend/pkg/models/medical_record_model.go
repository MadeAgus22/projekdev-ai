package models

import (
	"time"

	"github.com/MadeAgus22/dental-clinic-backend/types" // Sesuaikan path
	// "github.com/lib/pq" // Untuk array JSONB manual jika tidak pakai relasi tabel
)

// MedicalRecord (EMR)
type MedicalRecord struct {
	BaseModel
	VisitID       string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"visitId"`
	PatientID     uint      `gorm:"not null;index" json:"patientId"`
	Patient       Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"` // Untuk info pasien saat fetch EMR
	DoctorID      uint      `gorm:"not null;index" json:"doctorId"`                // ID User dokter
	DoctorName    string    `gorm:"type:varchar(255)" json:"doctorName"`           // Denormalisasi nama dokter
	ExamDate      time.Time `gorm:"type:timestamp with time zone;not null" json:"examDate"`
	VisitType     string    `gorm:"type:varchar(100)" json:"visitType,omitempty"`
	Complaint     string    `gorm:"type:text" json:"complaint"`
	Examination   string    `gorm:"type:text" json:"examination,omitempty"`
	Diagnosis     string    `gorm:"type:text" json:"diagnosis,omitempty"`
	TreatmentPlan string    `gorm:"type:text" json:"treatmentPlan,omitempty"`
	Notes         string    `gorm:"type:text" json:"notes,omitempty"`
	BillingStatus string    `gorm:"type:varchar(50);default:'Belum Lunas'" json:"billingStatus"` // e.g., Belum Lunas, Lunas

	Treatments  []MedicalRecordTreatmentItem  `gorm:"foreignKey:MedicalRecordID" json:"treatments"`
	Medications []MedicalRecordMedicationItem `gorm:"foreignKey:MedicalRecordID" json:"medications"`
	Odontogram  []OdontogramDetail            `gorm:"foreignKey:MedicalRecordID" json:"odontogram"` // Detail Odontogram per gigi
}

// OdontogramDetail menyimpan kondisi satu gigi pada satu EMR.
type OdontogramDetail struct {
	BaseModel
	MedicalRecordID uint                 `gorm:"not null;index" json:"medicalRecordId"`
	ToothNumber     string               `gorm:"type:varchar(10);not null" json:"toothNumber"` // e.g., "11", "12"
	Condition       types.ToothCondition `gorm:"type:varchar(50)" json:"condition"`
	TreatmentNote   string               `gorm:"type:varchar(255)" json:"treatmentNote,omitempty"` // Catatan perawatan spesifik gigi ini
	// Surfaces bisa disimpan sebagai JSON string atau dipisah jika perlu query kompleks
	// SurfacesJSON    string               `gorm:"type:jsonb" json:"-"` // Misal: `{"O": "caries", "M": "filling"}`
	History []OdontogramHistory `gorm:"foreignKey:OdontogramDetailID" json:"history,omitempty"`
}

// OdontogramHistory menyimpan riwayat perubahan kondisi gigi.
type OdontogramHistory struct {
	BaseModel
	OdontogramDetailID uint                 `gorm:"not null;index" json:"odontogramDetailId"`
	Date               time.Time            `gorm:"type:date;not null" json:"date"`
	DoctorName         string               `gorm:"type:varchar(255)" json:"doctorName"`
	FromCondition      types.ToothCondition `gorm:"type:varchar(50)" json:"fromCondition"`
	ToCondition        types.ToothCondition `gorm:"type:varchar(50)" json:"toCondition"`
	Note               string               `gorm:"type:text" json:"note,omitempty"`
}

// MedicalRecordTreatmentItem untuk item tindakan dalam EMR
type MedicalRecordTreatmentItem struct {
	BaseModel
	MedicalRecordID    uint             `gorm:"not null;index" json:"medicalRecordId"`
	TreatmentCatalogID uint             `gorm:"not null;index" json:"treatmentCatalogId"` // FK ke master tindakan
	TreatmentCatalog   TreatmentCatalog `gorm:"foreignKey:TreatmentCatalogID" json:"treatmentCatalog,omitempty"`
	ToothNumber        string           `gorm:"type:varchar(10)" json:"toothNumber,omitempty"`
	Quantity           int              `gorm:"default:1" json:"quantity"`
	PriceAtTime        float64          `json:"priceAtTime"` // Harga saat tindakan dilakukan
	DiscountPercent    float64          `gorm:"default:0" json:"discountPercent"`
	SubTotal           float64          `json:"subTotal"` // Price * Qty * (1 - Discount/100)
	Notes              string           `gorm:"type:text" json:"notes,omitempty"`
}

// MedicalRecordMedicationItem untuk item obat dalam EMR
type MedicalRecordMedicationItem struct {
	BaseModel
	MedicalRecordID     uint              `gorm:"not null;index" json:"medicalRecordId"`
	MedicationCatalogID uint              `gorm:"not null;index" json:"medicationCatalogId"` // FK ke master obat
	MedicationCatalog   MedicationCatalog `gorm:"foreignKey:MedicationCatalogID" json:"medicationCatalog,omitempty"`
	Quantity            int               `gorm:"not null" json:"quantity"`
	PricePerUnitAtTime  float64           `json:"pricePerUnitAtTime"`                     // Harga saat obat diberikan
	SubTotal            float64           `json:"subTotal"`                               // Price * Qty
	Instruction         string            `gorm:"type:text" json:"instruction,omitempty"` // Aturan pakai
}
