import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Calendar as CalendarIcon,
  MapPin,
  Image,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

const MyMarathons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingMarathon, setEditingMarathon] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: marathons, isLoading, error } = useQuery({
    queryKey: [`/api/marathons/user/${user?.uid}`],
    enabled: !!user?.uid,
  });

  const updateMarathonMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/marathons/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/marathons/user/${user?.uid}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/marathons'] });
      setIsEditDialogOpen(false);
      setEditingMarathon(null);
      
      await Swal.fire({
        title: 'Success!',
        text: 'Marathon updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: async (error) => {
      await Swal.fire({
        title: 'Update Failed',
        text: error.message || 'Failed to update marathon. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    },
  });

  const deleteMarathonMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/marathons/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/marathons/user/${user?.uid}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/marathons'] });
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Marathon has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: async (error) => {
      await Swal.fire({
        title: 'Delete Failed',
        text: error.message || 'Failed to delete marathon. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    },
  });

  const handleEdit = (marathon) => {
    setEditingMarathon({
      ...marathon,
      startDate: new Date(marathon.startDate),
      regStartDate: new Date(marathon.regStartDate),
      regEndDate: new Date(marathon.regEndDate),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const updateData = {
      title: editingMarathon.title,
      description: editingMarathon.description,
      location: editingMarathon.location,
      distance: editingMarathon.distance,
      startDate: editingMarathon.startDate.toISOString(),
      regStartDate: editingMarathon.regStartDate.toISOString(),
      regEndDate: editingMarathon.regEndDate.toISOString(),
      imageURL: editingMarathon.imageURL,
    };

    updateMarathonMutation.mutate({ id: editingMarathon.id, data: updateData });
  };

  const handleDelete = async (marathonId, marathonTitle) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete "${marathonTitle}" and all its registrations.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      deleteMarathonMutation.mutate(marathonId);
    }
  };

  const getDistanceBadgeColor = (distance) => {
    switch (distance) {
      case '3k': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '10k': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '25k': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '42k': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Marathons</h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Trophy className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Unable to Load Marathons
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We're having trouble loading your marathons. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            My Marathons
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your created marathon events
          </p>
        </div>
        <Link to="/dashboard/add-marathon">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Marathon
          </Button>
        </Link>
      </div>

      {/* Marathons Table */}
      {marathons && marathons.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marathon</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Distance</TableHead>
                    <TableHead className="text-center">Registrations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marathons.map((marathon) => (
                    <TableRow key={marathon.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {marathon.title}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 md:hidden">
                            {marathon.location} • {formatDate(marathon.startDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                          <MapPin className="w-4 h-4 mr-1" />
                          {marathon.location}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(marathon.startDate)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={getDistanceBadgeColor(marathon.distance)}>
                          {marathon.distance.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Users className="w-4 h-4 mr-1 text-slate-500" />
                          <span className="font-medium">{marathon.totalRegistration}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/marathons/${marathon.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(marathon)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(marathon.id, marathon.title)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Marathons Created Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Start organizing your first marathon event and connect with runners worldwide.
              </p>
              <Link to="/dashboard/add-marathon">
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Marathon
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Marathon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Marathon</DialogTitle>
          </DialogHeader>
          {editingMarathon && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Marathon Title *</Label>
                <Input
                  id="editTitle"
                  value={editingMarathon.title}
                  onChange={(e) => setEditingMarathon(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description *</Label>
                <Textarea
                  id="editDescription"
                  value={editingMarathon.description}
                  onChange={(e) => setEditingMarathon(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editLocation">Location *</Label>
                  <Input
                    id="editLocation"
                    value={editingMarathon.location}
                    onChange={(e) => setEditingMarathon(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDistance">Distance *</Label>
                  <Select 
                    value={editingMarathon.distance} 
                    onValueChange={(value) => setEditingMarathon(prev => ({ ...prev, distance: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3k">3K</SelectItem>
                      <SelectItem value="10k">10K</SelectItem>
                      <SelectItem value="25k">25K</SelectItem>
                      <SelectItem value="42k">42K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editImageURL">Image URL *</Label>
                <Input
                  id="editImageURL"
                  type="url"
                  value={editingMarathon.imageURL}
                  onChange={(e) => setEditingMarathon(prev => ({ ...prev, imageURL: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Registration Start *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingMarathon.regStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingMarathon.regStartDate ? format(editingMarathon.regStartDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingMarathon.regStartDate}
                        onSelect={(date) => setEditingMarathon(prev => ({ ...prev, regStartDate: date }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Registration End *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingMarathon.regEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingMarathon.regEndDate ? format(editingMarathon.regEndDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingMarathon.regEndDate}
                        onSelect={(date) => setEditingMarathon(prev => ({ ...prev, regEndDate: date }))}
                        disabled={(date) => 
                          date < new Date() || 
                          (editingMarathon.regStartDate && date <= editingMarathon.regStartDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Marathon Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingMarathon.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingMarathon.startDate ? format(editingMarathon.startDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingMarathon.startDate}
                        onSelect={(date) => setEditingMarathon(prev => ({ ...prev, startDate: date }))}
                        disabled={(date) => 
                          date < new Date() || 
                          (editingMarathon.regEndDate && date <= editingMarathon.regEndDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMarathonMutation.isPending}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  {updateMarathonMutation.isPending ? 'Updating...' : 'Update Marathon'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyMarathons;
