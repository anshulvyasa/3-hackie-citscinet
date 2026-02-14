'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfileForm } from '@/components/user/user-profile-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  password: string;
  email?: string | null;
  type: 'normal' | 'scientist';
  created_at?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Use a demo user ID for now (remove auth requirement)
        const demoUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);

        // Check if profile exists, if not create a demo one
        const { data, error: profileError } = (await supabase
          .from('users')
          .select('*')
          .eq('id', demoUserId)
          .single()) as any;

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, create demo profile
            const { data: newProfile, error: insertError } = (await supabase
              .from('users')
              .insert({
                id: demoUserId,
                username: 'demouser',
                email: 'demo@example.com',
                password: 'hashedpassword',
                type: 'normal',
              } as any)
              .select()
              .single()) as any;

            if (insertError) throw insertError;
            setProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Set a default profile for demo
        setProfile({
          id: 'demo-user',
          username: 'demouser',
          email: 'demo@example.com',
          password: 'hashedpassword',
          type: 'normal',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (
    data: Partial<UserProfile> & { password?: string }
  ) => {
    if (!profile) return;

    try {
      const updateData: any = {
        username: data.username,
        email: data.email,
        type: data.type,
      };

      if (data.password) {
        updateData.password = data.password;
      }

      const { error: updateError } = (await ((supabase.from('users') as any)
        .update(updateData)
        .eq('id', profile.id))) as any;

      if (updateError) throw updateError;

      // Update local state
      setProfile({
        ...profile,
        ...data,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    // For demo, just redirect to dashboard
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error || 'Profile not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Form */}
        <UserProfileForm
          profile={profile}
          onSave={handleSaveProfile}
          isLoading={isLoading}
        />

        {/* User Type Info */}
        <Card className="mt-6 bg-sage-50 border-sage-200">
          <CardHeader>
            <CardTitle>User Type Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Citizen Scientist
              </h4>
              <p className="text-sm text-slate-700">
                Non-professional individuals who participate in scientific
                research. You can log observations and contribute to citizen
                science projects.
              </p>
            </div>
            <hr />
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Professional Researcher
              </h4>
              <p className="text-sm text-slate-700">
                Researchers, scientists, and professionals conducting formal
                research. You have additional features for managing research
                projects and analyzing observations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
