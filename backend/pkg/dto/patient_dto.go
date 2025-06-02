package dto

import "time"

// CreatePatientRequest DTO untuk membuat pasien baru
type CreatePatientRequest struct {
	NamaLengkap     string  `json:"namaLengkap" validate:"required,min=3,max=255"`
	TanggalLahir    *string `json:"tanggalLahir" validate:"omitempty,datetime=2006-01-02"` // Format YYYY-MM-DD
	JenisKelamin    string  `json:"jenisKelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	Alamat          string  `json:"alamat" validate:"omitempty,max=500"`
	NomorTelepon    string  `json:"nomorTelepon" validate:"required,min=9,max=15"`
	Email           string  `json:"email,omitempty" validate:"omitempty,email,max=100"`
	Alergi          string  `json:"alergi,omitempty" validate:"omitempty,max=1000"`
	RiwayatPenyakit string  `json:"riwayatPenyakit,omitempty" validate:"omitempty,max=1000"`
}

// UpdatePatientRequest DTO untuk update pasien
type UpdatePatientRequest struct {
	NamaLengkap     string  `json:"namaLengkap" validate:"omitempty,min=3,max=255"`
	TanggalLahir    *string `json:"tanggalLahir" validate:"omitempty,datetime=2006-01-02"`
	JenisKelamin    string  `json:"jenisKelamin" validate:"omitempty,oneof=Laki-laki Perempuan"`
	Alamat          string  `json:"alamat" validate:"omitempty,max=500"`
	NomorTelepon    string  `json:"nomorTelepon" validate:"omitempty,min=9,max=15"`
	Email           string  `json:"email,omitempty" validate:"omitempty,email,max=100"`
	Alergi          string  `json:"alergi,omitempty" validate:"omitempty,max=1000"`
	RiwayatPenyakit string  `json:"riwayatPenyakit,omitempty" validate:"omitempty,max=1000"`
}

// PatientResponse DTO untuk respons data pasien
type PatientResponse struct {
	ID              uint       `json:"id"`
	NoRM            string     `json:"noRm"`
	NamaLengkap     string     `json:"namaLengkap"`
	TanggalLahir    *time.Time `json:"tanggalLahir,omitempty"`
	JenisKelamin    string     `json:"jenisKelamin,omitempty"`
	Alamat          string     `json:"alamat,omitempty"`
	NomorTelepon    string     `json:"nomorTelepon"`
	Email           string     `json:"email,omitempty"`
	Alergi          string     `json:"alergi,omitempty"`
	RiwayatPenyakit string     `json:"riwayatPenyakit,omitempty"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}
