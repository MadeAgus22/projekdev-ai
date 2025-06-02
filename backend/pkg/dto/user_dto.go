package dto

import "time"

// CreateUserRequest DTO untuk membuat pengguna baru oleh admin
type CreateUserRequest struct {
	NamaLengkap string `json:"namaLengkap" validate:"required,min=3,max=100"`
	Username    string `json:"username" validate:"required,min=3,max=50"`
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,min=6"` // Frontend akan mengirim password plain
	Role        string `json:"role" validate:"required,oneof=admin dokter resepsionis"`
	Status      string `json:"status" validate:"omitempty,oneof=aktif nonaktif"` // Default 'aktif' di model
	PhoneNumber string `json:"phoneNumber,omitempty" validate:"omitempty,min=9,max=15"`
}

// UpdateUserRequest DTO untuk memperbarui pengguna oleh admin
type UpdateUserRequest struct {
	NamaLengkap string `json:"namaLengkap" validate:"omitempty,min=3,max=100"`
	Username    string `json:"username" validate:"omitempty,min=3,max=50"` // Biasanya username tidak diubah, tapi tergantung kebutuhan
	Email       string `json:"email" validate:"omitempty,email"`
	Password    string `json:"password,omitempty" validate:"omitempty,min=6"` // Opsional, hanya jika ingin ganti password
	Role        string `json:"role" validate:"omitempty,oneof=admin dokter resepsionis"`
	Status      string `json:"status" validate:"omitempty,oneof=aktif nonaktif"`
	PhoneNumber string `json:"phoneNumber,omitempty" validate:"omitempty,min=9,max=15"`
}

// UserResponse DTO untuk data pengguna yang dikirim ke frontend
type UserResponse struct {
	ID          uint       `json:"id"`
	NamaLengkap string     `json:"namaLengkap"`
	Username    string     `json:"username"`
	Email       string     `json:"email"`
	Role        string     `json:"role"`
	Status      string     `json:"status"`
	PhoneNumber string     `json:"phoneNumber,omitempty"`
	LastLogin   *time.Time `json:"lastLogin,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
