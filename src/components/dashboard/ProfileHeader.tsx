'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Mail } from 'lucide-react';
import { UserProfile } from '@/validations/auth.schema';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{profile.displayName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {profile.email}
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}