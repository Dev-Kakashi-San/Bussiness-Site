package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Rental struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	PropertyID       primitive.ObjectID `json:"propertyId" bson:"propertyId" binding:"required"`
	TenantID         primitive.ObjectID `json:"tenantId" bson:"tenantId" binding:"required"`
	StartDate        time.Time          `json:"startDate" bson:"startDate" binding:"required"`
	EndDate          *time.Time         `json:"endDate" bson:"endDate"`
	MonthlyRent      float64            `json:"monthlyRent" bson:"monthlyRent"`
	SecurityDeposit  float64            `json:"securityDeposit" bson:"securityDeposit"`
	Status           string             `json:"status" bson:"status"` // "active", "terminated", "expired"
	PaymentHistory   []Payment          `json:"paymentHistory" bson:"paymentHistory"`
	DueAmount        float64            `json:"dueAmount" bson:"dueAmount"`
	NextDueDate      time.Time          `json:"nextDueDate" bson:"nextDueDate"`
	Agreement        AgreementDetails   `json:"agreement" bson:"agreement"`
	CreatedAt        time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt        time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type Payment struct {
	ID            primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Amount        float64            `json:"amount" bson:"amount"`
	PaymentDate   time.Time          `json:"paymentDate" bson:"paymentDate"`
	PeriodMonth   int                `json:"periodMonth" bson:"periodMonth"`
	PeriodYear    int                `json:"periodYear" bson:"periodYear"`
	PaymentMethod string             `json:"paymentMethod" bson:"paymentMethod"` // "cash", "online", "cheque"
	TransactionID string             `json:"transactionId" bson:"transactionId"`
	Status        string             `json:"status" bson:"status"` // "paid", "pending", "failed"
	Remarks       string             `json:"remarks" bson:"remarks"`
	CreatedAt     time.Time          `json:"createdAt" bson:"createdAt"`
}

type AgreementDetails struct {
	Duration        int       `json:"duration" bson:"duration"` // in months
	RentIncrement   float64   `json:"rentIncrement" bson:"rentIncrement"` // yearly increment %
	NoticePeriod    int       `json:"noticePeriod" bson:"noticePeriod"` // in days
	Terms           []string  `json:"terms" bson:"terms"`
	SignedDate      time.Time `json:"signedDate" bson:"signedDate"`
	AgreementURL    string    `json:"agreementUrl" bson:"agreementUrl"`
}

type RentalRequest struct {
	PropertyID      string             `json:"propertyId" binding:"required"`
	TenantID        string             `json:"tenantId" binding:"required"`
	StartDate       time.Time          `json:"startDate" binding:"required"`
	MonthlyRent     float64            `json:"monthlyRent" binding:"required"`
	SecurityDeposit float64            `json:"securityDeposit"`
	Agreement       AgreementDetails   `json:"agreement"`
}