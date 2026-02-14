'use client';

import { useState } from 'react';
import { ProjectDialog } from '@/components/projects/project-dialog';
import { ProjectsList } from '@/components/projects/projects-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

export default function ProjectsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjectCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-sage-600" />
              <h1 className="text-4xl font-bold text-slate-900">Projects</h1>
            </div>
            <ProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
          <p className="text-slate-600 text-lg">
            Manage and track your research projects with geographic locations
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 bg-sage-50 border-sage-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700">
              Create projects with multiple geographic locations to organize your
              research efforts. Track observations by category and location.
            </p>
          </CardContent>
        </Card>

        {/* Projects List */}
        <ProjectsList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
