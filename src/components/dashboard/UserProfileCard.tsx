'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserService } from '@/services/user.service';
import { UserProfile } from '@/validations/auth.schema';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';

interface UserProfileCardProps {
  userId: string;
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProfile = await UserService.getUserProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            {error || t('userProfile.errors.loadFailed')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <ProfileHeader profile={profile} />
      <ProfileInfo profile={profile} />
    </Card>
  );
}
