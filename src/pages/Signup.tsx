import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Loader2, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
const committees = [{
  id: 'tech',
  name: 'Technology'
}, {
  id: 'design',
  name: 'Design'
}, {
  id: 'marketing',
  name: 'Marketing'
}, {
  id: 'operations',
  name: 'Operations'
}, {
  id: 'hr',
  name: 'Human Resources'
}, {
  id: 'finance',
  name: 'Finance'
}, {
  id: 'events',
  name: 'Events'
}, {
  id: 'media',
  name: 'Media'
}];
export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [committee, setCommittee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!committee) {
      setError('Please select a committee');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/login');
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
            <h1 className="text-5xl font-heading font-bold text-sidebar-foreground">Join Star Union Mentorship</h1>
            <p className="text-xl text-sidebar-foreground/70 max-w-md text-center">
              Begin your journey of growth and mentorship
            </p>
          </div>

          <div className="flex gap-6 justify-center pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">6</div>
              <div className="text-sm text-sidebar-foreground/60">Committees</div>
            </div>
            <div className="w-px bg-sidebar-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="text-sm text-sidebar-foreground/60">Weeks</div>
            </div>
            <div className="w-px bg-sidebar-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-sidebar-foreground/60">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
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
            <h1 className="text-2xl font-heading font-bold">Join STAR</h1>
          </div>

          <Card className="border-border/50 shadow-card">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
              <CardDescription>
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="committee">Committee</Label>
                  <Select value={committee} onValueChange={setCommittee}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your committee" />
                    </SelectTrigger>
                    <SelectContent>
                      {committees.map(c => <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </> : 'Create Account'}
                </Button>

                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?
                  </p>
                  <Link to="/login">
                    <Button variant="outline" className="w-full gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}