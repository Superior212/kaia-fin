# Kaia Finance AI Agent Backend

A Node.js TypeScript backend for the Kaia Finance AI Agent, providing intelligent financial analysis, wallet insights, and AI-powered recommendations.

## 🚀 Features

- **AI-Powered Analysis**: GeminiAi integration for intelligent financial insights
- **Wallet Integration**: Kaia blockchain integration for transaction analysis
- **Real-time Chat**: WebSocket support for live AI conversations
- **Insight Management**: Store and manage AI-generated financial insights
- **Transaction Analysis**: Categorize and analyze wallet transactions
- **User Management**: User preferences and settings management

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Gemini-2.5-flash
- **Blockchain**: Viem for Kaia blockchain integration
- **Real-time**: Socket.io for WebSocket connections
- **Logging**: Winston
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5+
- OpenAI API key
- Kaia RPC endpoint

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/kaia-finance

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Kaia Blockchain Configuration
KAIA_RPC_URL=https://public-en-kairos.node.kaia.io
KAIA_CHAIN_ID=1001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   └── database.ts  # MongoDB connection
├── controllers/     # Route controllers
├── models/          # MongoDB models
│   ├── User.ts
│   ├── Transaction.ts
│   ├── Insight.ts
│   └── ChatMessage.ts
├── routes/          # API routes
│   ├── ai.ts        # AI chat and analysis
│   ├── wallet.ts    # Wallet operations
│   ├── insights.ts  # Insight management
│   └── users.ts     # User management
├── services/        # Business logic
│   ├── aiService.ts # OpenAI integration
│   └── walletService.ts # Blockchain operations
├── middleware/      # Express middleware
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── utils/           # Utility functions
│   └── logger.ts    # Winston logger
├── types/           # TypeScript type definitions
└── index.ts         # Server entry point
```

## 🔌 API Endpoints

### AI Routes (`/api/ai`)

- `POST /chat` - Chat with AI
- `POST /analyze` - Analyze wallet data
- `GET /chat/:walletAddress` - Get chat history
- `GET /insights/:walletAddress` - Get AI insights
- `PATCH /insights/:insightId/read` - Mark insight as read

### Wallet Routes (`/api/wallet`)

- `GET /balance/:walletAddress` - Get wallet balance
- `GET /transactions/:walletAddress` - Get transaction history
- `POST /sync/:walletAddress` - Sync wallet transactions
- `GET /insights/:walletAddress` - Get transaction insights
- `GET /stats/:walletAddress` - Get transaction statistics

### Insights Routes (`/api/insights`)

- `GET /:walletAddress` - Get all insights
- `GET /insight/:insightId` - Get insight by ID
- `PATCH /:insightId/read` - Mark insight as read
- `PATCH /:walletAddress/read-multiple` - Mark multiple insights as read
- `DELETE /:insightId` - Delete insight
- `GET /:walletAddress/summary` - Get insights summary

### User Routes (`/api/users`)

- `GET /:walletAddress` - Get user by wallet address
- `POST /` - Create or update user
- `PATCH /:walletAddress/preferences` - Update user preferences
- `DELETE /:walletAddress` - Delete user

## 🤖 AI Agent Features

### Financial Analysis

- **Spending Patterns**: Analyze transaction categories and trends
- **Savings Insights**: Calculate savings rate and recommendations
- **Portfolio Analysis**: Token distribution and diversification
- **Risk Assessment**: Identify potential financial risks

### Smart Recommendations

- **DeFi Opportunities**: Suggest optimal yield farming strategies
- **Cost Optimization**: Identify fee-saving opportunities
- **Goal Tracking**: Help users achieve financial goals
- **Budget Suggestions**: Personalized budget recommendations

### Interactive Chat

- **Natural Language**: Conversational AI interface
- **Context Awareness**: Remember conversation history
- **Real-time Responses**: WebSocket-based live chat
- **Multi-language Support**: Support for multiple languages

## 🔒 Security Features

- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed request/response logging
- **CORS**: Configured for frontend integration

## 📊 Database Models

### User

- Wallet address (unique identifier)
- Username and email (optional)
- User preferences (notifications, AI insights, etc.)

### Transaction

- Blockchain transaction data
- Token information and amounts
- Categorization and tags
- Status tracking

### Insight

- AI-generated financial insights
- Priority levels and categories
- Actionable recommendations
- Expiration dates

### ChatMessage

- AI conversation history
- Session management
- Metadata for analysis

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker (Optional)

```bash
docker build -t kaia-finance-backend .
docker run -p 5000:5000 kaia-finance-backend
```

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable         | Description               | Default                                  |
| ---------------- | ------------------------- | ---------------------------------------- |
| `NODE_ENV`       | Environment mode          | `development`                            |
| `PORT`           | Server port               | `5000`                                   |
| `MONGODB_URI`    | MongoDB connection string | `mongodb://localhost:27017/kaia-finance` |
| `GEMINI_API_KEY` | Gemini API key            | Required                                 |
| `GEMINI_MODEL`   | Gemini model to use       | `gemini-2.5-flash`                       |
| `KAIA_RPC_URL`   | Kaia blockchain RPC URL   | Required                                 |
| `KAIA_CHAIN_ID`  | Kaia chain ID             | `1001`                                   |
| `JWT_SECRET`     | JWT signing secret        | Required                                 |
| `CORS_ORIGIN`    | Allowed CORS origin       | `http://localhost:3000`                  |

## 🔧 Configuration

### MongoDB

The backend uses MongoDB for data persistence. Ensure MongoDB is running and accessible.

### Gemini

Get your Gemini API key from [Gemini Platform](https://aistudio.google.com/) and add it to your environment variables.

### Kaia Blockchain

Configure the Kaia blockchain RPC endpoint and chain ID for wallet integration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for the Kaia Finance ecosystem**
