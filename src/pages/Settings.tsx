import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <SettingsIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle>Committee Settings</CardTitle>
              <CardDescription>Configure your committee's basic settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="committee-name">Committee Name</Label>
            <Input id="committee-name" defaultValue={user?.committee} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Brief description of your committee" />
          </div>
          <Button variant="default">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates for announcements
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Project Submissions</p>
              <p className="text-sm text-muted-foreground">
                Get notified when members submit projects
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of committee activity
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Access Settings */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle>Access & Privacy</CardTitle>
              <CardDescription>Manage access controls for your committee</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Public Progress Tracking</p>
              <p className="text-sm text-muted-foreground">
                Allow members to see each other's progress
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Anonymous Feedback</p>
              <p className="text-sm text-muted-foreground">
                Allow anonymous feedback on projects
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">
                Current theme: Purple (Default)
              </p>
            </div>
            <Button variant="outline" size="sm">
              Customize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
