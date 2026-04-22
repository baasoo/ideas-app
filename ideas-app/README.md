# Ideas App

A web app for recording and storing ideas with tagging, search, and public sharing capabilities.

## Features

- ✅ Create, read, update, and delete ideas
- ✅ Add categories and tags to organize ideas
- ✅ Search across your ideas
- ✅ Make ideas public and share with shareable URLs
- ✅ Simple email/password authentication
- ✅ Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon serverless)
- **Auth**: Custom email/password with bcryptjs and JWT

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

First, create a Neon PostgreSQL project at [https://neon.tech](https://neon.tech) and get your connection string.

Create the database schema by running SQL from `src/lib/schema.sql` in your Neon console.

### 3. Configure Environment Variables

Update `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the app.

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user

### Ideas (Auth Required)

- `GET /api/ideas` - List user's ideas (supports `?search=...&category=...&tag=...`)
- `GET /api/ideas/[id]` - Get single idea
- `POST /api/ideas` - Create idea
- `PATCH /api/ideas/[id]` - Update idea
- `DELETE /api/ideas/[id]` - Delete idea

### Public Ideas (No Auth)

- `GET /api/public/[userId]` - Get all public ideas from user
- `GET /api/public/ideas/[id]` - Get single public idea

## Usage

### Creating an Account

1. Visit the home page and click "Create Account"
2. Enter your email and password (min 6 characters)
3. You'll be logged in and redirected to dashboard

### Creating an Idea

1. From the dashboard, click "+ New Idea"
2. Fill in title (required), description, category, and tags
3. Optionally mark it as public to share
4. Click "Create Idea"

### Searching Ideas

- Use the search box to search by title or description
- Filter by category

### Sharing Ideas

1. When creating/editing an idea, check "Make this idea public"
2. Save the idea, then view it
3. Click "Copy Share URL" to get the shareable link
4. Share the URL with anyone

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── dashboard/      # User dashboard
│   ├── ideas/          # Idea detail/edit pages
│   ├── public/         # Public idea pages
│   └── page.tsx        # Home page
├── components/         # Reusable React components
├── lib/                # Utilities
│   ├── auth.ts         # Auth functions
│   ├── db.ts           # Database connection
│   └── schema.sql      # Database schema
└── types/              # TypeScript types
```
