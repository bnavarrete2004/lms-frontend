import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userSubtitle?: string;
  userAvatar?: string;
  sessionTime?: string;
  notificationCount?: number;
  actions?: ReactNode;
}

export function Header({
  title,
  subtitle,
  userName,
  userSubtitle,
  userAvatar,
  sessionTime,
  notificationCount = 0,
  actions,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-10 py-6 border-b border-slate-200">
      <div className="flex items-center justify-between">
        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Acciones y Usuario */}
        <div className="flex items-center space-x-6">
          {/* Tiempo de sesión (opcional) */}
          {sessionTime && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
              <div className="flex items-center text-xs">
                <svg className="w-4 h-4 text-jc-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Sesión:</span>
                <span className="font-bold text-jc-blue ml-1">{sessionTime}</span>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          <div className="relative cursor-pointer">
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
            <svg className="w-6 h-6 text-slate-400 hover:text-slate-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* Separador */}
          {(userName || actions) && (
            <div className="h-10 w-[1px] bg-slate-200" />
          )}

          {/* Acciones adicionales */}
          {actions}

          {/* Usuario */}
          {userName && (
            <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
              <Avatar src={userAvatar} name={userName} size="sm" />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700">{userName}</p>
                {userSubtitle && (
                  <p className="text-[10px] text-slate-500">{userSubtitle}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
