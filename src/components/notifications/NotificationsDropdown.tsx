/**
 * ZADIA OS - Notifications Dropdown
 * 
 * Dropdown de notificaciones con badge
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 120 líneas
 */

'use client';

import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from './use-notifications';

interface NotificationsDropdownProps {
  className?: string;
}

export function NotificationsDropdown({ className }: NotificationsDropdownProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(15);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-lg",
            "text-gray-400 hover:text-white hover:bg-gray-800/50",
            className
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1",
              "flex items-center justify-center",
              "text-[10px] font-bold text-white",
              "bg-cyan-500 rounded-full",
              "animate-pulse"
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-80 p-0",
          "bg-[#161b22] border-gray-700/50",
          "shadow-xl shadow-black/30"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
          <h3 className="font-semibold text-gray-200">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 px-2 text-xs text-gray-500 hover:text-cyan-400"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bell className="h-10 w-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Sin notificaciones</p>
              <p className="text-xs text-gray-600 mt-1">
                Las alertas importantes aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-700/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-gray-500 hover:text-cyan-400"
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

