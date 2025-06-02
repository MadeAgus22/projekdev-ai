package main // Package harus 'main' agar bisa dieksekusi

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "Superadmin123" // Ganti dengan password yang Anda inginkan untuk admin
	cost := 14                  // Cost factor untuk bcrypt, 10-14 adalah nilai yang baik

	bytes, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		log.Fatalf("Error generating hash: %v", err)
	}
	fmt.Println(string(bytes))
}
