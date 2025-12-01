# Smart Task Evaluator 🚀

AI-Powered SaaS platform for code evaluation with Gen-AI integration. Built for the Full-Stack Gen-AI Developer Hiring Assignment.

## 🎯 Project Overview

A production-ready SaaS web application that allows users to:
- Submit coding tasks for AI evaluation
- Receive detailed AI feedback (score, strengths, weaknesses, improvements)
- Pay to unlock full reports
- Access past evaluations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Styling and responsive design
- **React Hooks** - State management

### Backend
- **Supabase** - Authentication, Database, and RLS
- **PostgreSQL** - Database via Supabase
- **Row Level Security (RLS)** - Enabled for data protection

### AI Integration
- **Groq API** - LLM integration using Llama-3.1-8b-instant
- **GitHub Copilot** - AI coding assistant during development
- **Claude Sonnet 4.5** - AI pair programming

## 📁 Database Schema

### Tables

#### `tasks`
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  description text NOT NULL,
  code text NOT NULL,
  language text DEFAULT 'javascript',
  score integer,
  strengths text,
  weaknesses text,
  improvements text,
  is_paid boolean DEFAULT false,
  payment_id uuid REFERENCES payments(id),
  created_at timestamptz DEFAULT now()
);
```

#### `payments`
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  task_id uuid REFERENCES tasks(id),
  amount integer NOT NULL,
  status text DEFAULT 'pending',
  provider text DEFAULT 'demo',
  created_at timestamptz DEFAULT now()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own tasks
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-task-evaluator.git
cd smart-task-evaluator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Features

### ✅ Implemented Features

- **User Authentication**
  - Email/Password signup and login
  - Secure session management with Supabase Auth
  - Username display with user metadata

- **Dashboard**
  - Task submission form (description + code)
  - Language selector with 12+ programming languages (JavaScript, Python, Java, C++, C#, TypeScript, Go, Rust, PHP, Ruby, Swift, Kotlin)
  - Auto-detection of code language with mismatch warnings
  - Character counters with minimum requirements (50+ chars description, 20+ chars code)
  - AI evaluation with real-time feedback
  - Past reports list with view access
  - Responsive design for all devices

- **AI Evaluation**
  - Integration with Groq LLM API
  - Returns: Score (0-100), Strengths, Weaknesses, Improvements
  - JSON parsing with error handling
  - Retry logic for failed API calls

- **Payment System**
  - Demo payment flow (₹99)
  - Payment tracking in database
  - Unlock full report after payment
  - Beautiful payment UI with features showcase

- **Task Reports**
  - Color-coded score display
  - Detailed feedback sections
  - Code syntax highlighting
  - Locked/unlocked improvements section

### 🎯 Responsive Design
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Touch-friendly buttons and inputs
- Optimized typography and spacing

## 🤖 AI Tools Used

### During Development:
- **GitHub Copilot** - Code completion and suggestions
- **Claude Sonnet 4.5** - Architecture design and debugging
- **ChatGPT** - Problem-solving and documentation

### In Production:
- **Groq API** (Llama-3.1-8b-instant) - Task evaluation

## 🔧 Manual Edits & Debugging

### Issues Fixed:
1. **JSON Parsing Error** in Groq API route
   - Problem: AI returning malformed JSON with unescaped characters
   - Solution: Added JSON cleanup and validation logic

2. **Authentication Flow**
   - Problem: Root page redirecting to Login instead of Dashboard
   - Solution: Updated routing logic in `page.js`

3. **Responsive Layout Issues**
   - Problem: UI breaking on mobile devices
   - Solution: Implemented comprehensive responsive classes

4. **Username Display**
   - Problem: Showing email instead of username
   - Solution: Fetch from user_metadata with fallback chain

## 📂 Project Structure

```
smart-task-evaluator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── groq/
│   │   │       └── route.js          # AI evaluation API
│   │   ├── dashboard/
│   │   │   └── page.jsx              # Main dashboard
│   │   ├── Login/
│   │   │   └── page.jsx              # Login page
│   │   ├── signup/
│   │   │   └── page.jsx              # Signup page
│   │   ├── tasks/
│   │   │   └── [id]/
│   │   │       └── page.jsx          # Task detail view
│   │   ├── pay/
│   │   │   └── [id]/
│   │   │       └── page.js           # Payment page
│   │   ├── lib/
│   │   │   └── supabaseClient.js     # Supabase config
│   │   ├── globals.css               # Global styles
│   │   ├── layout.jsx                # Root layout
│   │   └── page.jsx                  # Landing page
├── public/
│   └── robot.png                     # Robot logo
├── .env.local                        # Environment variables
├── package.json
└── README.md
```

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Authentication required for all operations
- ✅ User data isolated by user_id
- ✅ Environment variables for sensitive data
- ✅ Secure session management

## 🌐 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

### Environment Variables (Production)
Set these in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

## 📊 Assignment Checklist

### ✅ Mandatory Features
- [x] Frontend with Next.js + Tailwind
- [x] Login/Signup pages
- [x] Dashboard with task submission
- [x] AI evaluation integration (Groq)
- [x] Payment flow
- [x] Past reports access
- [x] Supabase Auth
- [x] Supabase Database
- [x] Row Level Security (RLS)
- [x] Responsive design for all devices

### ✅ AI Integration
- [x] Gen-AI coding assistant used (Copilot, Claude)
- [x] LLM API integration (Groq)
- [x] Returns: Score, Strengths, Weaknesses, Improvements

### ✅ Code Quality
- [x] Clean, readable code
- [x] Error handling
- [x] Loading states
- [x] User feedback (alerts, toasts)

## 📝 License

This project was created for the Full-Stack Gen-AI Developer Hiring Assignment.

## 👨‍💻 Developer

**[Your Name]**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

Built with ❤️ using Next.js, Supabase, and Groq AI
