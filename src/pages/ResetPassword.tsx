import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useResetPasswordConfirm } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const resetConfirm = useResetPasswordConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to parse uid and token from URL if present (e.g. from an email link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlUid = params.get('uid');
    const urlToken = params.get('token');
    if (urlUid) setUid(urlUid);
    if (urlToken) setToken(urlToken);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!uid || !token) {
      setError('Missing reset identification (UID/Token). Please check your email link.');
      return;
    }

    try {
      await resetConfirm.mutateAsync({
        uid,
        token,
        new_password: newPassword,
      });
      setIsSuccess(true);
      toast.success('Password has been reset successfully');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; response?: { data?: Record<string, string[]> } };
      const backendError = errorObj.response?.data?.non_field_errors?.[0] || 
                           errorObj.response?.data?.new_password?.[0] ||
                           errorObj.message || 
                           'Failed to reset password. The link may be expired.';
      setError(backendError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm shadow-glow">
            <img src="/logo-removebg-preview.png" alt="STAR Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-heading font-bold">STAR Mentorship</h1>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading">Set New Password</CardTitle>
            <CardDescription>
              {isSuccess 
                ? "Your password has been updated successfully" 
                : "Enter your new password below to regain access to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-6">
                <Alert className="bg-primary/10 border-primary/20">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Success!</AlertTitle>
                  <AlertDescription className="text-primary/90">
                    Your password has been reset. Redirecting you to login...
                  </AlertDescription>
                </Alert>
                <Button className="w-full" asChild>
                  <Link to="/login">Go to Login Now</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Hidden or read-only UID/Token if they were in the URL, otherwise show them */}
                {(!uid || !token) && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/20">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reset Credentials</p>
                    <div className="space-y-2">
                      <Label htmlFor="uid">UID</Label>
                      <Input
                        id="uid"
                        value={uid}
                        onChange={(e) => setUid(e.target.value)}
                        placeholder="Enter UID from email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token">Token</Label>
                      <Input
                        id="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter Token from email"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      className="pl-10"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={resetConfirm.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      className="pl-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={resetConfirm.isPending}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={resetConfirm.isPending}>
                  {resetConfirm.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
