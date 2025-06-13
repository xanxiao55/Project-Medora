import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Trophy, 
  UserCheck,
  ArrowLeft,
  User,
  Phone
} from 'lucide-react';
import { formatDate, isRegistrationOpen, getTimeUntilDate } from '../lib/utils';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

const MarathonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    additionalInfo: '',
  });

  const { data: marathon, isLoading, error } = useQuery({
    queryKey: [`/api/marathons/${id}`],
    enabled: !!id,
  });

  const registrationMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/registrations', data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/marathons/${id}`] });
      setIsRegistrationDialogOpen(false);
      setRegistrationData({
        firstName: '',
        lastName: '',
        contact: '',
        additionalInfo: '',
      });
      
      await Swal.fire({
        title: 'Registration Successful!',
        text: 'You have been successfully registered for this marathon.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: async (error) => {
      await Swal.fire({
        title: 'Registration Failed',
        text: error.message || 'Failed to register for marathon. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    },
  });

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const data = {
      marathonId: marathon.id,
      ...registrationData,
    };

    registrationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !marathon) {
    return (
      <>
        <Helmet>
          <title>Marathon Not Found - MarathonHub</title>
        </Helmet>
        
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Trophy className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Marathon Not Found
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  The marathon you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate('/marathons')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Marathons
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const registrationOpen = isRegistrationOpen(marathon.regStartDate, marathon.regEndDate);
  const timeUntil = getTimeUntilDate(marathon.startDate);
  const totalTimeInSeconds = Math.floor((new Date(marathon.startDate) - new Date()) / 1000);

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
    <>
      <Helmet>
        <title>{marathon.title} - MarathonHub</title>
        <meta name="description" content={`Join the ${marathon.title} in ${marathon.location}. Register now for this ${marathon.distance} marathon event.`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Back Button */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/marathons')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marathons
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="aspect-video overflow-hidden rounded-xl">
                <img
                  src={marathon.imageURL}
                  alt={marathon.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Marathon Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={getDistanceBadgeColor(marathon.distance)}>
                        {marathon.distance.toUpperCase()}
                      </Badge>
                      <CardTitle className="text-2xl md:text-3xl font-bold mt-2">
                        {marathon.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <MapPin className="w-5 h-5 mr-3" />
                      <span>{marathon.location}</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Calendar className="w-5 h-5 mr-3" />
                      <span>{formatDate(marathon.startDate)}</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Users className="w-5 h-5 mr-3" />
                      <span>{marathon.totalRegistration} registered</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <Clock className="w-5 h-5 mr-3" />
                      <span>
                        Registration: {formatDate(marathon.regStartDate)} - {formatDate(marathon.regEndDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      About This Marathon
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {marathon.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Countdown Timer */}
              {totalTimeInSeconds > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Time Until Race</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <CountdownCircleTimer
                      isPlaying
                      duration={totalTimeInSeconds}
                      colors={['#3b82f6', '#f59e0b', '#ef4444']}
                      colorsTime={[totalTimeInSeconds, totalTimeInSeconds * 0.3, 0]}
                      size={200}
                      strokeWidth={8}
                    >
                      {({ remainingTime }) => {
                        const time = getTimeUntilDate(marathon.startDate);
                        return (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {time.days}d {time.hours}h
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                              {time.minutes}m {time.seconds}s
                            </div>
                          </div>
                        );
                      }}
                    </CountdownCircleTimer>
                  </CardContent>
                </Card>
              )}

              {/* Registration Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {marathon.totalRegistration}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      runners registered
                    </div>
                  </div>

                  {registrationOpen ? (
                    <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-primary-600 hover:bg-primary-700">
                          <UserCheck className="w-4 h-4 mr-2" />
                          Register Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Register for {marathon.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRegistration} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email (Read-only)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="bg-slate-100 dark:bg-slate-800"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="marathonTitle">Marathon (Read-only)</Label>
                            <Input
                              id="marathonTitle"
                              value={marathon.title}
                              disabled
                              className="bg-slate-100 dark:bg-slate-800"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date (Read-only)</Label>
                            <Input
                              id="startDate"
                              value={formatDate(marathon.startDate)}
                              disabled
                              className="bg-slate-100 dark:bg-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name *</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                  id="firstName"
                                  value={registrationData.firstName}
                                  onChange={(e) => setRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                                  className="pl-10"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name *</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                  id="lastName"
                                  value={registrationData.lastName}
                                  onChange={(e) => setRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                                  className="pl-10"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contact">Contact Number *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                id="contact"
                                value={registrationData.contact}
                                onChange={(e) => setRegistrationData(prev => ({ ...prev, contact: e.target.value }))}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="additionalInfo">Additional Information</Label>
                            <Textarea
                              id="additionalInfo"
                              placeholder="Any additional information or special requirements..."
                              value={registrationData.additionalInfo}
                              onChange={(e) => setRegistrationData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsRegistrationDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={registrationMutation.isPending}
                              className="flex-1 bg-primary-600 hover:bg-primary-700"
                            >
                              {registrationMutation.isPending ? 'Registering...' : 'Register'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="text-center space-y-2">
                      <Button disabled className="w-full">
                        Registration Closed
                      </Button>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Registration period has ended
                      </p>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        Please log in to register
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="w-full"
                      >
                        Login to Register
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarathonDetails;
