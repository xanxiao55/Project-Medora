import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Search, 
  Users, 
  MapPin,
  Phone,
  User,
  Eye,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';

const MyApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: registrations, isLoading, error } = useQuery({
    queryKey: [`/api/registrations/user/${user?.uid}${searchTerm ? `?search=${searchTerm}` : ''}`],
    enabled: !!user?.uid,
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PUT', `/api/registrations/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/registrations/user/${user?.uid}`] });
      setIsEditDialogOpen(false);
      setEditingRegistration(null);
      
      await Swal.fire({
        title: 'Success!',
        text: 'Registration updated successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: async (error) => {
      await Swal.fire({
        title: 'Update Failed',
        text: error.message || 'Failed to update registration. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    },
  });

  const deleteRegistrationMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/registrations/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/registrations/user/${user?.uid}`] });
      
      await Swal.fire({
        title: 'Cancelled!',
        text: 'Registration has been cancelled successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: async (error) => {
      await Swal.fire({
        title: 'Cancellation Failed',
        text: error.message || 'Failed to cancel registration. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    },
  });

  const handleEdit = (registration) => {
    setEditingRegistration({
      ...registration,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const updateData = {
      firstName: editingRegistration.firstName,
      lastName: editingRegistration.lastName,
      contact: editingRegistration.contact,
      additionalInfo: editingRegistration.additionalInfo,
    };

    updateRegistrationMutation.mutate({ id: editingRegistration.id, data: updateData });
  };

  const handleDelete = async (registrationId, marathonTitle) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will cancel your registration for "${marathonTitle}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'Keep Registration'
    });

    if (result.isConfirmed) {
      deleteRegistrationMutation.mutate(registrationId);
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
          <h1 className="text-2xl font-bold">My Applications</h1>
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
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Unable to Load Applications
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We're having trouble loading your applications. Please try again later.
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
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            My Applications
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your marathon registrations
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by marathon title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      {registrations && registrations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marathon</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden sm:table-cell">Distance</TableHead>
                    <TableHead className="hidden md:table-cell">Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => {
                    const marathon = registration.marathon;
                    return (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {marathon?.title || 'Marathon Title'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {registration.firstName} {registration.lastName}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 md:hidden">
                              {marathon?.location} • {marathon?.distance?.toUpperCase()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4 mr-1" />
                            {marathon?.location || 'Location'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {marathon?.distance && (
                            <Badge className={getDistanceBadgeColor(marathon.distance)}>
                              {marathon.distance.toUpperCase()}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center text-slate-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(registration.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                            Registered
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {marathon?.id && (
                              <Link to={`/marathons/${marathon.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(registration)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(registration.id, marathon?.title || 'this marathon')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : searchTerm ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Results Found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                No registrations match your search for "{searchTerm}".
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Registrations Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                You haven't registered for any marathons yet. Explore available events and start your running journey.
              </p>
              <Link to="/marathons">
                <Button className="bg-primary-600 hover:bg-primary-700">
                  Browse Marathons
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Registration Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Registration</DialogTitle>
          </DialogHeader>
          {editingRegistration && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email (Read-only)</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editMarathonTitle">Marathon (Read-only)</Label>
                <Input
                  id="editMarathonTitle"
                  value={editingRegistration.marathon?.title || 'Marathon Title'}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStartDate">Start Date (Read-only)</Label>
                <Input
                  id="editStartDate"
                  value={editingRegistration.marathon?.startDate ? formatDate(editingRegistration.marathon.startDate) : 'Start Date'}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="editFirstName"
                      value={editingRegistration.firstName}
                      onChange={(e) => setEditingRegistration(prev => ({ ...prev, firstName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="editLastName"
                      value={editingRegistration.lastName}
                      onChange={(e) => setEditingRegistration(prev => ({ ...prev, lastName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editContact">Contact Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="editContact"
                    value={editingRegistration.contact}
                    onChange={(e) => setEditingRegistration(prev => ({ ...prev, contact: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAdditionalInfo">Additional Information</Label>
                <Textarea
                  id="editAdditionalInfo"
                  placeholder="Any additional information or special requirements..."
                  value={editingRegistration.additionalInfo || ''}
                  onChange={(e) => setEditingRegistration(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  rows={3}
                />
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
                  disabled={updateRegistrationMutation.isPending}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  {updateRegistrationMutation.isPending ? 'Updating...' : 'Update Registration'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyApplications;
