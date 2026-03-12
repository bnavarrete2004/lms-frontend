import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  // Props del Sidebar
  role: 'administrador' | 'relator' | 'estudiante';
  userName: string;
  userSubtitle?: string;
  userAvatar?: string;
  sidebarSections: Array<{
    title?: string;
    items: Array<{
      href: string;
      icon: ReactNode;
      label: string;
      isActive?: boolean;
      badge?: string | number;
      badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'calipso';
      badgeAnimated?: boolean;
    }>;
  }>;
  onLogout?: () => void;
  // Props del Header
  headerTitle: string;
  headerSubtitle?: string;
  sessionTime?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  headerActions?: ReactNode;
  // Contenido principal
  children: ReactNode;
}

export function MainLayout({
  role,
  userName,
  userSubtitle,
  userAvatar,
  sidebarSections,
  onLogout,
  headerTitle,
  headerSubtitle,
  sessionTime,
  notificationCount,
  onNotificationClick,
  headerActions,
  children,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        role={role}
        userName={userName}
        userSubtitle={userSubtitle}
        userAvatar={userAvatar}
        sections={sidebarSections}
        onLogout={onLogout}
      />
      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          userName={userName}
          userSubtitle={userSubtitle}
          userAvatar={userAvatar}
          sessionTime={sessionTime}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          actions={headerActions}
        />
        {/* Contenido */}
        <div className="px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}