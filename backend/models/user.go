package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Email       string             `json:"email" bson:"email" binding:"required,email"`
	Phone       string             `json:"phone" bson:"phone" binding:"required"`
	Password    string             `json:"-" bson:"password" binding:"required"`
	Role        string             `json:"role" bson:"role"` // "tenant", "admin"
	Address     Address            `json:"address" bson:"address"`
	IsActive    bool               `json:"isActive" bson:"isActive"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type Address struct {
	Street   string `json:"street" bson:"street"`
	City     string `json:"city" bson:"city"`
	State    string `json:"state" bson:"state"`
	District string `json:"district" bson:"district"`
	Pincode  string `json:"pincode" bson:"pincode"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string  `json:"name" binding:"required"`
	Email    string  `json:"email" binding:"required,email"`
	Phone    string  `json:"phone" binding:"required"`
	Password string  `json:"password" binding:"required,min=6"`
	Address  Address `json:"address"`
}