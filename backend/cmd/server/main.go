package main

import (
	"fmt"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/config"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/database"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/routes"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func main() {
	// Inisialisasi Logger
	logger, _ := zap.NewProduction() // Atau zap.NewDevelopment() untuk log lebih detail saat dev
	defer logger.Sync()

	// Load Konfigurasi
	if err := config.LoadConfig(); err != nil {
		logger.Fatal("Gagal memuat konfigurasi", zap.Error(err))
	}
	cfg := config.AppConfig

	// Koneksi Database
	if err := database.ConnectDB(); err != nil { // Menggunakan AppConfig yang sudah di-set
		logger.Fatal("Gagal terhubung ke database", zap.Error(err))
	}

	// Panggil seeder setelah migrasi
	if err := database.SeedPermissions(database.DB); err != nil {
		logger.Fatal("Gagal melakukan seeding permissions", zap.Error(err))
	}
	// Panggil seeder untuk role default
	if err := database.SeedDefaultRolesAndPermissions(database.DB); err != nil {
		logger.Fatal("Gagal melakukan seeding default roles and permissions", zap.Error(err))
	}

	// Inisialisasi Fiber App
	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error { // Custom error handler
			code := fiber.StatusInternalServerError
			message := "Terjadi kesalahan internal pada server"

			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
				message = e.Message
			} else {
				logger.Error("Unhandled error", zap.Error(err), zap.String("path", ctx.Path()))
			}
			return ctx.Status(code).JSON(fiber.Map{"success": false, "message": message})
		},
	})

	// Setup Rute
	routes.SetupRoutes(app, logger)

	// Start Server
	addr := fmt.Sprintf(":%d", cfg.Port)
	logger.Info("Server backend berjalan di ", zap.String("address", addr))
	if err := app.Listen(addr); err != nil {
		logger.Fatal("Gagal menjalankan server Fiber", zap.Error(err))
	}
}
