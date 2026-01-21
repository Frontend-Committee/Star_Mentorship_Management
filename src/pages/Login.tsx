import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';
import { Star, Users, Shield, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-primary/20 to-sidebar items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.2),transparent_50%)]" />
        
        <div className="relative z-10 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <Star className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-heading font-bold text-sidebar-foreground">Star Union Mentorship</h1>
            <p className="text-xl text-sidebar-foreground/70 max-w-md">
              Empowering growth through structured learning and guidance
            </p>
          </div>

          <div className="flex gap-6 justify-center pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100+</div>
              <div className="text-sm text-sidebar-foreground/60">Members</div>
            </div>
            <div className="w-px bg-sidebar-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">6</div>
              <div className="text-sm text-sidebar-foreground/60">Committees</div>
            </div>
            <div className="w-px bg-sidebar-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-sidebar-foreground/60">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md space-y-8 animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <Star className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold">STAR Mentorship</h1>
          </div>

          <Card className="border-border/50 shadow-card">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-heading">Welcome back</CardTitle>
              <CardDescription>
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole('member')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${role === 'member' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'}`}>
                    <Users className="w-6 h-6" />
                    <span className="text-sm font-medium">Member</span>
                  </button>
                  <button type="button" onClick={() => setRole('admin')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${role === 'admin' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'}`}>
                    <Shield className="w-6 h-6" />
                    <span className="text-sm font-medium">Admin</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-11" />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </> : 'Sign in'}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?
                  </p>
                  <Link to="/signup" className="text-sm text-primary hover:underline font-medium">
                    Create an account
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}