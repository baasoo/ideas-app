# Ideas App - Developer Guide

## Project Overview

A full-stack Next.js app for recording, organizing, and sharing ideas with tagging, search, and public sharing features.

## Core Architecture

- **Auth**: Email/password with bcryptjs hashing + JWT tokens in httpOnly cookies
- **Database**: Neon PostgreSQL with 3 tables (users, ideas, tags)
- **API**: Next.js App Router with REST endpoints
- **Frontend**: Server components for data fetching, client components for interactivity

## Key Files

**Auth & DB**
- `src/lib/auth.ts` - Password hashing, token generation/verification
- `src/lib/db.ts` - Singleton Neon connection
- `src/lib/schema.sql` - Database schema (run in Neon console)

**API Routes**
- `src/app/api/auth/` - signup, login, logout, me endpoints
- `src/app/api/ideas/` - CRUD endpoints (GET, POST, PATCH, DELETE)
- `src/app/api/public/` - Public idea endpoints (no auth required)

**Pages**
- `src/app/page.tsx` - Home/landing page
- `src/app/login/` & `src/app/signup/` - Auth pages
- `src/app/dashboard/` - User's ideas list with search/filter
- `src/app/ideas/[id]/` - Idea detail/edit page
- `src/app/public/` - Public idea pages

**Components**
- `AuthForm.tsx` - Signup/login form
- `DashboardClient.tsx` - Ideas list with create form
- `IdeaCard.tsx` - Idea card (for lists)
- `IdeaDetail.tsx` - Idea view/edit (for detail pages)
- `Navbar.tsx` - Navigation with logout

## Development Workflow

1. **Setup**: Copy `src/lib/schema.sql` to Neon, set `DATABASE_URL` and `JWT_SECRET` in `.env.local`
2. **Run**: `npm run dev` opens at `http://localhost:3000`
3. **Test Auth Flow**: Signup → Dashboard → Create idea → Edit → Share (toggle public)
4. **Public Links**: Ideas marked public are viewable at `/public/ideas/[id]` and `/public/[userId]`

## Common Tasks

**Adding a new field to ideas**
1. Update schema in `src/lib/schema.sql` (run migration in Neon)
2. Add to `IdeaWithTags` type in `src/types/index.ts`
3. Update API endpoints in `src/app/api/ideas/`
4. Update form components

**Modifying auth flow**
- Password validation: `src/app/api/auth/signup/route.ts`
- Token expiry: `src/lib/auth.ts` (JWT_EXPIRY constant)
- Cookie options: Auth endpoint routes (search for `response.cookies.set`)

**Adding search filters**
- Update `GET /api/ideas` query builder in `src/app/api/ideas/route.ts`
- Update `DashboardClient.tsx` form to pass new params

## Notes

- All idea modifications check ownership before allowing edit/delete (403 if not owner)
- Public ideas are readable by anyone, private ideas only by owner
- Search uses SQL ILIKE for case-insensitive text search
- Tags are stored separately but displayed with ideas in API responses
