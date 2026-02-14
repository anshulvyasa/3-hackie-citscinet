'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ObservationList } from '@/components/observations/observation-list';
import type { Observation } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Leaf, Archive, User, FolderOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDrafts, deleteDraft } from '@/lib/offline-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const ObservationMap = dynamic(
  () => import('@/components/map/observation-map').then((mod) => mod.ObservationMap),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center bg-muted"><p className="text-muted-foreground">Loading map...</p></div> }
);

const ObservationForm = dynamic(
  () => import('@/components/forms/observation-form').then((mod) => mod.ObservationForm),
  { ssr: false }
);

async function fetchObservations(category?: string): Promise<Observation[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') {
    params.append('category', category);
  }

  const response = await fetch(`/api/observations?${params}`);
  if (!response.ok) throw new Error('Failed to fetch observations');
  return response.json();
}

async function createObservation(
  data: Omit<Observation, 'id' | 'created_at' | 'updated_at' | 'location'>
): Promise<Observation> {
  const response = await fetch('/api/observations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create observation');
  return response.json();
}

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);


  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setDrafts(getDrafts());
  }, [isDraftsOpen, isFormOpen]);

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['observations', categoryFilter],
    queryFn: () => fetchObservations(categoryFilter),
  });

  const createMutation = useMutation({
    mutationFn: createObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      setIsFormOpen(false);
      toast({
        title: 'Success!',
        description: 'Your observation has been logged.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create observation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const handleLoadDraft = (draft: any) => {
    deleteDraft(draft.id);
    setDrafts(getDrafts());
    setIsDraftsOpen(false);
    setIsFormOpen(true);
    toast({
      title: 'Draft loaded',
      description: 'You can now complete and submit your observation.',
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CitSciNet</h1>
                <p className="text-sm text-muted-foreground">
                  Citizen Science Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}  >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Water">Water</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Plants">Plants</SelectItem>
                </SelectContent>
              </Select>
              {drafts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setIsDraftsOpen(true)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Drafts ({drafts.length})
                </Button>
              )}
              <Link href="/profile">
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Projects
                </Button>
              </Link>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Sighting
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r overflow-y-auto bg-background">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              Recent Observations
              {observations.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({observations.length})
                </span>
              )}
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading observations...</p>
              </div>
            ) : (
              <ObservationList
                observations={observations}
                onObservationClick={(obs) => {
                  setSelectedObservation(obs);
                  toast({
                    title: obs.sighting_name,
                    description: `${obs.category} observation at ${obs.latitude.toFixed(
                      4
                    )}, ${obs.longitude.toFixed(4)}`,
                  });
                }}
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          ) : (
            <ObservationMap
              observations={observations}
              className="h-full w-full"
              selectedObservation={selectedObservation}
            />
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log a New Sighting</DialogTitle>
          </DialogHeader>
          <ObservationForm
            onSubmit={handleSubmit}
            onSaveDraft={() => setIsFormOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDraftsOpen} onOpenChange={setIsDraftsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <Card key={draft.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{draft.sighting_name}</CardTitle>
                    <Badge>{draft.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {draft.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Saved {new Date(draft.timestamp).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          deleteDraft(draft.id);
                          setDrafts(getDrafts());
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLoadDraft(draft)}
                      >
                        Load & Submit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
