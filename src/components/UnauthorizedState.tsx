import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Card from './Card';

interface UnauthorizedStateProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export default function UnauthorizedState({
  title = 'Access Denied',
  message = 'You do not have permission to access this resource. Please contact your administrator if you believe this is an error.',
  showHomeButton = true,
  showBackButton = true,
}: UnauthorizedStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
      <Card glass className="max-w-lg w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">{message}</p>

        <div className="flex items-center justify-center space-x-3">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </Button>
          )}
          {showHomeButton && (
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
