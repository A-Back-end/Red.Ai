import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// User interface
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

// Helper functions
async function readUsers(): Promise<User[]> {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users.json');
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data, (key, value) => {
      if (key.includes('At') && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/users - Fetching all users');
    
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    const email = searchParams.get('email');
    
    const users = await readUsers();
    
    if (clerkId) {
      // Get specific user by Clerk ID
      const user = users.find(u => u.clerkId === clerkId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }
    
    if (email) {
      // Get user by email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }
    
    // Return all users with summary
    const summary = {
      totalUsers: users.length,
      recentUsers: users
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
      usersWithProfiles: users.filter(u => u.profileImageUrl).length,
      lastSignInActivity: users
        .filter(u => u.lastSignInAt)
        .sort((a, b) => (b.lastSignInAt?.getTime() || 0) - (a.lastSignInAt?.getTime() || 0))
        .slice(0, 3)
    };
    
    console.log('GET /api/users - Returning users summary');
    
    return NextResponse.json({
      success: true,
      summary,
      users: users.map(user => ({
        ...user,
        // Convert dates to ISO strings for JSON serialization
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastSignInAt: user.lastSignInAt?.toISOString()
      }))
    });
    
  } catch (error: any) {
    console.error('GET /api/users - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/users - Manual user creation');
    
    const body = await request.json();
    const { action, userData } = body;
    
    if (action === 'test_webhook') {
      // Test webhook functionality
      console.log('Testing webhook functionality...');
      
      const testUser = {
        id: 'test_user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'Test',
        last_name: 'User',
        profile_image_url: '',
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      // Simulate webhook events
      const events = ['user.created', 'user.updated'];
      const results = [];
      
      for (const eventType of events) {
        const simulatedEvent = {
          type: eventType,
          data: testUser
        };
        
        console.log(`Simulating ${eventType} event`);
        results.push({
          event: eventType,
          status: 'simulated',
          data: testUser
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Webhook test completed',
        results
      });
    }
    
    if (action === 'cleanup_test_users') {
      // Remove test users
      const users = await readUsers();
      const filteredUsers = users.filter(u => !u.email.includes('test@') && !u.clerkId.includes('test_'));
      
      const dbPath = path.join(process.cwd(), 'database', 'users.json');
      await fs.writeFile(dbPath, JSON.stringify(filteredUsers, null, 2), 'utf-8');
      
      return NextResponse.json({
        success: true,
        message: `Removed ${users.length - filteredUsers.length} test users`,
        remainingUsers: filteredUsers.length
      });
    }
    
    return NextResponse.json({ 
      error: 'Invalid action. Supported actions: test_webhook, cleanup_test_users' 
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('POST /api/users - Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 