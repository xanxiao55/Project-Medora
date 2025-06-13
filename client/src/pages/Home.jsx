import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import HeroCarousel from '../components/HeroCarousel';
import MarathonCard from '../components/MarathonCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Shield, 
  Users, 
  TrendingUp, 
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: "Boston Marathon 2025",
    description: "The world's oldest annual marathon",
    date: "April 21, 2025",
    location: "Boston, MA",
    type: "URGENT",
    timeLeft: "3 days left",
    typeColor: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    borderColor: "border-red-500"
  },
  {
    id: 2,
    title: "London Marathon",
    description: "Run through the heart of London",
    date: "April 28, 2025",
    location: "London, UK",
    type: "POPULAR",
    timeLeft: "1 week left",
    typeColor: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    borderColor: "border-yellow-500"
  },
  {
    id: 3,
    title: "Berlin Marathon",
    description: "Fast and flat course through Berlin",
    date: "May 12, 2025",
    location: "Berlin, Germany",
    type: "ECO-FRIENDLY",
    timeLeft: "2 weeks left",
    typeColor: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    borderColor: "border-green-500"
  },
  {
    id: 4,
    title: "Tokyo Marathon",
    description: "Experience Japanese culture while running",
    date: "May 19, 2025",
    location: "Tokyo, Japan",
    type: "PREMIUM",
    timeLeft: "3 weeks left",
    typeColor: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    borderColor: "border-purple-500"
  },
  {
    id: 5,
    title: "Big Sur Marathon",
    description: "Stunning coastal views of California",
    date: "June 2, 2025",
    location: "Big Sur, CA",
    type: "SCENIC",
    timeLeft: "1 month left",
    typeColor: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    borderColor: "border-blue-500"
  },
  {
    id: 6,
    title: "Marine Corps Marathon",
    description: "Honor our heroes while running",
    date: "June 15, 2025",
    location: "Washington, DC",
    type: "CHARITY",
    timeLeft: "6 weeks left",
    typeColor: "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200",
    borderColor: "border-pink-500"
  }
];

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "MarathonHub made it so easy to find and register for my first marathon. The platform is intuitive and the support is excellent!",
    author: "Sarah Johnson",
    role: "First-time Marathoner",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c4a5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 2,
    rating: 5,
    text: "As a race organizer, MarathonHub has helped me reach runners I never would have found otherwise. Highly recommended!",
    author: "Mike Chen",
    role: "Race Organizer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 3,
    rating: 5,
    text: "I've completed 15 marathons through MarathonHub. The dashboard makes it easy to track all my races and achievements.",
    author: "Emily Rodriguez",
    role: "Ultra Runner",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

const Home = () => {
  const { data: marathons, isLoading } = useQuery({
    queryKey: ['/api/marathons?limit=6&sort=newest'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <>
      <Helmet>
        <title>MarathonHub - Connect, Run, Achieve</title>
        <meta name="description" content="The premier platform connecting marathon organizers with passionate runners worldwide. Find your next challenge and achieve your goals." />
      </Helmet>

      <div>
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Featured Marathons */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Featured Marathons
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Discover amazing running events from around the world. Register now and join thousands of runners.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-300 dark:bg-slate-700 h-48 rounded-t-xl"></div>
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-b-xl">
                      <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                      <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
                      <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
                      <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : marathons && marathons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {marathons.map((marathon) => (
                  <MarathonCard key={marathon.id} marathon={marathon} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  No marathons available at the moment. Check back soon!
                </p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link to="/marathons">
                <Button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-100 px-8 py-3 text-lg font-semibold">
                  View All Marathons
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Don't miss these exciting upcoming marathons. Register early to secure your spot!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className={`border-l-4 ${event.borderColor} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={`${event.typeColor} text-xs font-medium px-2 py-1`}>
                        {event.type}
                      </Badge>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {event.timeLeft}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                      {event.description}
                    </p>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why Join MarathonHub?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Join thousands of runners who trust MarathonHub to find their perfect race and achieve their goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Global Events
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Access marathons from around the world in one convenient platform.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-100 dark:bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Secure Registration
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Safe and secure payment processing with instant confirmation.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Community Support
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Connect with fellow runners and share your journey.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Track Progress
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Monitor your training and race history in your personal dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                What Runners Say
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Hear from our community of passionate runners who have found their perfect race through MarathonHub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {testimonial.author}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-slate-900 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Marathon Journey?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of runners who have discovered their perfect race through MarathonHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marathons">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg font-semibold">
                  Browse Marathons
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg font-semibold"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
