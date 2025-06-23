# SatLog - SAT Practice Quiz Application

A modern React application for SAT practice with cloud-based data storage using Supabase.

## Features

- 📝 **Question Logger**: Add and manage SAT practice questions
- 🎯 **Interactive Quizzes**: Take practice quizzes with real-time feedback
- 📊 **Analytics Dashboard**: Track your progress and performance
- 📚 **Quiz History**: Review past quiz attempts and results
- 🔄 **Resume Functionality**: Continue incomplete quizzes
- 🏷️ **Smart Filtering**: Filter questions by section, domain, type, and status
- ☁️ **Cloud Sync**: All data stored securely in Supabase

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Chart.js with React Chart.js 2
- **Icons**: Lucide React, Tabler Icons
- **Animations**: Framer Motion

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SatLog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   In your Supabase project, create the following table:
   ```sql
   -- User data table
   CREATE TABLE user_data (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     data_type TEXT NOT NULL,
     data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

   -- Policy for authenticated users to access their own data
   CREATE POLICY "Users can access their own data" ON user_data
     FOR ALL USING (auth.uid() = user_id);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Data Types

The application stores different types of data in Supabase:

- `questions`: User's practice questions
- `quiz_history`: Completed quiz results
- `in_progress_quizzes`: Quizzes that are partially completed
- `question_answers`: Individual question answer history

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── QuestionLogger.jsx
│   ├── QuestionSelector.jsx
│   ├── QuizPage.jsx
│   ├── QuizHistory.jsx
│   ├── AnalyticsPage.jsx
│   └── SidebarLayout.jsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── useUserData.ts
├── lib/                # Utility libraries
│   ├── supabaseClient.ts
│   └── utils.js
└── data.js            # Sample data and constants
```

## Authentication

The app uses Supabase Auth for user management:

- Email/password authentication
- Secure session management
- User profile management
- Password reset functionality

## Data Storage

All user data is stored in Supabase:

- **Questions**: Practice questions added by users
- **Quiz History**: Results from completed quizzes
- **Progress**: In-progress quiz state for resuming
- **Analytics**: Performance tracking and statistics

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 