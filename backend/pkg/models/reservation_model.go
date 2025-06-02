package models

import (
	"time"
)

// Reservation merepresentasikan data reservasi/janji temu pasien
type Reservation struct {
	BaseModel                // ID, CreatedAt, UpdatedAt, DeletedAt
	PatientID      uint      `gorm:"not null;index" json:"patientId"`
	Patient        Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"` // Untuk info pasien
	DoctorID       uint      `gorm:"not null;index" json:"doctorId"`                // ID User dokter
	DoctorName     string    `gorm:"type:varchar(255)" json:"doctorName,omitempty"` // Denormalisasi nama dokter
	Tanggal        time.Time `gorm:"type:date;not null" json:"tanggal"`
	Waktu          string    `gorm:"type:varchar(10);not null" json:"waktu"` // Format HH:MM
	Keluhan        string    `gorm:"type:text" json:"keluhan,omitempty"`
	Catatan        string    `gorm:"type:text" json:"catatan,omitempty"`
	Status         string    `gorm:"type:varchar(50);default:'Dijadwalkan'" json:"status"` // Contoh: Dijadwalkan, Dikonfirmasi, Dibatalkan, Selesai
	JenisKunjungan string    `gorm:"type:varchar(100)" json:"jenisKunjungan"`              // Reservasi, Walk-in
}
