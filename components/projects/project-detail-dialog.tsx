'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MapPin, X } from 'lucide-react';

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

const ProjectDetailMap = dynamic(
  () => import('./project-detail-map').then((mod) => mod.ProjectDetailMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-slate-100 rounded-md flex items-center justify-center">
        <p className="text-slate-500">Loading map...</p>
      </div>
    ),
  }
);

const categoryColors: Record<string, string> = {
  Water: 'bg-blue-100 text-blue-800',
  Wildlife: 'bg-green-100 text-green-800',
  Air: 'bg-sky-100 text-sky-800',
  Plants: 'bg-emerald-100 text-emerald-800',
};

interface ProjectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  project,
}: ProjectDetailDialogProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && project) {
      fetchLocations();
    }
  }, [open, project]);

  const fetchLocations = async () => {
    if (!project) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects?id=${project.id}`);
      if (!response.ok) throw new Error('Failed to fetch locations');

      const data = await response.json();
      const locs = data.locations || [];
      
      console.log('Raw locations data:', locs);
      
      // Parse PostGIS coordinates from location data
      const parsedLocations = (locs || []).map((loc: any) => {
        let latitude: number | undefined;
        let longitude: number | undefined;
        
        // Handle PostGIS point object
        if (loc.location && typeof loc.location === 'object') {
          if ('coordinates' in loc.location) {
            // GeoJSON format: [lng, lat]
            [longitude, latitude] = loc.location.coordinates;
          } else if ('lat' in loc.location && 'lng' in loc.location) {
            // Object with lat/lng properties
            latitude = loc.location.lat;
            longitude = loc.location.lng;
          }
        }
        
        const parsed = {
          id: loc.id,
          label: loc.label,
          latitude: latitude || loc.latitude,
          longitude: longitude || loc.longitude,
        };
        
        console.log('Parsed location:', parsed);
        return parsed;
      });
      
      console.log('All parsed locations:', parsedLocations);
      setLocations(parsedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sage-600" />
            {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={categoryColors[project.category]}>
                {project.category}
              </Badge>
              <span className="text-sm text-slate-500">
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>

            {project.description && (
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-slate-700">{project.description}</p>
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">Project Locations</h3>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center bg-slate-100 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
              </div>
            ) : locations.length > 0 ? (
              <ProjectDetailMap locations={locations} />
            ) : (
              <div className="h-96 flex items-center justify-center bg-slate-100 rounded-md border border-slate-200">
                <p className="text-slate-500">No locations added to this project</p>
              </div>
            )}
          </div>

          {/* Locations List */}
          {locations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Location Details</h4>
              <div className="space-y-2">
                {locations.map((location) => (
                  <Card key={location.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-sage-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{location.label}</p>
                        <p className="text-xs text-slate-500">
                          {location.latitude?.toFixed(6)},{' '}
                          {location.longitude?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
