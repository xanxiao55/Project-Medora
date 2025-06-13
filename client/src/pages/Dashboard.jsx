import { Outlet, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Plus, 
  Trophy, 
  FileText, 
  User,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Dashboard overview and statistics'
    },
    {
      title: 'Add Marathon',
      href: '/dashboard/add-marathon',
      icon: Plus,
      description: 'Create a new marathon event'
    },
    {
      title: 'My Marathons',
      href: '/dashboard/my-marathons',
      icon: Trophy,
      description: 'Manage your created marathons'
    },
    {
      title: 'My Applications',
      href: '/dashboard/my-applies',
      icon: FileText,
      description: 'View and manage your registrations'
    },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || user.email}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          © 2024 MarathonHub
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Dashboard - MarathonHub</title>
        <meta name="description" content="Manage your marathons and registrations from your personal dashboard." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
              <SidebarContent />
            </div>
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <div className="bg-white dark:bg-slate-800 h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex-1 lg:ml-64">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Dashboard
                </h1>
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>
            </div>

            {/* Page Content */}
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
