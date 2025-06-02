package models

import (
	"time"

	"gorm.io/gorm"
)

// BaseModel bisa di-embed ke model lain untuk field standar
type BaseModel struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"` // Untuk soft delete
}
