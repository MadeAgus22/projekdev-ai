package dto

import "time"

type PermissionSimpleDTO struct {
	ID   uint   `json:"id"`
	Kode string `json:"kode"`
	Nama string `json:"nama"`
	Grup string `json:"grup,omitempty"` // PASTIKAN FIELD INI ADA DAN DIEKSPOR (huruf awal kapital)
}

type CreateRoleRequest struct {
	Nama            string   `json:"nama" validate:"required,min=3,max=100"`
	Kode            string   `json:"kode" validate:"required,min=3,max=50,alphanum"`
	Deskripsi       string   `json:"deskripsi,omitempty"`
	PermissionKodes []string `json:"permissionKodes,omitempty"` // Kirim array kode permission
}

type UpdateRoleRequest struct {
	Nama            string   `json:"nama" validate:"omitempty,min=3,max=100"`
	Kode            string   `json:"kode" validate:"omitempty,min=3,max=50,alphanum"` // Pertimbangkan apakah kode boleh diubah
	Deskripsi       string   `json:"deskripsi,omitempty"`
	PermissionKodes []string `json:"permissionKodes,omitempty"`
}

type RoleResponse struct {
	ID          uint                  `json:"id"`
	Nama        string                `json:"nama"`
	Kode        string                `json:"kode"`
	Deskripsi   string                `json:"deskripsi,omitempty"`
	Permissions []PermissionSimpleDTO `json:"permissions,omitempty"` // Tampilkan permission yang dimiliki role
	CreatedAt   time.Time             `json:"createdAt"`
	UpdatedAt   time.Time             `json:"updatedAt"`
}
