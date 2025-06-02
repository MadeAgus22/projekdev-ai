package models

import (
	"time"
)

// Patient merepresentasikan data pasien
type Patient struct {
	BaseModel                  // Embed BaseModel
	NoRM            string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"noRm"`
	NamaLengkap     string     `gorm:"type:varchar(255);not null" json:"namaLengkap"`
	TanggalLahir    *time.Time `gorm:"type:date" json:"tanggalLahir"`
	JenisKelamin    string     `gorm:"type:varchar(20)" json:"jenisKelamin"` // Laki-laki, Perempuan
	Alamat          string     `gorm:"type:text" json:"alamat"`
	NomorTelepon    string     `gorm:"type:varchar(20)" json:"nomorTelepon"`
	Email           string     `gorm:"type:varchar(100);uniqueIndex" json:"email,omitempty"`
	Alergi          string     `gorm:"type:text" json:"alergi,omitempty"`
	RiwayatPenyakit string     `gorm:"type:text" json:"riwayatPenyakit,omitempty"`

	// Relasi (jika diperlukan untuk eager loading atau query)
	MedicalRecords []MedicalRecord `gorm:"foreignKey:PatientID" json:"-"` // Hindari circular dependency di JSON dasar
	Reservations   []Reservation   `gorm:"foreignKey:PatientID" json:"-"`
}
