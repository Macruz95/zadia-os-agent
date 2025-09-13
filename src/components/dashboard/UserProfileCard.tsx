'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit2, Mail, Calendar, Building2, Target, Globe } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { UserProfile } from '@/validations/auth.schema';

interface UserProfileCardProps {
  userId: string;
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const { t, i18n } = useTranslation();
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

  const getDateLocale = () => {
    return i18n.language === 'es' ? es : enUS;
  };

  const formatDate = (timestamp: Date | { toDate(): Date } | string | null) => {
    if (!timestamp) return t('common.notAvailable');
    
    try {
      let date: Date;
      
      if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      return format(date, 'PPP', { locale: getDateLocale() });
    } catch {
      return t('common.notAvailable');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground mb-1">
              {t('userProfile.fields.role')}
            </div>
            <Badge variant="secondary" className={getRoleColor(profile.role)}>
              {t(`auth.roles.${profile.role}`)}
            </Badge>
          </div>
          
          <div>
            <div className="font-medium text-muted-foreground mb-1">
              {t('userProfile.fields.language')}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t(`auth.languages.${profile.language}`)}
            </div>
          </div>
        </div>

        {profile.organization && (
          <div>
            <div className="font-medium text-muted-foreground mb-1">
              {t('userProfile.fields.organization')}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {profile.organization}
            </div>
          </div>
        )}

        {profile.objective && (
          <div>
            <div className="font-medium text-muted-foreground mb-1">
              {t('userProfile.fields.objective')}
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-0.5" />
              <p className="text-sm">{t(`auth.objectives.${profile.objective}`)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
          <div>
            <div className="font-medium text-muted-foreground mb-1">
              {t('userProfile.fields.createdAt')}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(profile.createdAt)}
            </div>
          </div>
          
          <div>
            <div className="font-medium text-muted-foreground mb-1">
              {t('userProfile.fields.lastLogin')}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(profile.lastLogin)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
