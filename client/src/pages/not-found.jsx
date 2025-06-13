import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | MarathonHub</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-slate-900 dark:text-white">404</h1>
          <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300 mt-4">
            Page Not Found
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">
            Sorry, the page you are looking for doesn't exist.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </>
  );
}