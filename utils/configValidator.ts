// utils/configValidator.ts
export interface ConfigValidation {
  isValid: boolean;
  missing: string[];
  warnings: string[];
  configured: string[];
}

export const validateConfiguration = (): ConfigValidation => {
  const required = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'BFL_API_KEY'
  ];

  const optional = [
    'OPENAI_API_KEY',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT'
  ];

  const missing: string[] = [];
  const warnings: string[] = [];
  const configured: string[] = [];

  // Check required variables
  required.forEach(key => {
    const value = process.env[key];
    if (!value || value === `your_${key.toLowerCase()}_here` || value.trim() === '') {
      missing.push(key);
    } else {
      configured.push(key);
    }
  });

  // Check optional variables
  optional.forEach(key => {
    const value = process.env[key];
    if (value && value !== `your_${key.toLowerCase()}_here` && value.trim() !== '') {
      configured.push(key);
    }
  });

  // Check for development keys in production
  if (process.env.NODE_ENV === 'production') {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (clerkKey?.includes('pk_test_')) {
      warnings.push('Using Clerk development key in production');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    configured
  };
};

export const logConfigurationStatus = (): void => {
  const validation = validateConfiguration();
  
  console.log('🔧 RED AI Configuration Status:');
  
  if (validation.configured.length > 0) {
    console.log('✅ Configured:', validation.configured.join(', '));
  }
  
  if (validation.missing.length > 0) {
    console.error('❌ Missing required:', validation.missing.join(', '));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings.join(', '));
  }
  
  if (validation.isValid) {
    console.log('🎉 All required configuration is present!');
  } else {
    console.error('💥 Configuration incomplete. Check your .env.local file.');
  }
}; 