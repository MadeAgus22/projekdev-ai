package dto

// LoginRequest DTO untuk request login
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
	Role     string `json:"role" validate:"required,oneof=admin dokter resepsionis"`
}

// LoginResponse DTO untuk respons login
type LoginResponse struct {
	Token       string `json:"token"`
	ID          uint   `json:"id"`
	Username    string `json:"username"`
	NamaLengkap string `json:"namaLengkap"`
	Email       string `json:"email"`
	Role        string `json:"role"`
}

// RegisterRequest DTO untuk request registrasi user baru (oleh admin)
type RegisterRequest struct {
	NamaLengkap string `json:"namaLengkap" validate:"required"`
	Username    string `json:"username" validate:"required"`
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,min=6"`
	Role        string `json:"role" validate:"required,oneof=admin dokter resepsionis"`
	Status      string `json:"status,omitempty" validate:"omitempty,oneof=aktif nonaktif"`
	PhoneNumber string `json:"phoneNumber,omitempty"`
}
