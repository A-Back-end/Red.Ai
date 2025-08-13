import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import fs from 'fs/promises';
import path from 'path';

// User interface for local database
interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
}

// Helper functions for user database
async function readUsers(): Promise<User[]> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data, (key, value) => {
      // Convert date strings back to Date objects
      if (key.includes('At') && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error reading users:', error);
    // Create empty users file if it doesn't exist
    await ensureUsersFile();
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users.json');
    const backupPath = `${dbPath}.backup.${Date.now()}`;
    
    // Create backup if file exists
    try {
      await fs.copyFile(dbPath, backupPath);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError);
    }
    
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`Successfully saved ${users.length} users to database`);
  } catch (error) {
    console.error('Error writing users:', error);
    throw error;
  }
}

async function ensureUsersFile(): Promise<void> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users.json');
    const dbDir = path.dirname(dbPath);
    
    // Create database directory if it doesn't exist
    await fs.mkdir(dbDir, { recursive: true });
    
    // Create empty users file if it doesn't exist
    try {
      await fs.access(dbPath);
    } catch {
      await fs.writeFile(dbPath, '[]', 'utf-8');
      console.log('Created users.json file');
    }
  } catch (error) {
    console.error('Error ensuring users file:', error);
  }
}

// Convert Clerk user data to our User interface
function convertClerkUser(clerkUser: any): User {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clerkId: clerkUser.id,
    email: clerkUser.email_addresses?.[0]?.email_address || '',
    firstName: clerkUser.first_name || '',
    lastName: clerkUser.last_name || '',
    profileImageUrl: clerkUser.profile_image_url || clerkUser.image_url || '',
    createdAt: new Date(clerkUser.created_at || Date.now()),
    updatedAt: new Date(clerkUser.updated_at || Date.now()),
    lastSignInAt: clerkUser.last_sign_in_at ? new Date(clerkUser.last_sign_in_at) : undefined
  };
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`📝 Webhook with ID ${id} and type ${eventType}`);
  console.log('📋 Webhook body:', JSON.stringify(payload, null, 2));

  // Handle the webhook
  try {
    switch (eventType) {
      case 'user.created':
        console.log('👤 User created event received');
        const newUser = convertClerkUser(evt.data);
        const users = await readUsers();
        
        // Check if user already exists
        const existingUser = users.find(u => u.clerkId === newUser.clerkId);
        if (!existingUser) {
          users.push(newUser);
          await writeUsers(users);
          console.log('✅ New user saved to local database:', newUser.email);
        } else {
          console.log('ℹ️  User already exists in database:', newUser.email);
        }
        break;

      case 'user.updated':
        console.log('🔄 User updated event received');
        const updatedUserData = convertClerkUser(evt.data);
        const allUsers = await readUsers();
        
        const userIndex = allUsers.findIndex(u => u.clerkId === updatedUserData.clerkId);
        if (userIndex !== -1) {
          // Update existing user but keep the original ID and createdAt
          allUsers[userIndex] = {
            ...updatedUserData,
            id: allUsers[userIndex].id,
            createdAt: allUsers[userIndex].createdAt,
            updatedAt: new Date()
          };
          await writeUsers(allUsers);
          console.log('✅ User updated in local database:', updatedUserData.email);
        } else {
          // User doesn't exist, create new one
          allUsers.push(updatedUserData);
          await writeUsers(allUsers);
          console.log('✅ New user created from update event:', updatedUserData.email);
        }
        break;

      case 'user.deleted':
        console.log('🗑️  User deleted event received');
        const deletedClerkId = evt.data.id;
        const remainingUsers = await readUsers();
        const initialCount = remainingUsers.length;
        
        const filteredUsers = remainingUsers.filter(u => u.clerkId !== deletedClerkId);
        if (filteredUsers.length < initialCount) {
          await writeUsers(filteredUsers);
          console.log('✅ User deleted from local database:', deletedClerkId);
        } else {
          console.log('ℹ️  User not found in local database for deletion:', deletedClerkId);
        }
        break;

      case 'session.created':
        console.log('🔐 Session created event received');
        // Update last sign in time
        const sessionUserId = evt.data.user_id;
        if (sessionUserId) {
          const sessionUsers = await readUsers();
          const sessionUserIndex = sessionUsers.findIndex(u => u.clerkId === sessionUserId);
          if (sessionUserIndex !== -1) {
            sessionUsers[sessionUserIndex].lastSignInAt = new Date();
            sessionUsers[sessionUserIndex].updatedAt = new Date();
            await writeUsers(sessionUsers);
            console.log('✅ Updated last sign in time for user:', sessionUserId);
          }
        }
        break;

      case 'session.ended':
        console.log('👋 Session ended event received');
        // Could track session duration here if needed
        break;

      default:
        console.log('❓ Unhandled event type:', eventType);
        console.log('📋 Event data:', JSON.stringify(evt.data, null, 2));
    }
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return new Response(`Error processing webhook: ${error.message}`, { 
      status: 500 
    });
  }

  return new Response('Webhook processed successfully', { status: 200 });
} 