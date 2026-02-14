'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Microscope } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  image_url?: string;
  created_at: string;
}

interface ProjectsListProps {
  projects: Project[];
  isLoading?: boolean;
}

export function ProjectsList({ projects, isLoading = false }: ProjectsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6 h-32 bg-slate-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="border-dashed bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <Microscope className="h-12 w-12 text-slate-400" />
          <p className="text-slate-500 font-medium">No projects yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 mb-2 break-words">
                  {project.name}
                </h3>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
                <Calendar className="h-4 w-4" />
                {formatDate(project.created_at)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {project.image_url && (
              <div className="rounded-md overflow-hidden border border-slate-200">
                <img
                  src={project.image_url}
                  alt={project.name}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <p className="text-slate-700 leading-relaxed text-sm">
              {project.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
