import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useResetPassword } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const resetPassword = useResetPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await resetPassword.mutateAsync({ email });
      toast.success('Email verified successfully');
      // On success, navigate to the reset password page as requested
      navigate('/reset-password', { state: { email } });
    } catch (err: unknown) {
      const errorObj = err as { message?: string; response?: { data?: Record<string, string[] | string> } };
      const backendError = errorObj.response?.data?.email?.[0] || 
                           errorObj.response?.data?.detail ||
                           errorObj.message || 
                           'An error occurred. Please try again.';
      setError(String(backendError));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 dark:bg-white/90 backdrop-blur-sm shadow-glow">
            <img src="/MentorshipWebsiteIcon.svg" alt="STAR Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-heading font-bold">STAR Mentorship</h1>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={resetPassword.isPending}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking email...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
