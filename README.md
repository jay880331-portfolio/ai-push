# AI Push - Intelligent Push Notification SaaS Platform

## 📱 Overview

AI Push is a complete SaaS platform that enables businesses to create and manage push notification campaigns using AI-powered targeting and message generation. With our **OneSignal-style multi-app architecture**, customers can easily integrate multiple apps under a single account and start sending AI-generated push notifications immediately.

**Key Innovation**: Natural language campaign creation - marketers can simply describe their campaign goals and AI will generate optimized push notifications with smart targeting.

## ✨ Key Features

### 🚀 **Multi-App SaaS Architecture** (New!)
- **OneSignal-style Onboarding**: Register multiple apps under one account
- **Unified Firebase Project**: All customer apps use our single Firebase infrastructure
- **Instant Setup**: Download config files and integrate in minutes
- **Cross-App Campaigns**: Target specific apps or all apps at once

### 🤖 **AI-Powered Campaign Creation**
- **Natural Language Interface**: Describe campaigns in plain English
- **Smart Message Generation**: AI creates compelling titles and messages
- **Intelligent Targeting**: AI suggests optimal audience segmentation
- **Timing Optimization**: AI recommends best send times

### 📊 **Complete SaaS Features**
- **Multi-Tenant Architecture**: Company-based data isolation
- **Real-time Analytics**: Track sent and clicked metrics for each campaign
- **Scheduled Delivery**: Automatic push delivery at optimal times
- **App-Specific Targeting**: Filter by app, platform, user behavior
- **RESTful API**: Complete API for integrating with your existing systems

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
├── app/                    # Next.js App Router (Presentation Layer)
├── components/             # React Components (Presentation Layer)
├── stores/                 # Zustand State Management (Presentation Layer)
├── domain/                 # Business Logic (Domain Layer)
│   ├── entities/           # Core business entities
│   └── usecases/           # Use cases and business rules
├── data/                   # Data Layer
│   ├── repositories/       # Data access patterns
│   └── services/           # Data services
├── lib/                    # Infrastructure Layer
│   ├── mongodb.ts          # Database connection
│   ├── firebaseAdmin.ts    # Push notification service
│   ├── openai.ts           # AI service
│   └── auth.ts             # Authentication utilities
├── models/                 # Database Models (Mongoose schemas)
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB database
- OpenAI API key
- Firebase project with FCM enabled

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ai-push
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-push
   OPENAI_API_KEY=your-openai-api-key
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   CRON_SECRET=your-cron-secret-key
   API_KEYS=company1:api-key-1,company2:api-key-2
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the dashboard**
   Open [http://localhost:3000](http://localhost:3000) and sign in with one of your configured API keys.

## 🚀 **Customer Onboarding Flow**

### **For SaaS Customers (OneSignal-style)**

1. **Sign Up & Get API Key**
   - Customer receives API key for their account
   - Access the AI Push dashboard

2. **Register Your App**
   - Enter app name and package name (e.g., com.company.app)
   - Select platform (iOS, Android, or both)
   - Click "Add App"

3. **Download Configuration Files**
   - **Android**: Download `google-services.json`
   - **iOS**: Download `GoogleService-Info.plist`
   - Add files to your mobile app project

4. **Integrate SDK** (5-minute setup)
   - Follow the built-in setup guide
   - Add Firebase SDK to your app
   - Register user tokens with AI Push API

5. **Start Creating AI Campaigns**
   - Use natural language: "Send welcome push to new users"
   - AI generates optimized campaigns automatically
   - Track performance in real-time

## 📡 API Reference

### Authentication
All API requests require an `X-API-Key` header with a valid API key.

### Endpoints

#### App Management

**Register New App**
```http
POST /api/apps/register
Content-Type: application/json
X-API-Key: your-api-key

{
  "appName": "My Awesome App",
  "packageName": "com.company.app",
  "platform": "both"
}
```

**Get Your Apps**
```http
GET /api/apps
X-API-Key: your-api-key
```

**Download App Configuration**
```http
GET /api/apps/config?appId=app-id&platform=android
X-API-Key: your-api-key
```

#### Campaign Management

**Create AI Campaign**
```http
POST /api/campaigns/create
Content-Type: application/json
X-API-Key: your-api-key

{
  "prompt": "Send a promotional push for 20% off on all items this weekend to iOS users who logged in within the last 7 days",
  "appId": "specific-app-id"  // optional: target specific app
}
```

**Get Campaigns**
```http
GET /api/campaigns?limit=50&status=scheduled
X-API-Key: your-api-key
```

#### User Management

**Register User Token**
```http
POST /api/users/token
Content-Type: application/json
X-API-Key: your-api-key

{
  "token": "user-push-token",
  "platform": "ios",
  "userIdInClientApp": "user123",
  "appId": "app-id",  // which app this user belongs to
  "customAttributes": {},
  "tags": ["premium", "active"]
}
```

#### Analytics

**Track Push Click**
```http
POST /api/events/push-clicked
Content-Type: application/json

{
  "campaignId": "campaign-id",
  "userIdInClientApp": "user123",
  "companyId": "company1"
}
```

## 🤖 AI Campaign Generation

The AI system analyzes your natural language prompt and generates:

- **Compelling titles** (max 50 characters)
- **Engaging messages** (max 150 characters)
- **Smart targeting** based on platform, activity, and user segments
- **Optimal send times** considering user behavior patterns
- **Landing URLs** when applicable

### Example Prompts

- "Send a welcome push to new iOS users who signed up today"
- "Remind inactive users about our new features, target Android users who haven't opened the app in 30 days"
- "Flash sale notification for premium users, send at 2 PM today"
- "Weekend promotion for users in the shopping category who bought something last month"

## 📊 Campaign Analytics

Track campaign performance with built-in metrics:

- **Delivery Rate**: Successfully sent notifications
- **Click-through Rate**: Users who clicked the notification
- **Device Information**: Platform and user agent data
- **Timing Analysis**: Optimal send times and user engagement patterns

## 🔧 Configuration

### API Keys Management
For MVP, API keys are configured via environment variables:
```env
API_KEYS=company1:api-key-1,company2:api-key-2
```

In production, consider moving to a database-backed solution.

### Scheduled Push Delivery
Set up a cron job to call the push delivery endpoint:
```bash
# Every minute
* * * * * curl -X POST "https://your-domain.com/api/cron/send-pushes" -H "X-Cron-Secret: your-cron-secret"
```

### Firebase Setup
1. Create a Firebase project
2. Enable Cloud Messaging
3. Generate a service account key
4. Add the credentials to your environment variables

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### 🎨 UI/UX Guidelines

**텍스트 색상 표준** (가독성 최적화):
- `text-gray-800` - 주요 텍스트 (제목, 레이블)
- `text-gray-700` - 보조 텍스트 (설명, 부제목)  
- `text-gray-900` - 강조 텍스트 (헤더, 수치)
- ❌ **사용 금지**: `text-gray-500`, `text-gray-600` (가독성 부족)

📋 자세한 내용: [COLOR_GUIDELINES.md](./COLOR_GUIDELINES.md)

### Technology Stack

- **Frontend**: Next.js 14+, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4
- **Push Notifications**: Firebase Cloud Messaging
- **Authentication**: API Key based

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Set up Vercel Cron Jobs for scheduled push delivery

### Docker
```bash
# Build the Docker image
docker build -t ai-push .

# Run the container
docker run -p 3000:3000 ai-push
```

## 📈 Scaling Considerations

For production usage, consider:

1. **Database**: Use MongoDB Atlas or dedicated MongoDB cluster
2. **Caching**: Implement Redis for session management and caching
3. **Queue System**: Use Bull/BullMQ for handling large push volumes
4. **Load Balancing**: Multiple Next.js instances behind a load balancer
5. **API Rate Limiting**: Implement rate limiting for API endpoints
6. **Monitoring**: Add logging, metrics, and error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the API documentation for technical details