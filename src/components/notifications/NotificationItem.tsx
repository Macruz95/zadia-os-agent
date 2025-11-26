/**
 * ZADIA OS - Notification Item Component
 * 
 * Individual notification with actions
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 100 líneas
 */

'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap,
  ChevronRight,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from './use-notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-blue-400' },
  success: { icon: CheckCircle2, color: 'text-emerald-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  error: { icon: XCircle, color: 'text-red-400' },
  action: { icon: Zap, color: 'text-purple-400' },
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        "hover:bg-gray-800/50",
        !notification.read && "bg-gray-800/30"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        "bg-gray-800/50"
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium",
            notification.read ? "text-gray-400" : "text-gray-200"
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <Circle className="h-2 w-2 fill-cyan-400 text-cyan-400 flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-600 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
        </p>
      </div>

      {/* Action Arrow */}
      {notification.actionUrl && (
        <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0 mt-1" />
      )}
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}

