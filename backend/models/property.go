package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Property struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title         string             `json:"title" bson:"title" binding:"required"`
	Description   string             `json:"description" bson:"description"`
	Type          string             `json:"type" bson:"type"` // "shop", "partition", "office", "warehouse"
	Location      Location           `json:"location" bson:"location"`
	RentPerMonth  float64            `json:"rentPerMonth" bson:"rentPerMonth" binding:"required"`
	SecurityDeposit float64          `json:"securityDeposit" bson:"securityDeposit"`
	Area          float64            `json:"area" bson:"area"` // in sq ft
	Amenities     []string           `json:"amenities" bson:"amenities"`
	Images        []string           `json:"images" bson:"images"`
	Status        string             `json:"status" bson:"status"` // "available", "occupied", "maintenance"
	Features      PropertyFeatures   `json:"features" bson:"features"`
	CreatedBy     primitive.ObjectID `json:"createdBy" bson:"createdBy"`
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type Location struct {
	Street     string  `json:"street" bson:"street"`
	Area       string  `json:"area" bson:"area"`
	City       string  `json:"city" bson:"city"`
	District   string  `json:"district" bson:"district"`
	State      string  `json:"state" bson:"state"`
	Pincode    string  `json:"pincode" bson:"pincode"`
	Landmark   string  `json:"landmark" bson:"landmark"`
	Latitude   float64 `json:"latitude" bson:"latitude"`
	Longitude  float64 `json:"longitude" bson:"longitude"`
}

type PropertyFeatures struct {
	HasElectricity    bool `json:"hasElectricity" bson:"hasElectricity"`
	HasWater          bool `json:"hasWater" bson:"hasWater"`
	HasParking        bool `json:"hasParking" bson:"hasParking"`
	HasSecurity       bool `json:"hasSecurity" bson:"hasSecurity"`
	HasAC             bool `json:"hasAC" bson:"hasAC"`
	HasWiFi           bool `json:"hasWiFi" bson:"hasWiFi"`
	IsFurnished       bool `json:"isFurnished" bson:"isFurnished"`
	HasRestroom       bool `json:"hasRestroom" bson:"hasRestroom"`
}