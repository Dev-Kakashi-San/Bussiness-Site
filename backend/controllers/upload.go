package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadPropertyImages(c *gin.Context) {
	// Create uploads directory if it doesn't exist
	uploadsDir := "./uploads/properties"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory",
		})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to parse form",
			"message": "फाइल अपलोड करने में त्रुटि",
		})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No files uploaded",
			"message": "कोई फाइल नहीं मिली",
		})
		return
	}

	var uploadedFiles []string
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}

	for _, file := range files {
		// Validate file extension
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if !allowedExts[ext] {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid file format. Only JPG, PNG, WEBP allowed",
				"message": "केवल JPG, PNG, WEBP फाइलें स्वीकार्य हैं",
			})
			return
		}

		// Generate unique filename
		timestamp := time.Now().Unix()
		filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)
		filePath := filepath.Join(uploadsDir, filename)

		// Save file
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save file",
				"message": "फाइल सेव करने में त्रुटि",
			})
			return
		}

		// Add to uploaded files list with relative path for API access
		uploadedFiles = append(uploadedFiles, "/uploads/properties/"+filename)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "फाइलें सफलतापूर्वक अपलोड हुईं",
		"files":   uploadedFiles,
	})
}

func DeletePropertyImage(c *gin.Context) {
	imagePath := c.Param("path")
	
	// Security check - ensure path is within uploads directory
	if !strings.HasPrefix(imagePath, "/uploads/properties/") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid image path",
		})
		return
	}

	// Remove leading slash and construct full path
	fullPath := "." + imagePath
	
	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Image not found",
			"message": "तस्वीर नहीं मिली",
		})
		return
	}

	// Delete file
	if err := os.Remove(fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete image",
			"message": "तस्वीर हटाने में त्रुटि",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "तस्वीर हटा दी गई",
	})
}