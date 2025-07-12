# Rama Kuti - Rajasthan Property Rental Platform

A modern property rental platform built with React, TypeScript, and Tailwind CSS, designed specifically for Indian users with a beautiful Rajasthan cultural theme.

## 🏛️ Features

- **Multi-language Support**: Hindi and English
- **Responsive Design**: Mobile-first approach with beautiful UI
- **User Authentication**: JWT-based login system
- **Property Management**: Browse and search rental properties
- **Admin Dashboard**: Complete admin panel for property management
- **Rajasthan Theme**: Culturally rich design with Indian aesthetics
- **Indian Currency**: All pricing in Indian Rupees (₹)

## 🚀 AWS Serverless Deployment

This application is designed to work with AWS serverless architecture:

### Frontend (S3 + CloudFront)
- Static site hosted on S3 bucket
- CloudFront for global CDN distribution
- Domain can be configured with Route 53

### Backend (API Gateway + Lambda)
- AWS API Gateway for REST API endpoints
- Lambda functions for business logic
- DynamoDB or MongoDB Atlas for database
- Cognito for user authentication (optional)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── auth/           # Authentication components
│   ├── admin/          # Admin panel components
│   └── tenant/         # Tenant dashboard components
├── pages/              # Page components
├── context/            # React contexts (Auth, Language)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── config/             # Configuration files
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- AWS Account
- AWS CLI configured

### Local Development
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update API Gateway endpoint in `src/config/api.ts`:
   ```typescript
   BASE_URL: 'https://your-api-gateway-id.execute-api.region.amazonaws.com/prod'
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### AWS Deployment

#### 1. Build the application:
```bash
npm run build
```

#### 2. Deploy to S3:
```bash
# Create S3 bucket (replace with your bucket name)
aws s3 mb s3://your-rama-kuti-bucket

# Enable static website hosting
aws s3 website s3://your-rama-kuti-bucket --index-document index.html --error-document index.html

# Upload build files
aws s3 sync dist/ s3://your-rama-kuti-bucket --delete

# Set bucket policy for public read access
aws s3api put-bucket-policy --bucket your-rama-kuti-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-rama-kuti-bucket/*"
    }
  ]
}'
```

#### 3. Setup CloudFront (Optional but recommended):
```bash
# Create CloudFront distribution pointing to your S3 bucket
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 🔧 Configuration

### API Gateway Setup
1. Create API Gateway REST API
2. Setup Lambda functions for backend logic
3. Configure CORS for your S3 bucket domain
4. Update the API endpoint in `src/config/api.ts`

### Environment Variables
Update the following in your code:
- API Gateway URL in `src/config/api.ts`
- Any other AWS service endpoints

## 🎨 Design System

The application uses a custom design system with:
- **Colors**: Rajasthan-inspired color palette
- **Typography**: Indian-friendly fonts
- **Components**: Accessible, responsive UI components
- **Themes**: Light/dark mode support

## 📱 Mobile Support

- Fully responsive design
- Mobile-first approach
- Touch-friendly interfaces
- Optimized for Indian mobile users

## 🔐 Authentication

- JWT-based authentication
- Secure token storage
- Role-based access (Admin/Tenant)
- Session management

## 💰 Payment Integration (Future)

Ready for integration with Indian payment gateways:
- Razorpay
- PayU
- CCAvenue
- UPI integration

## 🌍 Internationalization

- Hindi and English support
- Easy to add more Indian languages
- RTL support ready

## 📊 Admin Features

- User management
- Property CRUD operations
- Rental tracking
- Payment management
- Analytics dashboard

## 🏠 User Features

- Property search and filtering
- Rental applications
- Payment tracking
- Profile management
- Favorites and wishlist

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and queries, please create an issue in the GitHub repository.

---

**Built with ❤️ for the Indian rental market**
