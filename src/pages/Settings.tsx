import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useSetPassword } from '@/features/auth/hooks';
import { useCommitteeDetails } from '@/features/committees/hooks';
import { useTheme } from '@/components/ThemeProvider';
import { Settings as SettingsIcon, Palette, Lock, Loader2, Sun, Moon, Monitor } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: committee, isLoading: isLoadingCommittee } = useCommitteeDetails(user?.committee);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your committee and platform settings
        </p>
      </div>

      {/* Committee Settings */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <SettingsIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Committee Settings</CardTitle>
                <CardDescription>Configure your committee's basic settings</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingCommittee ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="committee-name">Committee Name</Label>
                <Input id="committee-name" defaultValue={committee?.name || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief description of your committee" defaultValue={committee?.description || ''} />
              </div>
              <Button variant="default">Save Changes</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-base">Theme Preference</Label>
              <p className="text-sm text-muted-foreground">
                Choose how the platform looks to you
              </p>
            </div>
            
            <Tabs 
              defaultValue={theme} 
              onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                <TabsTrigger value="light" className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </TabsTrigger>
                <TabsTrigger value="dark" className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>System</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Security - Change Password */}
      <ChangePasswordSection />
    </div>
  );
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const setPasswordMutation = useSetPassword();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: Record<string, string[]> } };
        const data = axiosError.response.data;
        
        // Handle field-specific errors
        if (data.current_password) {
          toast.error(`Current Password: ${data.current_password[0]}`);
        } else if (data.new_password) {
          toast.error(`New Password: ${data.new_password[0]}`);
        } else if (data.non_field_errors) {
          toast.error(data.non_field_errors[0]);
        } else {
          toast.error("Failed to change password. Please check your credentials.");
        }
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to change password");
      }
    }
  };

  return (
    <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.25s' }}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={setPasswordMutation.isPending}
            className="w-full sm:w-auto"
          >
            {setPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
