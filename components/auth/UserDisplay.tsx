'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { User } from 'lucide-react';

interface UserDisplayProps {
  className?: string;
  showAvatar?: boolean;
  showEmail?: boolean;
}

export const UserDisplay: React.FC<UserDisplayProps> = ({ 
  className = '', 
  showAvatar = true, 
  showEmail = false 
}) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Получаем имя пользователя с fallback
  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.username) {
      return user.username;
    }
    if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.split('@')[0];
    }
    return 'User';
  };

  const displayName = getDisplayName();
  const email = user.emailAddresses?.[0]?.emailAddress;
  const imageUrl = user.imageUrl;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showAvatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {displayName}
        </span>
        {showEmail && email && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserDisplay; 