# Clerk to Prisma User Synchronization

This document explains how to set up automatic user synchronization between Clerk authentication and your PostgreSQL database using Prisma.

## Overview

The system automatically creates, updates, and deletes user records in your database when users sign up, update their profiles, or delete their accounts in Clerk.

## Architecture

```
Clerk Auth → Webhook → Prisma → PostgreSQL
     ↓           ↓        ↓         ↓
  User signs   Event    Create/   Database
    up/out    sent     Update    updated
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/redai_db"
```

### 2. Database Setup

Run the setup script:

```bash
./scripts/setup-database.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 3. Clerk Webhook Configuration

1. Go to your Clerk Dashboard
2. Navigate to Webhooks
3. Create a new webhook endpoint:
   - **URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Events**: Select `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique // The ID from Clerk
  email     String   @unique
  name      String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  projects Project[]
  designs  Design[]
  credits  Credit[]

  @@map("users")
}
```

### Related Models

- **Project**: User's interior design projects
- **Design**: Generated designs
- **Image**: Images associated with projects/designs
- **Credit**: User's credit balance for AI features

## API Endpoints

### Webhook Handler

**POST** `/api/webhooks/clerk`

Handles Clerk webhook events:
- `user.created`: Creates new user in database
- `user.updated`: Updates existing user
- `user.deleted`: Deletes user from database

### Manual Sync

**POST** `/api/users/sync`

Manually sync the current user to the database. Useful for:
- Testing the sync functionality
- Syncing existing users who signed up before webhooks were configured

## Usage in Components

### Server Components

```typescript
import { ensureUserInDatabase } from '@/lib/auth-middleware'

export default async function DashboardPage() {
  const { user } = await ensureUserInDatabase()
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Credits: {user.credits[0]?.amount || 0}</p>
    </div>
  )
}
```

### Client Components

```typescript
import { getCurrentUser } from '@/lib/auth-middleware'

export default async function UserProfile() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

## Error Handling

The system includes comprehensive error handling:

- **Webhook verification**: Ensures requests come from Clerk
- **Database errors**: Logs and handles database operation failures
- **Missing data**: Handles cases where required user data is missing
- **Duplicate users**: Prevents duplicate user creation

## Testing

### Test Webhook Locally

1. Use ngrok to expose your local server:
   ```bash
   ngrok http 3000
   ```

2. Update your Clerk webhook URL to the ngrok URL

3. Test user registration and check the database

### Test Manual Sync

```bash
curl -X POST http://localhost:3000/api/users/sync \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook secret in `.env`
   - Check server logs for errors

2. **Database connection issues**
   - Verify `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Check database permissions

3. **User not syncing**
   - Check webhook is configured for correct events
   - Verify user has email address in Clerk
   - Check server logs for sync errors

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=prisma:*
```

## Security Considerations

- Webhook requests are verified using Svix signatures
- Database operations use parameterized queries
- User data is validated before database operations
- Sensitive data is not logged

## Performance

- Prisma client is singleton to prevent connection pool exhaustion
- Database operations are optimized with proper indexing
- Webhook processing is asynchronous

## Monitoring

Monitor the following:

- Webhook delivery success rate
- Database operation success rate
- User sync latency
- Error rates and types

## Support

For issues with:
- **Clerk**: Check [Clerk Documentation](https://clerk.com/docs)
- **Prisma**: Check [Prisma Documentation](https://www.prisma.io/docs)
- **This implementation**: Check server logs and database state 