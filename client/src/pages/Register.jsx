import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Image, Chrome } from 'lucide-react';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photoURL: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('At least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      await Swal.fire({
        title: 'Invalid Password',
        html: `Password must have:<br/>• ${errors.join('<br/>• ')}`,
        icon: 'error',
        confirmButtonText: 'Fix Password',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        title: 'Password Mismatch',
        text: 'Passwords do not match. Please try again.',
        icon: 'error',
        confirmButtonText: 'Fix Password',
      });
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        email: formData.email,
        photoURL: formData.photoURL || '',
      });
      
      await Swal.fire({
        title: 'Success!',
        text: 'Your account has been created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      await Swal.fire({
        title: 'Registration Failed',
        text: error.message || 'Failed to create account. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      await Swal.fire({
        title: 'Success!',
        text: 'Your account has been created successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-up error:', error);
      await Swal.fire({
        title: 'Sign Up Failed',
        text: error.message || 'Failed to sign up with Google. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - MarathonHub</title>
        <meta name="description" content="Create your MarathonHub account to start discovering and registering for marathon events worldwide." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-2">🏃</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">MarathonHub</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
            <CardDescription className="text-center">
              Join the running community and start your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoURL">Photo URL (Optional)</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="photoURL"
                    name="photoURL"
                    type="url"
                    placeholder="Enter photo URL"
                    value={formData.photoURL}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.length > 0 && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Password must have:
                    <ul className="list-disc list-inside mt-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={loading || passwordErrors.length > 0}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Register;
