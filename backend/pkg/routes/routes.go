package routes

import (
	"github.com/MadeAgus22/dental-clinic-backend/pkg/handlers"
	"github.com/MadeAgus22/dental-clinic-backend/pkg/middleware"

	"github.com/gofiber/contrib/fiberzap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"go.uber.org/zap"
)

func SetupRoutes(app *fiber.App, logger *zap.Logger) {
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
	}))
	app.Use(recover.New())
	app.Use(fiberzap.New(fiberzap.Config{Logger: logger}))

	api := app.Group("/api/v1")

	// Rute Autentikasi
	auth := api.Group("/auth")
	auth.Post("/login", handlers.LoginUser)

	// Rute yang dilindungi JWT
	protected := api.Use(middleware.JWTMiddleware())

	protected.Get("/me", handlers.GetCurrentUser)

	// Rute Manajemen Pengguna (Admin)
	adminUserRoutes := protected.Group("/admin/users", middleware.AuthorizeRole("admin"))
	adminUserRoutes.Post("/register", handlers.RegisterUserByAdmin)
	adminUserRoutes.Get("/", handlers.GetAllUsers)
	adminUserRoutes.Get("/:userId", handlers.GetUserByID)
	adminUserRoutes.Put("/:userId", handlers.UpdateUser)
	adminUserRoutes.Delete("/:userId", handlers.DeleteUser)

	// Rute Manajemen Role & Permission (Admin)
	adminAccessRoutes := protected.Group("/admin/access", middleware.AuthorizeRole("admin"))
	// Role CRUD
	adminAccessRoutes.Post("/roles", handlers.CreateRole)
	adminAccessRoutes.Get("/roles", handlers.GetAllRoles)
	adminAccessRoutes.Get("/roles/:roleId", handlers.GetRoleByID)
	adminAccessRoutes.Put("/roles/:roleId", handlers.UpdateRole) // Handler ini juga akan mengupdate permissions
	adminAccessRoutes.Delete("/roles/:roleId", handlers.DeleteRole)
	// Permission (Hanya GET semua)
	adminAccessRoutes.Get("/permissions", handlers.GetAllPermissions)

	// Rute Pasien
	patientRoutes := protected.Group("/pasien", middleware.AuthorizeRole("admin", "resepsionis", "dokter"))
	patientRoutes.Post("/", middleware.AuthorizeRole("admin", "resepsionis"), handlers.CreatePatient)
	patientRoutes.Get("/", handlers.GetPatients)
	patientRoutes.Get("/:id", handlers.GetPatientByIDOrNoRM)
	patientRoutes.Put("/:id", middleware.AuthorizeRole("admin", "resepsionis"), handlers.UpdatePatient)
	patientRoutes.Delete("/:id", middleware.AuthorizeRole("admin", "resepsionis"), handlers.DeletePatient)

	// Rute EMR
	emrRoutes := protected.Group("/emr", middleware.AuthorizeRole("admin", "dokter"))
	emrRoutes.Post("/", handlers.CreateEMR)
	emrRoutes.Get("/pasien/:patientId", handlers.GetEMRsByPatient)
	emrRoutes.Get("/:id", handlers.GetEMRByID)
	emrRoutes.Put("/:id", handlers.UpdateEMR)

	// TODO: Rute untuk Master Data (Tindakan, Obat)
	// masterDataRoutes := protected.Group("/master", middleware.AuthorizeRole("admin"))
	// ...

	// TODO: Rute untuk Reservasi
	// reservationRoutes := protected.Group("/reservasi", middleware.AuthorizeRole("admin", "resepsionis"))
	// ...

	api.Get("/ping", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "ok", "message": "Pong!"})
	})
}
