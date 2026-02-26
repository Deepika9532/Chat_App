# Live Chat Messaging App - Technical Specification

## 1. Project Overview

**Project Name:** ChatApp  
**Project Type:** Real-time Full-stack Web Application  
**Core Functionality:** A live chat messaging platform where users can sign up, discover other users, and exchange real-time direct messages  
**Target Users:** Anyone needing real-time private messaging capabilities

---

## 2. Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14+ (App Router) | Frontend framework |
| TypeScript | Type safety |
| Convex | Backend, Database, Real-time subscriptions |
| Clerk | Authentication (signup, login, social login) |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |

---

## 3. Database Schema (Convex)

### Tables

#### `users`
```typescript
{
  _id: Id<"users">,
  clerkId: string,           // Clerk user ID
  username: string,
  email: string,
  avatarUrl: string,
  createdAt: number,
  lastSeen: number,          // For online status
  isOnline: boolean
}
```

#### `conversations`
```typescript
{
  _id: Id<"conversations">,
  type: "direct" | "group",
  name?: string,             // For group chats
  memberIds: string[],       // Clerk user IDs
  createdBy: string,
  createdAt: number,
  updatedAt: number
}
```

#### `messages`
```typescript
{
  _id: Id<"messages">,
  conversationId: Id<"conversations">,
  senderId: string,          // Clerk user ID
  content: string,
  createdAt: number,
  isDeleted: boolean,        // For soft delete
  reactions: {              // For message reactions
    emoji: string,
    userId: string
  }[]
}
```

#### `conversation_reads`
```typescript
{
  _id: Id<"conversation_reads">,
  conversationId: Id<"conversations">,
  userId: string,            // Clerk user ID
  lastReadAt: number
}
```

#### `typing_indicators`
```typescript
{
  _id: Id<"typing_indicators">,
  conversationId: Id<"conversations">,
  userId: string,
  isTyping: boolean,
  updatedAt: number
}
```

---

## 4. UI/UX Specification

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#0F172A` | Background, headers |
| Secondary | `#1E293B` | Cards, sidebar |
| Accent | `#3B82F6` | Buttons, links |
| Success | `#22C55E` | Online indicators |
| Text Primary | `#F8FAFC` | Main text |
| Text Secondary | `#94A3B8` | Secondary text |
| Border | `#334155` | Dividers, borders |
| Error | `#EF4444` | Error states |
| Unread Badge | `#EF4444` | Unread message count |

### Typography
- **Font Family:** `Inter`, system-ui, sans-serif
- **Heading Large:** 24px, font-weight: 700
- **Heading Medium:** 18px, font-weight: 600
- **Body:** 14px, font-weight: 400
- **Caption:** 12px, font-weight: 400

### Layout Structure

#### Desktop (≥768px)
```
+------------------+------------------------+
|                  |                        |
|    Sidebar       |      Chat Area         |
|    (280px)       |      (flex-1)          |
|                  |                        |
|  - Conversations |  - Messages            |
|  - User search   |  - Input area          |
|                  |                        |
+------------------+------------------------+
```

#### Mobile (<768px)
```
+------------------------+
|                        |
|     Conversation      |
|      List View        |
|    (full width)       |
+------------------------+

[Back]  Chat View (when open)
+------------------------+
|     Messages           |
|                        |
+------------------------+
|    Input Area          |
+------------------------+
```

### Components

#### 1. Auth Components
- `SignInPage` - Clerk sign-in with email/social
- `SignUpPage` - Clerk sign-up with email/social
- `UserButton` - Avatar with dropdown (profile, logout)

#### 2. Sidebar Components
- `Sidebar` - Main container with responsive behavior
- `UserSearch` - Search input with filtering
- `ConversationList` - List of all conversations
- `ConversationItem` - Single conversation row with:
  - Avatar
  - Name
  - Last message preview (truncated)
  - Timestamp
  - Unread badge (if any)
  - Online indicator (for direct messages)

#### 3. Chat Components
- `ChatArea` - Main chat container
- `MessageList` - Scrollable message container
- `MessageBubble` - Individual message with:
  - Avatar (for others)
  - Content
  - Timestamp
  - Reactions display
  - Delete option (own messages)
- `MessageInput` - Text input with send button
- `TypingIndicator` - "User is typing..." with animation
- `NewMessagesButton` - Floating button when scrolled up

#### 4. Empty States
- `NoConversations` - "No conversations yet"
- `NoMessages` - "No messages yet. Start the conversation!"
- `NoSearchResults` - "No users found"

---

## 5. Functionality Specification

### 5.1 Authentication
- Clerk integration for signup/login
- Social login (Google, GitHub)
- Email/password login
- Protected routes (redirect to sign-in if not authenticated)
- Store user profile in Convex on first sign-up

### 5.2 User Discovery
- Display all registered users (paginated)
- Search by username in real-time
- Exclude current user from list
- Click user to open/create conversation

### 5.3 Messaging
- Send/receive messages in real-time
- Convex mutations for sending
- Convex subscriptions for receiving
- Soft delete (mark as deleted, show "This message was deleted")
- Message reactions (👍 ❤️ 😂 😮 😢)

### 5.4 Timestamps
- Today: "2:34 PM"
- This year: "Feb 15, 2:34 PM"
- Different year: "Feb 15, 2024, 2:34 PM"

### 5.5 Online Status
- Track last seen timestamp
- Show green dot for online users (within last 30 seconds)
- Real-time updates via Convex

### 5.6 Typing Indicator
- Show when other user is typing
- Use Convex for real-time typing status
- Auto-clear after 2 seconds of inactivity

### 5.7 Unread Messages
- Track read status per conversation per user
- Show badge with count
- Clear on conversation open
- Real-time updates

### 5.8 Auto-Scroll
- Auto-scroll to bottom on new messages
- Show "↓ New messages" button if user scrolled up
- Click to scroll to latest

---

## 6. API Routes (Convex Functions)

### Queries
- `getCurrentUser` - Get authenticated user
- `getAllUsers` - List all users except current
- `searchUsers` - Search users by name
- `getConversations` - Get user's conversations
- `getConversation` - Get single conversation
- `getMessages` - Get messages for a conversation
- `getUnreadCount` - Get unread count for a conversation
- `getTypingStatus` - Get typing indicator for a conversation

### Mutations
- `createUser` - Create user profile
- `createConversation` - Create new conversation
- `sendMessage` - Send a message
- `deleteMessage` - Soft delete message
- `addReaction` - Add/remove reaction
- `setTyping` - Set typing status
- `markAsRead` - Mark conversation as read
- `updateLastSeen` - Update user's online status

### Subscriptions
- `onMessages` - Real-time message updates
- `onConversations` - Real-time conversation updates
- `onTypingStatus` - Real-time typing indicator
- `onOnlineStatus` - Real-time online status

---

## 7. File Structure

```
chat-app/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   ├── (chat)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── conversation/
│   │       └── [conversationId]/
│   │           └── page.tsx
│   ├── api/
│   │   └── convex/
│   │       └── [route]/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn components
│   ├── auth/
│   │   └── user-button.tsx
│   ├── chat/
│   │   ├── chat-area.tsx
│   │   ├── message-list.tsx
│   │   ├── message-bubble.tsx
│   │   ├── message-input.tsx
│   │   ├── typing-indicator.tsx
│   │   └── new-messages-button.tsx
│   └── sidebar/
│       ├── sidebar.tsx
│       ├── user-search.tsx
│       ├── conversation-list.tsx
│       └── conversation-item.tsx
├── convex/
│   ├── schema.ts
│   ├── users.ts
│   ├── conversations.ts
│   ├── messages.ts
│   ├── typing.ts
│   └── index.ts
├── lib/
│   ├── convex-client.ts
│   └── utils.ts
├── public/
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── convex.json
```

---

## 8. Acceptance Criteria

### Authentication
- [ ] User can sign up with email or social login
- [ ] User can log in with existing account
- [ ] User can log out
- [ ] Unauthenticated users are redirected to sign-in

### User Discovery
- [ ] All users are displayed in a list
- [ ] Current user is excluded from the list
- [ ] Search filters users by name in real-time

### Messaging
- [ ] User can send messages
- [ ] Messages appear in real-time for both participants
- [ ] Deleted messages show "This message was deleted"
- [ ] Users can react to messages

### UI/UX
- [ ] Responsive layout works on desktop and mobile
- [ ] Empty states are shown when appropriate
- [ ] Timestamps are formatted correctly
- [ ] Online status is displayed correctly
- [ ] Typing indicator works in real-time
- [ ] Unread message count is accurate
- [ ] Auto-scroll and "New messages" button work

---

## 9. Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=
```

---

## 10. Deployment

- **Platform:** Vercel
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Environment:** Production

---

*Last Updated: 2026-02-22*
