# FutureSelf - Career Preparation App

A React Native mobile application designed to help students prepare for placements and career growth. The app integrates with Firebase for backend support and provides role-based access for Students, Mentors, and Admins.

## 🚀 Features

### Authentication & User Management
- Email/password login & signup
- Google login option (coming soon)
- Role-based access: Student, Mentor, Admin
- Secure user profile management

### Student Features
- **ATS-friendly resume builder** with PDF export
- **Aptitude tests & coding tests** with real-time results
- **Career roadmap generator** with AI-powered suggestions
- Progress tracking with analytics dashboard
- Gamification with badges and achievements

### Mentor Features
- Review student resumes with detailed feedback
- Assign custom tests and practice modules
- Track student progress and performance
- Provide mentorship and guidance

### Admin Features
- Manage users (students & mentors)
- Create and manage aptitude/coding questions
- View platform analytics and performance stats
- System monitoring and user management

### Additional Features
- Push notifications (Firebase Cloud Messaging)
- Dark/light mode toggle
- Real-time data synchronization
- Offline support for core features

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Firebase (Auth, Firestore, Storage, Functions, FCM)
- **UI:** React Native Paper
- **Navigation:** React Navigation
- **PDF Generation:** expo-print
- **Charts/Graphs:** Victory Native
- **State Management:** React Context API

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FutureSelf
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Storage
   - Cloud Functions
   - Cloud Messaging

3. Download your Firebase configuration file and replace the config in `firebase.config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules

Set up the following security rules in your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Resumes - users can manage their own
    match /resumes/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Tests - readable by all authenticated users
    match /tests/{testId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Test results - users can manage their own
    match /testResults/{resultId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Run the Application

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📁 Project Structure

```
FutureSelf/
├── src/
│   ├── components/          # Reusable components
│   ├── constants/           # App constants and configurations
│   ├── context/            # React Context providers
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── Auth/          # Authentication screens
│   │   ├── Student/       # Student-specific screens
│   │   ├── Mentor/        # Mentor-specific screens
│   │   └── Admin/         # Admin-specific screens
│   └── utils/             # Utility functions
├── firebase.config.js     # Firebase configuration
├── App.js                # Main app component
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### App Configuration
- Update app name and version in `app.json`
- Configure push notification settings
- Set up deep linking if needed

## 🚀 Deployment

### Android
1. Build the APK:
```bash
expo build:android
```

2. Upload to Google Play Store

### iOS
1. Build for iOS:
```bash
expo build:ios
```

2. Upload to App Store

## 📊 Features Implementation Status

- [x] Project setup and configuration
- [x] Firebase integration
- [x] Authentication system
- [x] Role-based navigation
- [x] Student dashboard
- [x] Resume builder with PDF export
- [x] Test system structure
- [x] Career roadmap generator
- [x] Analytics dashboard
- [x] Mentor dashboard
- [x] Admin dashboard
- [x] User management
- [x] Test management
- [ ] Push notifications
- [ ] Google authentication
- [ ] Dark mode toggle
- [ ] Gamification system
- [ ] Real-time chat
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- AI-powered career recommendations
- Video interview practice
- Company-specific preparation modules
- Social features and networking
- Advanced analytics and insights
- Integration with job portals
- Mobile app for mentors and admins
- Web dashboard for comprehensive management

---

**FutureSelf** - Empowering students for successful careers! 🚀
