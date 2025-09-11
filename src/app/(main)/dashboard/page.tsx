'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext will redirect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome', { name: user.displayName || user.email?.split('@')[0] || 'Usuario' })}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="md:col-span-2 lg:col-span-1">
          <UserProfileCard userId={user.uid} />
        </div>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.quickActions.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {t('dashboard.quickActions.comingSoon')}
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.systemStatus.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.systemStatus.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">{t('dashboard.systemStatus.operational')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
