#!/usr/bin/env node

// Script to check Clerk environment variables
// This helps debug which keys are actually being used

// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔍 Checking Clerk Environment Variables...\n'));

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV;
console.log(`NODE_ENV: ${chalk.yellow(nodeEnv || 'not set')}`);

// Check Clerk publishable key
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (clerkKey) {
  const keyType = clerkKey.startsWith('pk_test_') ? 
    chalk.green('TEST (development)') : 
    clerkKey.startsWith('pk_live_') ? 
      chalk.red('LIVE (production)') : 
      chalk.yellow('UNKNOWN');
  
  console.log(`Clerk Publishable Key: ${keyType}`);
  console.log(`Key prefix: ${chalk.cyan(clerkKey.substring(0, 20))}...`);
  
  if (clerkKey.startsWith('pk_live_') && (nodeEnv !== 'production')) {
    console.log(chalk.red('⚠️  WARNING: Using LIVE keys in non-production environment!'));
  } else if (clerkKey.startsWith('pk_test_')) {
    console.log(chalk.green('✅ Using TEST keys - good for development'));
  }
} else {
  console.log(chalk.red('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found'));
}

// Check Clerk secret key
const clerkSecret = process.env.CLERK_SECRET_KEY;
if (clerkSecret) {
  const secretType = clerkSecret.startsWith('sk_test_') ? 
    chalk.green('TEST (development)') : 
    clerkSecret.startsWith('sk_live_') ? 
      chalk.red('LIVE (production)') : 
      chalk.yellow('UNKNOWN');
  
  console.log(`Clerk Secret Key: ${secretType}`);
  console.log(`Secret prefix: ${chalk.cyan(clerkSecret.substring(0, 20))}...`);
} else {
  console.log(chalk.red('❌ CLERK_SECRET_KEY not found'));
}

// Check App URLs
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
console.log(`App URL: ${chalk.cyan(appUrl || 'not set')}`);

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
console.log(`API URL: ${chalk.cyan(apiUrl || 'not set')}`);

// Check other important variables
const captchaDisabled = process.env.NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA;
console.log(`Captcha disabled: ${chalk.cyan(captchaDisabled || 'false')}`);

// Summary
console.log(chalk.blue.bold('\n📋 Summary:'));
if (clerkKey?.startsWith('pk_test_') && clerkSecret?.startsWith('sk_test_')) {
  console.log(chalk.yellow('⚠️  Using TEST keys - development mode'));
  console.log(chalk.yellow('💡 Switch to LIVE keys for production'));
} else if (clerkKey?.startsWith('pk_live_') || clerkSecret?.startsWith('sk_live_')) {
  console.log(chalk.green('✅ Using LIVE keys - production mode'));
  console.log(chalk.green('✅ Configuration ready for production deployment'));
} else {
  console.log(chalk.red('❌ Clerk keys not properly configured'));
}

console.log(''); 