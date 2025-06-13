import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import MarathonCard from '../components/MarathonCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';

const Marathons = () => {
  const [sort, setSort] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: marathons, isLoading, error } = useQuery({
    queryKey: [`/api/marathons?sort=${sort}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredMarathons = marathons?.filter(marathon =>
    marathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marathon.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <>
        <Helmet>
          <title>Marathons - MarathonHub</title>
          <meta name="description" content="Discover marathon events from around the world. Find your perfect race and register today." />
        </Helmet>
        
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Unable to Load Marathons
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We're having trouble connecting to our servers. Please try again later.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marathons - MarathonHub</title>
        <meta name="description" content="Discover marathon events from around the world. Find your perfect race and register today." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                All Marathons
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Discover amazing running events from around the world. Find your perfect race and start your journey.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search marathons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Marathons Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          ) : filteredMarathons.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-slate-600 dark:text-slate-300">
                  {searchTerm ? (
                    <>Showing {filteredMarathons.length} results for "{searchTerm}"</>
                  ) : (
                    <>Showing {filteredMarathons.length} marathons</>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMarathons.map((marathon) => (
                  <MarathonCard key={marathon.id} marathon={marathon} />
                ))}
              </div>
            </>
          ) : marathons && marathons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Marathons Available
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                There are no marathons available at the moment. Check back soon for new events!
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Results Found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                No marathons match your search criteria. Try adjusting your search terms.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Marathons;
