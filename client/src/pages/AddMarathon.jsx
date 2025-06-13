import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Image, FileText, Trophy, Clock } from 'lucide-react';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

const AddMarathon = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    distance: '',
    startDate: null,
    regStartDate: null,
    regEndDate: null,
    imageURL: '',
  });

  const createMarathonMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/marathons', data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/marathons'] });
      
      await Swal.fire({
        title: 'Success!',
        text: 'Marathon has been created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      
      navigate('/dashboard/my-marathons');
    },
    onError: async (error) => {
      await Swal.fire({
        title: 'Creation Failed',
        text: error.message || 'Failed to create marathon. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.location || 
        !formData.distance || !formData.startDate || !formData.regStartDate || 
        !formData.regEndDate || !formData.imageURL) {
      await Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Date validation
    const regStart = new Date(formData.regStartDate);
    const regEnd = new Date(formData.regEndDate);
    const startDate = new Date(formData.startDate);

    if (regStart >= regEnd) {
      await Swal.fire({
        title: 'Invalid Dates',
        text: 'Registration end date must be after registration start date.',
        icon: 'warning',
        confirmButtonText: 'Fix Dates',
      });
      return;
    }

    if (regEnd >= startDate) {
      await Swal.fire({
        title: 'Invalid Dates',
        text: 'Marathon start date must be after registration end date.',
        icon: 'warning',
        confirmButtonText: 'Fix Dates',
      });
      return;
    }

    const submitData = {
      ...formData,
      startDate: formData.startDate.toISOString(),
      regStartDate: formData.regStartDate.toISOString(),
      regEndDate: formData.regEndDate.toISOString(),
    };

    createMarathonMutation.mutate(submitData);
  };

  return (
    <>
      <Helmet>
        <title>Add Marathon - MarathonHub</title>
        <meta name="description" content="Create a new marathon event and connect with runners worldwide." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Create New Marathon
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-300 text-center">
                Fill in the details below to create your marathon event
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Marathon Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., NYC Marathon 2024"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your marathon event..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="City, State/Country"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="distance">Distance *</Label>
                      <Select value={formData.distance} onValueChange={(value) => setFormData(prev => ({ ...prev, distance: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3k">3K</SelectItem>
                          <SelectItem value="10k">10K</SelectItem>
                          <SelectItem value="25k">25K</SelectItem>
                          <SelectItem value="42k">42K (Full Marathon)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageURL">Event Image URL *</Label>
                    <div className="relative">
                      <Image className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="imageURL"
                        name="imageURL"
                        type="url"
                        placeholder="https://example.com/marathon-image.jpg"
                        value={formData.imageURL}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Important Dates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Registration Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.regStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.regStartDate ? format(formData.regStartDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.regStartDate}
                            onSelect={(date) => handleDateChange('regStartDate', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Registration End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.regEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.regEndDate ? format(formData.regEndDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.regEndDate}
                            onSelect={(date) => handleDateChange('regEndDate', date)}
                            disabled={(date) => 
                              date < new Date() || 
                              (formData.regStartDate && date <= formData.regStartDate)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Marathon Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleDateChange('startDate', date)}
                            disabled={(date) => 
                              date < new Date() || 
                              (formData.regEndDate && date <= formData.regEndDate)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {formData.imageURL && (
                  <div className="space-y-2">
                    <Label>Image Preview</Label>
                    <div className="aspect-video max-w-md overflow-hidden rounded-lg border">
                      <img
                        src={formData.imageURL}
                        alt="Marathon preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMarathonMutation.isPending}
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                  >
                    {createMarathonMutation.isPending ? 'Creating...' : 'Create Marathon'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AddMarathon;
