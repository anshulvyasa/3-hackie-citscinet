'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface Scientist {
  id: string;
  name: string;
  role: string;
  description?: string;
  avatar_url?: string;
  email?: string;
  _count?: {
    projects: number;
  };
}

export default function ScientistsPage() {
  const [scientists, setScientists] = useState<Scientist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScientists = async () => {
      try {
        const { data, error: err } = (await supabase
          .from('scientists')
          .select('*')
          .order('name', { ascending: true })) as any;

        if (err) throw err;

        // Fetch project counts for each scientist
        const scientistsWithCounts = await Promise.all(
          (data || []).map(async (scientist: any) => {
            const { count, error: countError } = (await supabase
              .from('projects')
              .select('id', { count: 'exact', head: true })
              .eq('scientist_id', scientist.id)) as any;

            return {
              ...scientist,
              _count: { projects: count || 0 },
            };
          })
        );

        setScientists(scientistsWithCounts);
      } catch (err) {
        console.error('Error fetching scientists:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load scientists'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchScientists();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <p className="text-slate-600 font-medium">Loading scientists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-sage-600" />
            <h1 className="text-4xl font-bold text-slate-900">Scientists</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Discover our team of expert citizen scientists and their projects
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {scientists.length === 0 ? (
          <Card className="border-dashed bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="h-12 w-12 text-slate-400" />
              <p className="text-slate-500 font-medium">No scientists yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scientists.map((scientist) => {
              const initials = scientist.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card
                  key={scientist.id}
                  className="hover:shadow-lg transition-shadow flex flex-col"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        {scientist.avatar_url && (
                          <AvatarImage
                            src={scientist.avatar_url}
                            alt={scientist.name}
                          />
                        )}
                        <AvatarFallback className="bg-sage-200 text-sage-900 font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 break-words">
                          {scientist.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1 bg-sage-100 text-sage-800">
                          {scientist.role}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-4">
                    {scientist.description && (
                      <p className="text-sm text-slate-700 line-clamp-3">
                        {scientist.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t">
                      <span className="font-medium">
                        {scientist._count?.projects || 0}{' '}
                        {scientist._count?.projects === 1 ? 'project' : 'projects'}
                      </span>
                      <Link href={`/scientist?id=${scientist.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sage-600 hover:text-sage-700"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
