import DesignStudioPage from '@/components/design-studio/page';
import React from 'react';

// Force dynamic rendering for Clerk authentication (DesignStudio uses useUser)
export const dynamic = 'force-dynamic';

// This is the main route entry file for `/design-studio`
export default function Page() {
  return <DesignStudioPage />;
} 