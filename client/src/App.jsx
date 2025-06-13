import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import AddMarathon from './pages/AddMarathon';
import Marathons from './pages/Marathons';
import MarathonDetails from './pages/MarathonDetails';
import MyMarathons from './pages/MyMarathons';
import MyApplications from './pages/MyApplications';
import NotFound from './pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Helmet>
              <title>MarathonHub - Connect, Run, Achieve</title>
              <meta name="description" content="The premier platform connecting marathon organizers with passionate runners worldwide." />
            </Helmet>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marathons" element={<Marathons />} />
              <Route path="/marathons/:id" element={<MarathonDetails />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="add-marathon" element={<AddMarathon />} />
                <Route path="my-marathons" element={<MyMarathons />} />
                <Route path="my-applications" element={<MyApplications />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;