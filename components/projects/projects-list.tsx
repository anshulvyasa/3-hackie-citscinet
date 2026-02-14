'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectDetailDialog } from './project-detail-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, MapPin } from 'lucide-react';

interface Location {
  id: string;
  label: string;
  latitude?: number;
  longitude?: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  category: 'Water' | 'Wildlife' | 'Air' | 'Plants';
  created_at: string;
}

const categoryColors: Record<string, string> = {
  Water: 'bg-blue-100 text-blue-800',
  Wildlife: 'bg-green-100 text-green-800',
  Air: 'bg-sky-100 text-sky-800',
  Plants: 'bg-emerald-100 text-emerald-800',
};

interface ProjectsListProps {
  refreshTrigger?: number;
}

export function ProjectsList({ refreshTrigger }: ProjectsListProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Record<string, Location[]>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async (projectId: string) => {
    if (locations[projectId]) {
      setExpandedId(expandedId === projectId ? null : projectId);
      return;
    }

    try {
      const response = await fetch(`/api/projects?id=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch locations');

      const { locations: locs } = await response.json();
      setLocations((prev) => ({
        ...prev,
        [projectId]: locs || [],
      }));
      setExpandedId(projectId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch locations',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setDeletingId(projectId);
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast({
        title: 'Success!',
        description: 'Project deleted successfully',
      });

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <p className="text-slate-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-slate-500 font-medium">No projects yet</p>
          <p className="text-sm text-slate-400">
            Create your first project to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleProjectClick(project)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={`mt-2 ${categoryColors[project.category]}`}>
                  {project.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                disabled={deletingId === project.id}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                {deletingId === project.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {project.description && (
              <p className="text-sm text-slate-700">{project.description}</p>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fetchLocations(project.id);
              }}
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {expandedId === project.id ? 'Hide' : 'View'} Locations
            </Button>

            {expandedId === project.id && (
              <div className="mt-4 pt-4 border-t space-y-2">
                {locations[project.id]?.length ? (
                  <div className="space-y-2">
                    {locations[project.id].map((loc) => (
                      <Card key={loc.id} className="bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-sage-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{loc.label}</p>
                            <p className="text-xs text-slate-500">
                              {loc.latitude?.toFixed(4)},
                              {loc.longitude?.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No locations added
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {selectedProject && (
        <ProjectDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          project={selectedProject}
        />
      )}
    </div>
  );
}
