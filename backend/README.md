# Rama Kuti Rentings - Backend API

राम राम! Welcome to the backend API for Rama Kuti Rentings, a Rajasthan-inspired property rental platform.

## Features

### 🏛️ Core Features
- **User Authentication**: JWT-based secure authentication
- **Property Management**: CRUD operations for properties
- **Rental Management**: Track rentals, payments, and dues
- **Image Upload**: Property image management
- **Admin Dashboard**: Complete admin control panel
- **Multi-language Support**: Hindi + English responses

### 🏠 User Features
- View rented properties
- Check due rent amounts
- Payment history
- Profile management

### 👑 Admin Features
- Property CRUD operations
- User management
- Rental oversight
- Image upload for properties
- Dashboard with statistics
- Overdue rent tracking

## Tech Stack

- **Framework**: Go Gin
- **Database**: MongoDB (Free Tier Compatible)
- **Authentication**: JWT
- **File Upload**: Local storage with static serving
- **CORS**: Configured for React frontend

## Setup Instructions

### Prerequisites
- Go 1.21+
- MongoDB Atlas account (free tier) or local MongoDB
- Git

### Installation

1. **Clone and Setup**
   ```bash
   cd backend
   go mod tidy
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **MongoDB Setup**
   - Create a free cluster on MongoDB Atlas
   - Get your connection string
   - Create database: `rama_kuti_rentings`

4. **Run the Server**
   ```bash
   go run main.go
   ```

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Properties
- `GET /api/v1/properties` - List all properties (with filters)
- `GET /api/v1/properties/:id` - Get single property
- `POST /api/v1/properties` - Create property (Admin)
- `PUT /api/v1/properties/:id` - Update property (Admin)
- `DELETE /api/v1/properties/:id` - Delete property (Admin)
- `POST /api/v1/properties/upload` - Upload property images (Admin)

### Rentals
- `GET /api/v1/rentals/my-rentals` - User's rentals
- `GET /api/v1/rentals/my-dues` - User's due amounts
- `POST /api/v1/rentals` - Create rental agreement (Admin)
- `POST /api/v1/rentals/:id/payment` - Record payment

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/users` - All users
- `GET /api/v1/admin/rentals` - All rentals
- `GET /api/v1/admin/overdue` - Overdue rentals

## Sample Requests

### Register User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "राजेश शर्मा",
    "email": "rajesh@example.com",
    "phone": "+91-9876543210",
    "password": "password123",
    "address": {
      "street": "गोविंद मार्ग",
      "city": "जयपुर",
      "state": "राजस्थान",
      "district": "जयपुर",
      "pincode": "302001"
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh@example.com",
    "password": "password123"
  }'
```

### Create Property (Admin)
```bash
curl -X POST http://localhost:8080/api/v1/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Prime Shop in Pink City Market",
    "description": "Beautiful shop space in the heart of Jaipur",
    "type": "shop",
    "location": {
      "street": "जोहरी बाजार",
      "area": "पुराना शहर",
      "city": "जयपुर",
      "district": "जयपुर",
      "state": "राजस्थान",
      "pincode": "302003",
      "landmark": "हवा महल के पास"
    },
    "rentPerMonth": 25000,
    "securityDeposit": 50000,
    "area": 200,
    "amenities": ["Electricity", "Water", "Security"],
    "features": {
      "hasElectricity": true,
      "hasWater": true,
      "hasParking": false,
      "hasSecurity": true
    }
  }'
```

## Database Collections

### Users
- User authentication and profile data
- Role-based access (tenant/admin)
- Address information

### Properties
- Property details with Rajasthani locations
- Images, amenities, features
- Status tracking

### Rentals
- Rental agreements
- Payment tracking
- Due amount calculations

## Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based authorization
- Input validation
- CORS protection
- File upload validation

## Production Deployment

1. **Environment Variables**
   ```bash
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_strong_secret_key
   GIN_MODE=release
   PORT=8080
   ```

2. **File Uploads**
   - Configure cloud storage (AWS S3, Cloudinary)
   - Update upload controller accordingly

3. **HTTPS**
   - Use reverse proxy (nginx)
   - SSL certificate setup

## Contributing

राम राम! Contributions are welcome. Please follow Rajasthani cultural values in naming and messaging.

## License

MIT License - राम राम!