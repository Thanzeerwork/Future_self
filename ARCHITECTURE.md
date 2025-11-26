# 🏗️ Future Self - System Architecture Document

**Version:** 2.0  
**Last Updated:** November 2024  
**Platform:** React Native (Expo) - Mobile & Web

---

## 🎯 **Project Objective**

Future Self is an AI-driven career development and readiness platform that helps students discover their potential, build skills, track progress, and get job-ready — while enabling colleges to monitor performance and simplify placements.

---

## 👥 **User Roles & Access Control**

### 1. **Student** 👨‍🎓
- Primary user of the platform
- Access to all student-facing modules
- Can take tests, build resume, view career roadmap
- Participate in community challenges

### 2. **College Staff / Placement Officer** 👔
- Monitor student performance
- Filter and shortlist candidates
- Manage placement drives
- View analytics and reports

### 3. **Admin** ⚙️
- System-wide management
- User management
- Test creation and management
- Platform analytics

---

## 🧱 **Technology Stack**

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React Native (Expo) | 0.81.4 |
| **React** | React | 19.1.0 |
| **Navigation** | React Navigation | v7 |
| **UI Library** | React Native Paper | 5.14.5 |
| **State Management** | React Context API | - |
| **Backend** | Firebase (BaaS) | v12.2.1 |
| **Database** | Firebase Firestore | - |
| **Authentication** | Firebase Auth | - |
| **Storage** | Firebase Storage | - |
| **AI Integration** | Google Gemini API | 1.5-flash |
| **Code Execution** | Judge0 API | RapidAPI |
| **Charts** | React Native Chart Kit | 6.12.0 |
| **Charts** | Victory Native | 41.20.1 |
| **Local Storage** | AsyncStorage | 2.2.0 |

---

## ⚙️ **System Architecture Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                   │
│  (React Native Screens - Student/Staff/Admin Modules)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Navigation Layer                       │
│        (Role-based Routing & Tab Navigation)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Context/State Layer                       │
│         (AuthContext, ThemeContext, etc.)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                           │
│  (Gemini AI, Judge0, Learning Resources, API Services)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend Services                         │
│     (Firebase Auth, Firestore, Storage, Functions)       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 **Module Breakdown**

### **1️⃣ Authentication & Access Module**

**Location:** `src/screens/Auth/`, `src/context/AuthContext.js`

**Features:**
- Email/Password authentication
- Google OAuth integration
- Role-based access control (Student/Staff/Admin)
- Password reset functionality
- Session persistence with AsyncStorage

**Flow:**
```
Login/SignUp → Firebase Auth → User Profile Creation → Role Assignment → Dashboard Routing
```

**Collections:**
- `users/{userId}` - User profiles with role information

---

### **2️⃣ Student Module**

#### **📋 Profile Setup** (`src/screens/Student/ProfileSetup.js`)

**Features:**
- Personal information collection
- Academic details (Roll Number, Registration Number)
- Profile image upload
- Demographic information
- Skills and interests

**Data Stored:**
- Firestore: `users/{userId}`
- Firebase Storage: Profile images

---

#### **🤖 AI Career Analysis** (`src/screens/Student/LLMAnalysis.js`)

**Service:** `src/services/geminiService.js`

**Features:**
- Resume analysis and parsing
- Career potential assessment (0-100 score)
- Strength/weakness identification
- Career path recommendations
- Skill gap analysis
- Personalized insights using Gemini AI

**Flow:**
```
User Profile + Test Results → Gemini AI Analysis → Career Insights → Roadmap Suggestions
```

**AI Prompts:**
- Career potential calculation
- Resume optimization suggestions
- Skill gap identification
- Career path matching

---

#### **📄 Resume Builder** (`src/screens/Student/ResumeBuilder.js`)

**Service:** `src/services/aiFeedbackService.js`

**Features:**
- ATS-friendly resume templates
- Auto-fill from profile data
- AI-powered resume scoring
- Export options (PDF, DOCX)
- Real-time formatting preview

**ATS Scoring Factors:**
- Keyword optimization
- Format compliance
- Section completeness
- Industry standard compliance

---

#### **🗺️ Career Roadmap** (`src/screens/Student/CareerRoadmap.js`)

**Service:** `src/services/learningResourcesService.js`

**Features:**
- AI-generated personalized roadmap
- Skill-based learning path
- Course recommendations (Coursera, Udemy, LinkedIn Learning)
- Project suggestions
- Timeline and milestones

**Integration:**
- Learning Resources API
- Course catalog APIs
- Progress tracking

---

### **3️⃣ Testing Modules**

#### **📊 Test List & Generator** (`src/screens/Student/TestList.js`, `TestGenerator.js`)

**Service:** `src/services/llmTestService.js`, `src/services/geminiService.js`

**Test Categories:**
1. **Aptitude Tests**
   - Quantitative reasoning
   - Verbal reasoning
   - Logical reasoning
   - Time management

2. **Coding Tests**
   - Multiple choice questions
   - Code completion
   - Algorithm problems
   - Language-specific tests

3. **Technical Tests**
   - System design
   - Database concepts
   - Network protocols
   - Security principles

4. **Soft Skills Tests**
   - Communication
   - Leadership
   - Teamwork
   - Problem-solving approach

**AI Test Generation:**
- Gemini AI generates questions based on:
  - Category
  - Difficulty level (Beginner/Intermediate/Advanced)
  - Topic focus
  - User's previous performance

---

#### **💻 Test Screen** (`src/screens/Student/TestScreen.js`)

**Features:**
- Real-time timer
- Question navigation
- Code editor (for coding tests)
- Auto-save answers
- Screen capture prevention
- Progress tracking

**Code Execution:**
- Service: `src/services/judge0Service.js`
- Supports: JavaScript, Python, Java, C++, and more
- Real-time compilation and execution
- Test case validation

---

#### **📊 Test Results** (`src/screens/Student/TestResults.js`)

**Service:** `src/services/geminiService.js` (for AI feedback)

**Features:**
- Detailed score breakdown
- Question-wise analysis
- AI-generated feedback
- Strength/weakness identification
- Improvement suggestions
- Save results to Firestore

**Data Stored:**
- Collection: `testResults/{resultId}`
- Fields: userId, testId, score, answers, timestamp, AI feedback

---

#### **📈 Skill Gap Analysis** (`src/screens/Student/SkillGapAnalysis.js`)

**Features:**
- Compare current skills vs job requirements
- Visual gap representation
- Priority-based skill development
- Learning resource recommendations
- Progress tracking

---

### **4️⃣ Learning Resources Module** (`src/screens/Student/LearningResources.js`)

**Service:** `src/services/learningResourcesService.js`

**Features:**
- Curated course recommendations
- Filter by category, difficulty, provider
- Progress tracking per course
- Certificate management
- Integration with:
  - Coursera
  - Udemy
  - Google Career Certificates
  - Meta Certificates
  - LinkedIn Learning

**Personalization:**
- AI-recommended courses based on:
  - Skill gaps
  - Career goals
  - Previous test performance
  - Learning history

---

### **5️⃣ Readiness Dashboard** (`src/screens/Student/ReadinessDashboard.js`)

**Features:**
- Overall readiness score (0-100)
- Component scores:
  - Resume Score
  - Aptitude Score
  - Coding Score
  - Technical Score
  - Soft Skills Score
- Progress trends
- Placement readiness index
- Comparison with peers

**Data Sources:**
- Test results
- Resume analysis
- Profile completeness
- Learning progress

---

### **6️⃣ Community Challenges** (`src/screens/Student/CommunityChallenges.js`)

**Features:**
- Weekly challenges (Aptitude/Coding)
- Leaderboards (global & department-wise)
- Badge system
- Challenge submissions
- Peer comparison

**Collections:**
- `challenges/{challengeId}`
- `challengeSubmissions/{submissionId}`

---

### **7️⃣ Job Search & Placement** (`src/screens/Student/JobSearch.js`)

**Service:** `src/services/apiService.js`

**Features:**
- AI-powered job matching
- Match score calculation
- Filter by location, experience, skills
- Application tracking
- Resume auto-fill

**Job Sources:**
- Mock data (can integrate with LinkedIn/Indeed APIs)

---

## 🔁 **Continuous Evaluation Loop**

```
┌─────────────────────────────────────────────────────────┐
│                    START POINT                           │
│                  (User Registration)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Profile Setup & Resume Upload  │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │      AI Career Analysis          │
        │  (Gemini analyzes profile)       │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Career Roadmap Generation      │
        │   (Skills, Courses, Projects)     │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │      Take Tests (Any Category)   │
        │  (Aptitude/Coding/Technical)     │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │      AI Feedback & Analysis     │
        │  (Strengths, Weaknesses, Gaps)   │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │    Skill Gap Analysis            │
        │  (Identify missing skills)       │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Learning Recommendations       │
        │  (Courses, Resources, Projects)    │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Practice & Learn               │
        │  (Complete courses, build projects)│
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Retake Tests                   │
        │  (Measure improvement)            │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Readiness Dashboard Update     │
        │  (Updated scores & readiness)     │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Job Matching & Applications   │
        │  (AI matches jobs, apply)        │
        └─────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │   Placement Tracking             │
        │  (Staff monitors readiness)       │
        └─────────────────────────────────┘
                          ↓
                    [LOOP BACK]
                (Continue testing & learning)
```

---

## 🏢 **College Staff Module**

### **Dashboard** (`src/screens/Staff/StaffDashboard.js`)

**Features:**
- Overview of all students
- Key metrics and statistics
- Recent activity feed
- Quick actions

---

### **Student Reports** (`src/screens/Staff/StudentReports.js`)

**Features:**
- Individual student reports
- Performance history
- Skill progression tracking
- Readiness scores
- Export to PDF/Excel

**Filters:**
- By department
- By batch/year
- By readiness level
- By career domain

---

### **Placement Management** (`src/screens/Staff/PlacementManagement.js`)

**Features:**
- Create placement drives
- Set criteria (skills, scores, readiness)
- Auto-shortlist candidates
- Export candidate lists
- Track application status

---

### **Candidate Shortlisting** (`src/screens/Staff/CandidateShortlist.js`)

**Features:**
- AI-powered candidate matching
- Filter by:
  - Skills
  - Test scores
  - Resume quality
  - Readiness level
- Bulk export
- Comparison view

---

### **Analytics** (`src/screens/Staff/StaffAnalytics.js`)

**Features:**
- Department-wise performance
- Placement statistics
- Skill trend analysis
- Top performers
- Training needs identification

---

## ⚙️ **Admin Module**

### **Dashboard** (`src/screens/Admin/AdminDashboard.js`)
- System-wide overview
- User statistics
- Platform health metrics

### **User Management** (`src/screens/Admin/UserManagement.js`)
- View all users
- Role management
- Account activation/deactivation

### **Test Management** (`src/screens/Admin/TestManagement.js`)
- Create custom tests
- Manage test questions
- Set scoring rules

### **Test Analytics** (`src/screens/Admin/TestAnalytics.js`)
- Test performance metrics
- Question analysis
- Difficulty distribution

---

## 🗄️ **Database Schema (Firestore)**

### **Collections:**

```javascript
users/{userId}
  - uid: string
  - email: string
  - role: 'student' | 'staff' | 'admin'
  - studentName: string
  - rollNo: string
  - registrationNo: string
  - profileImageUrl: string
  - skills: array
  - createdAt: timestamp
  - updatedAt: timestamp

testResults/{resultId}
  - userId: string
  - testId: string
  - category: string
  - score: number
  - answers: object
  - aiFeedback: object
  - completedAt: timestamp

resumes/{userId}
  - userId: string
  - resumeText: string
  - atsScore: number
  - version: number
  - updatedAt: timestamp

challenges/{challengeId}
  - title: string
  - description: string
  - category: string
  - startDate: timestamp
  - endDate: timestamp
  - participants: array

challengeSubmissions/{submissionId}
  - userId: string
  - challengeId: string
  - score: number
  - submittedAt: timestamp

placementDrives/{driveId}
  - company: string
  - criteria: object
  - shortlistedCandidates: array
  - createdAt: timestamp
```

---

## 🤖 **AI Integration Details**

### **Google Gemini API Usage**

**Endpoints Used:**
1. **Career Analysis**
   - Model: `gemini-1.5-flash`
   - Input: User profile + test results
   - Output: Career insights, paths, skill gaps

2. **Test Generation**
   - Generate questions based on category/difficulty
   - Personalized questions based on user profile
   - Fallback questions if API unavailable

3. **Answer Evaluation**
   - Evaluate test answers
   - Provide detailed feedback
   - Suggest improvements

4. **Resume Analysis**
   - ATS optimization feedback
   - Keyword suggestions
   - Format recommendations

**Configuration:** `config/openai.js`

---

## 🚀 **API Services Architecture**

### **Service Layer** (`src/services/`)

```
apiService.js          → Central API wrapper
geminiService.js       → Gemini AI integration
judge0Service.js       → Code execution
llmTestService.js      → Test generation wrapper
learningResourcesService.js → Course recommendations
aiFeedbackService.js   → AI feedback generation
imageUploadService.js  → Profile image handling
```

---

## 🔒 **Security & Permissions**

**Firestore Security Rules:** `firestore.rules`

**Key Rules:**
- Users can read/write their own data
- Staff can read all student data
- Admin has full access
- Public collections (tests, challenges) are read-only for authenticated users

---

## 📊 **Data Flow Examples**

### **Test Taking Flow:**
```
User selects test → TestGenerator → Gemini API generates questions → 
TestScreen displays → User answers → Judge0 executes code (if coding) → 
Submit → Save to Firestore → Gemini evaluates → 
TestResults displays → Update Readiness Dashboard
```

### **Resume Building Flow:**
```
Profile Setup → Resume Builder → Extract profile data → 
Gemini analyzes → ATS scoring → Generate optimized resume → 
Download/Export → Update profile
```

### **Career Analysis Flow:**
```
Complete profile + tests → LLMAnalysis screen → 
Fetch test results → Gemini analyzes → 
Display insights → Generate roadmap → 
Update dashboard
```

---

## 🎨 **UI/UX Architecture**

**Design System:**
- Primary Color: `#2196F3` (Blue)
- Component Library: React Native Paper
- Theme: Light/Dark mode support
- Navigation: Tab + Stack navigation
- Animations: Expo animations, React Native Animated

**Component Structure:**
```
src/components/
  - Alert.js
  - AnimatedButton.js
  - AnimatedCard.js
  - AnimatedChart.js
  - ChartCard.js
  - CourseCard.js
  - CustomButton.js
  - InputField.js
  - Loader.js
  - ProgressBar.js
  - ResumeCard.js
  - Toast.js
```

---

## 🔄 **State Management**

**Context Providers:**
- `AuthContext` - User authentication & profile
- `ThemeContext` - App theming (light/dark)

**Local State:**
- Component-level useState hooks
- Screen-specific state management

---

## 📱 **Navigation Structure**

```
AppNavigator
├── Auth Stack (if not authenticated)
│   ├── Login
│   ├── SignUp
│   └── ForgotPassword
│
└── Main App (if authenticated)
    ├── Student Tabs
    │   ├── Dashboard
    │   ├── Testing
    │   ├── Learning
    │   ├── Community
    │   └── Profile
    │
    ├── Staff Tabs
    │   ├── Dashboard
    │   ├── Reports
    │   ├── Placement
    │   ├── Analytics
    │   └── Settings
    │
    └── Admin Tabs
        ├── Dashboard
        ├── Users
        ├── Tests
        └── Settings
```

---

## 🚦 **Development Workflow**

### **Getting Started:**
1. Clone repository
2. Install dependencies: `npm install`
3. Configure Firebase: Update `firebase.config.js`
4. Add API keys: Update `config/openai.js`
5. Deploy Firestore rules
6. Start development: `npm start`

### **Key Configuration Files:**
- `firebase.config.js` - Firebase setup
- `config/openai.js` - Gemini API key
- `src/services/judge0Service.js` - Judge0 API key
- `app.json` - Expo configuration
- `firestore.rules` - Security rules

---

## 📈 **Performance Optimizations**

1. **Caching:**
   - AsyncStorage for auth persistence
   - Component memoization
   - Lazy loading for screens

2. **API Optimization:**
   - Request debouncing
   - Fallback mechanisms
   - Error handling with retries

3. **Firestore:**
   - Index optimization
   - Pagination for large queries
   - Real-time listeners where appropriate

---

## 🔮 **Future Enhancements**

- [ ] Push notifications for challenges and updates
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Advanced analytics with ML
- [ ] Video interview practice
- [ ] Peer mentoring system
- [ ] Integration with more job portals
- [ ] Blockchain-based certificates

---

## 📚 **Documentation References**

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Judge0 API Docs](https://ce.judge0.com/)

---

**Architecture Version:** 2.0  
**Last Updated:** November 2024  
**Maintained By:** Future Self Development Team

