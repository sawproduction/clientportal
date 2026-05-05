# Client Portal

A white-label client portal built with Next.js 16, Supabase Auth, and Tailwind CSS. Features project dashboards, file uploads, and approval workflows.

## Features

- **Authentication**: Supabase Auth with email/password login and registration
- **Project Dashboards**: Visual project cards with progress tracking and status indicators
- **File Upload**: Drag-and-drop file upload with progress indicators
- **Approval Buttons**: One-click approve/reject for pending projects
- **White-Label**: Customizable colors, logo, and branding via CSS variables

## Tech Stack

- Next.js 16.2.4 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth & Storage
- Lucide React icons

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `env.example` to `.env.local` and add your Supabase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## White-Label Customization

Customize the portal branding by editing CSS variables in `app/globals.css`:

```css
:root {
  --color-primary: #0f172a;        /* Primary brand color */
  --color-background: #f8fafc;    /* Page background */
  --color-surface: #ffffff;       /* Card backgrounds */
  --color-text: #0f172a;          /* Main text color */
  /* ... more variables */
}
```

Or use the Settings page (`/dashboard/settings`) for visual customization.

## Project Structure

```
app/
  ├── login/           # Login page
  ├── register/        # Registration page
  ├── auth/callback/   # OAuth callback handler
  ├── dashboard/       # Main dashboard
  │   ├── projects/    # Project list and detail pages
  │   ├── files/       # File management
  │   └── settings/    # User and branding settings
  └── layout.tsx       # Root layout with theme

components/
  ├── sidebar.tsx      # Navigation sidebar
  ├── header.tsx       # Dashboard header
  ├── project-card.tsx # Project display card
  ├── file-upload.tsx  # File upload component
  ├── approval-buttons.tsx # Approve/reject buttons
  └── ...

lib/
  └── supabase/        # Supabase clients (browser, server, middleware)
```

## Deploy

Build for production:

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
