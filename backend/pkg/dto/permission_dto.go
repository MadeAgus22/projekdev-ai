package dto

import "time"

type PermissionResponse struct {
	ID        uint      `json:"id"`
	Nama      string    `json:"nama"`
	Kode      string    `json:"kode"`
	Deskripsi string    `json:"deskripsi,omitempty"`
	Grup      string    `json:"grup,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Tidak perlu Create/Update DTO jika permission di-manage secara internal/seeding
// Jika ingin CRUD permission via API, buat DTO-nya.
