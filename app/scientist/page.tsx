'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScientistProfile } from '@/components/scientist/scientist-profile';
import { ProjectsList } from '@/components/scientist/projects-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface Scientist {
  id: string;
  name: string;
  role: string;
  description?: string;
  avatar_url?: string;
  email?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  image_url?: string;
  created_at: string;
}

export default function ScientistPage() {
  const searchParams = useSearchParams();
  const scientistId = searchParams.get('id');

  const [scientist, setScientist] = useState<Scientist | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScientistData = async () => {
      if (!scientistId) {
        setError('Scientist ID is required');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch scientist profile
        const { data: scientistData, error: scientistError } = await supabase
          .from('scientists')
          .select('*')
          .eq('id', scientistId)
          .single();

        if (scientistError) throw scientistError;

        setScientist(scientistData);

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('scientist_id', scientistId)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        setProjects(projectsData || []);
      } catch (err) {
        console.error('Error fetching scientist data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load scientist profile'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchScientistData();
  }, [scientistId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <p className="text-slate-600 font-medium">Loading scientist profile...</p>
        </div>
      </div>
    );
  }

  if (error || !scientist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/scientists">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scientists
            </Button>
          </Link>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">
                {error || 'Scientist profile not found'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/scientists">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scientists
          </Button>
        </Link>

        {/* Scientist Profile */}
        <ScientistProfile
          name={scientist.name}
          role={scientist.role}
          description={scientist.description}
          avatar_url={scientist.avatar_url}
          email={scientist.email}
        />

        {/* Projects Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Projects</h2>
            <p className="text-slate-600">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} by{' '}
              {scientist.name}
            </p>
          </div>
          <ProjectsList projects={projects} />
        </div>
      </div>
    </div>
  );
}
