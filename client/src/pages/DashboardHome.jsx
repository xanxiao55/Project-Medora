import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Plus,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { formatDate } from '../lib/utils';

const DashboardHome = () => {
  const { user } = useAuth();

  const { data: userMarathons, isLoading: marathonsLoading } = useQuery({
    queryKey: [`/api/marathons/user/${user?.uid}`],
    enabled: !!user?.uid,
  });

  const { data: userRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: [`/api/registrations/user/${user?.uid}`],
    enabled: !!user?.uid,
  });

  const totalRegistrations = userMarathons?.reduce((sum, marathon) => sum + marathon.totalRegistration, 0) || 0;
  const upcomingMarathons = userMarathons?.filter(marathon => new Date(marathon.startDate) > new Date()) || [];
  const recentRegistrations = userRegistrations?.slice(0, 5) || [];

  const getDistanceBadgeColor = (distance) => {
    switch (distance) {
      case '3k': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '10k': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '25k': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '42k': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Runner'}! 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Here's an overview of your marathon activities and registrations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  My Marathons
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {marathonsLoading ? '...' : userMarathons?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Participants
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {marathonsLoading ? '...' : totalRegistrations}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  My Registrations
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {registrationsLoading ? '...' : userRegistrations?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Upcoming Events
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {marathonsLoading ? '...' : upcomingMarathons.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/dashboard/add-marathon">
              <Button className="w-full h-24 flex flex-col items-center justify-center bg-primary-600 hover:bg-primary-700">
                <Plus className="w-6 h-6 mb-2" />
                <span>Create Marathon</span>
              </Button>
            </Link>
            
            <Link to="/dashboard/my-marathons">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                <Trophy className="w-6 h-6 mb-2" />
                <span>Manage Marathons</span>
              </Button>
            </Link>
            
            <Link to="/dashboard/my-applies">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                <Calendar className="w-6 h-6 mb-2" />
                <span>My Applications</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Marathons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Upcoming Marathons</CardTitle>
            <Link to="/dashboard/my-marathons">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {marathonsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : upcomingMarathons.length > 0 ? (
              <div className="space-y-4">
                {upcomingMarathons.slice(0, 3).map((marathon) => (
                  <div key={marathon.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {marathon.title}
                      </h4>
                      <Badge className={getDistanceBadgeColor(marathon.distance)}>
                        {marathon.distance.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {marathon.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatDate(marathon.startDate)}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {marathon.totalRegistration} registered
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  No upcoming marathons
                </p>
                <Link to="/dashboard/add-marathon">
                  <Button className="mt-3" size="sm">
                    Create Your First Marathon
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Registrations</CardTitle>
            <Link to="/dashboard/my-applies">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {registrationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div key={registration.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {registration.marathon?.title || 'Marathon'}
                      </h4>
                      <Badge variant="outline">
                        Registered
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>
                        {registration.firstName} {registration.lastName}
                      </p>
                      <p>
                        Registered on {formatDate(registration.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  No registrations yet
                </p>
                <Link to="/marathons">
                  <Button className="mt-3" size="sm">
                    Browse Marathons
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
