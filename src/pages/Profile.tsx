import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockMemberProgress, mockAttendance, mockAchievements } from '@/data/mockData';
import { User, Mail, Building2, Shield, Trophy, Calendar, Target, Camera, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import { useUpdateProfile } from '@/features/auth/hooks';
import { toast } from 'sonner';
import { useRef } from 'react';

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const progress = mockMemberProgress;
  const attendancePercentage = progress.attendancePercentage;
  const completionPercentage = Math.round((progress.completedWeeks / progress.totalWeeks) * 100);
  const fullName = `${user.first_name} ${user.last_name}`;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large. Please choose an image smaller than 2MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('img', file);
      
      await updateProfile.mutateAsync(formData);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      
      // Attempt to extract specific error messages from the backend
      const errorData = error.response?.data;
      let errorMessage = 'Failed to update profile picture';
      
      if (errorData && typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      // Clear the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <Avatar className="w-24 h-24 mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-transform group-hover:scale-105">
                  {user.img && <AvatarImage src={user.img} alt={fullName} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                    {user.first_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                  {updateProfile.isPending ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role}
                </Badge>
                <Badge variant="outline">
                  <Building2 className="w-3 h-3 mr-1" />
                  {user.committee || 'N/A'}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{progress.completedWeeks}</div>
                <div className="text-xs text-muted-foreground">Weeks Completed</div>
              </div>
              {/* <div className="text-center">
                <div className="text-2xl font-bold text-primary">{progress.projectsSubmitted}</div>
                <div className="text-xs text-muted-foreground">Projects Submitted</div>
              </div> */}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{attendancePercentage}%</div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{mockAchievements.length}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user.first_name} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user.last_name} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="committee">Committee ID</Label>
                  <Input id="committee" value={user.committee || 'N/A'} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user.role} readOnly className="bg-muted/50 capitalize" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Content Completion</span>
                  <span className="font-medium text-foreground">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-medium text-foreground">{attendancePercentage}%</span>
                </div>
                <Progress value={attendancePercentage} className="h-2" />
              </div>
              {/* <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects Submitted</span>
                  <span className="font-medium text-foreground">{progress.projectsSubmitted} / {progress.totalWeeks}</span>
                </div>
                <Progress value={(progress.projectsSubmitted / progress.totalWeeks) * 100} className="h-2" />
              </div> */}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockAchievements.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {mockAchievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No achievements earned yet. Keep going!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
