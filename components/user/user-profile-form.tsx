'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  password?: string;
  email?: string | null;
  type: 'normal' | 'scientist';
  created_at?: string;
}

interface UserProfileFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile> & { password?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function UserProfileForm({
  profile,
  onSave,
  isLoading = false,
}: UserProfileFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: profile.username,
    email: profile.email || '',
    password: '',
    confirmPassword: '',
    type: profile.type,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as 'normal' | 'scientist',
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username is required.',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password && formData.password.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        username: formData.username,
        email: formData.email,
        type: formData.type,
        ...(formData.password && { password: formData.password }),
      };

      await onSave(dataToSave);

      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });

      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isSaving}
            placeholder="Enter your username"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSaving}
            placeholder="Enter your email address"
          />
        </div>

        {/* User Type */}
        <div className="space-y-2">
          <Label htmlFor="type">User Type</Label>
          <Select
            value={formData.type}
            onValueChange={handleUserTypeChange}
            disabled={isSaving}
          >
            <SelectTrigger id="type" disabled={isSaving}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (Citizen Scientist)</SelectItem>
              <SelectItem value="scientist">Professional Researcher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Password Section */}
        <>
          <hr className="my-6" />
            <div className="space-y-4 bg-slate-50 p-4 rounded-md">
              <p className="text-sm font-medium text-slate-700">
                Change Password (leave blank to keep current password)
              </p>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
        </>

        {/* Action Buttons */}
        {
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  username: profile.username,
                  email: profile.email || '',
                  password: '',
                  confirmPassword: '',
                  type: profile.type,
                });
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        }
      </CardContent>
    </Card>
  );
}
