# WealthEase - Financial Management System

A modern web-based financial management application with AI-powered analytics and real-time data synchronization.

## 🚀 Features

- **Dashboard**: Comprehensive financial overview with transaction management
- **Analytics Dashboard**: Interactive charts and financial insights
- **Real-time Sync**: Data synchronization between dashboard and analytics
- **AI Finance**: AI-powered financial forecasting and insights
- **Smart Bill Management**: Automated bill tracking and reminders
- **Google OAuth**: Secure authentication system

## 📁 Project Structure

```
WealthEase/
├── backend/                 # Express.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── data/              # Sample data
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/               # Frontend application
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── analytics.html     # Analytics dashboard
│   ├── dashboard.html     # Main dashboard
│   ├── index.html         # Landing page
│   └── login.html         # Login page
├── package.json           # Root package configuration
├── README.md             # This file
└── SETUP_GUIDE.md        # Setup instructions
```

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Configure Environment**:
   - Copy `backend/env.example` to `backend/.env`
   - Add your API keys and configuration

3. **Start the Application**:
   ```bash
   cd backend && node server.js
   ```

4. **Access the Application**:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

## 🔧 Core Components

### Backend
- **Express.js Server**: Main application server
- **Analytics API**: Financial data endpoints
- **Authentication**: Google OAuth integration
- **Data Management**: Transaction storage and processing

### Frontend
- **Dashboard**: Main financial overview
- **Analytics**: Interactive charts and insights
- **Shared Data Manager**: Real-time data synchronization
- **AI Integration**: Financial forecasting features

## 📊 Analytics Features

- **Pie Charts**: Expense distribution by category
- **Donut Charts**: Income vs expense comparison
- **Real-time Updates**: Live data synchronization
- **Category Breakdown**: Detailed spending analysis
- **Savings Rate**: Financial health metrics

## 🔄 Data Integration

- **Real-time Sync**: Changes in dashboard instantly reflect in analytics
- **Cross-tab Sync**: Data synchronization across browser tabs
- **Event-driven**: Custom events for data updates
- **Local Storage**: Client-side data persistence

## 🎨 Design

- **AI Finance Theme**: Dark theme with teal accents
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean and intuitive user experience
- **Smooth Animations**: Enhanced user interactions

## 📱 Usage

1. **Login**: Use Google OAuth or demo credentials
2. **Dashboard**: View financial overview and add transactions
3. **Analytics**: Access detailed financial insights
4. **Real-time**: See instant updates across all features

## 🔒 Security

- **Google OAuth**: Secure authentication
- **User-specific Storage**: Isolated data per user
- **CORS Protection**: Secure API endpoints
- **Input Validation**: Data sanitization

## 📈 Performance

- **Optimized Charts**: Smooth Chart.js animations
- **Efficient Sync**: Minimal data transfer
- **Caching**: Local storage optimization
- **Responsive**: Fast loading times

---

**WealthEase** - Manage your finances with ease and confidence! 💰