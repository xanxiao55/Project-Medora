import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { formatDate } from '../lib/utils';

const MarathonCard = ({ marathon }) => {
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
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={marathon.imageURL}
          alt={marathon.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getDistanceBadgeColor(marathon.distance)}>
            {marathon.distance.toUpperCase()}
          </Badge>
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(marathon.startDate)}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {marathon.title}
        </h3>
        
        <div className="flex items-center text-slate-600 dark:text-slate-300 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="line-clamp-1">{marathon.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span>
            Registration: {formatDate(marathon.regStartDate)} - {formatDate(marathon.regEndDate)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{marathon.totalRegistration} registered</span>
          </div>
          <Link to={`/marathons/${marathon.id}`}>
            <Button className="bg-primary-600 hover:bg-primary-700">
              See Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarathonCard;
