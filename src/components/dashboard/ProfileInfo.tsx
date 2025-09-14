'use client';

import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Target, Globe, Calendar } from 'lucide-react';
import { UserProfile } from '@/validations/auth.schema';

interface ProfileInfoProps {
  profile: UserProfile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    return i18n.language === 'es' ? es : enUS;
  };

  const formatDate = (timestamp: Date | { toDate(): Date } | string | null) => {
    if (!timestamp) return t('common.notAvailable');
    
    try {
      let date: Date;
      
      if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
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

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
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
  );
}