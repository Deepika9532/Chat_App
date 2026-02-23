# Chat App - Real-time Messaging Application

A full-stack real-time chat messaging application built with Next.js, TypeScript, Convex, and Clerk.

## Features

- 🔐 Authentication with Clerk (email & social login)
- 💬 Real-time direct messaging
- 👥 User search and discovery
- 📱 Responsive design (desktop & mobile)
- 🟢 Online/offline status indicators
- ⌨️ Typing indicators
- 📖 Message timestamps
- ✅ Read receipts
- 💭 Unread message counts
- 😊 Message reactions
- 🗑️ Message deletion

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript
- **Backend:** Convex (database, server functions, real-time)
- **Auth:** Clerk
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI (shadcn/ui)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Clerk account
- Convex account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd chat-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your publishable key and secret key
4. Update `.env.local` with your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. Set up Convex

1. Install Convex CLI:
```bash
npm install -g convex
```

2. Login to Convex:
```bash
npx convex login
```

3. Create a new Convex project:
```bash
npx convex dev
```

4. Copy the Convex URL and deploy key to `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your_deploy_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add the environment variables in Vercel
5. Deploy!

## Project Structure

```
chat-app/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (chat)/           # Chat pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Auth components
│   ├── chat/             # Chat components
│   └── sidebar/          # Sidebar components
├── convex/               # Convex backend functions
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User queries/mutations
│   ├── conversations.ts  # Conversation queries/mutations
│   ├── messages.ts       # Message queries/mutations
│   └── typing.ts         # Typing indicator functions
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CONVEX_URL` | Convex project URL |
| `CONVEX_DEPLOY_KEY` | Convex deploy key |

## License

MIT
"# Chat_App" 
