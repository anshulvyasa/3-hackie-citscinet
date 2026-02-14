'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, MapPin, Navigation } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const LocationMap = dynamic(
  () => import('./location-map').then((mod) => mod.LocationMap),
  { ssr: false, loading: () => <div className="w-full h-64 bg-slate-100 rounded-md flex items-center justify-center"><p className="text-slate-500">Loading map...</p></div> }
);

interface Location {
  label: string;
  latitude: number;
  longitude: number;
}

interface ProjectDialogProps {
  onProjectCreated?: () => void;
}

export function ProjectDialog({ onProjectCreated }: ProjectDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Water',
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState({
    label: '',
    latitude: '',
    longitude: '',
  });

  // Reverse geocode when latitude and longitude are both provided
  useEffect(() => {
    const fetchLocationName = async () => {
      const lat = parseFloat(currentLocation.latitude);
      const lng = parseFloat(currentLocation.longitude);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return;
      }

      // Skip if label is manually set and hasn't changed
      if (currentLocation.label && !currentLocation.label.includes('(')) {
        return;
      }

      try {
        setIsGeocodingLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        
        // Extract location name from the response
        const locationName = 
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          data.address?.state ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        setCurrentLocation((prev) => ({
          ...prev,
          label: locationName,
        }));
      } catch (error) {
        console.error('Geocoding error:', error);
        // Optionally set a default label with coordinates
        if (!currentLocation.label) {
          setCurrentLocation((prev) => ({
            ...prev,
            label: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          }));
        }
      } finally {
        setIsGeocodingLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (currentLocation.latitude && currentLocation.longitude) {
        fetchLocationName();
      }
    }, 500); // Debounce geocoding request

    return () => clearTimeout(timeoutId);
  }, [currentLocation.latitude, currentLocation.longitude]);

  const getDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        toast({
          title: 'Success!',
          description: `Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCurrentLocation((prev) => ({ ...prev, [name]: value }));
  };

  const addLocation = () => {
    if (!currentLocation.label.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location label is required',
        variant: 'destructive',
      });
      return;
    }

    const lat = parseFloat(currentLocation.latitude);
    const lng = parseFloat(currentLocation.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: 'Validation Error',
        description: 'Latitude and longitude must be valid numbers',
        variant: 'destructive',
      });
      return;
    }

    if (lat < -90 || lat > 90) {
      toast({
        title: 'Validation Error',
        description: 'Latitude must be between -90 and 90',
        variant: 'destructive',
      });
      return;
    }

    if (lng < -180 || lng > 180) {
      toast({
        title: 'Validation Error',
        description: 'Longitude must be between -180 and 180',
        variant: 'destructive',
      });
      return;
    }

    setLocations((prev) => [
      ...prev,
      {
        label: currentLocation.label,
        latitude: lat,
        longitude: lng,
      },
    ]);

    setCurrentLocation({ label: '', latitude: '', longitude: '' });
  };

  const removeLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          locations,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      toast({
        title: 'Success!',
        description: 'Project created successfully',
      });

      setOpen(false);
      setFormData({ name: '', description: '', category: 'Water' });
      setLocations([]);
      setCurrentLocation({ label: '', latitude: '', longitude: '' });

      onProjectCreated?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project with locations and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter project description"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange} disabled={isLoading}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Wildlife">Wildlife</SelectItem>
                <SelectItem value="Air">Air</SelectItem>
                <SelectItem value="Plants">Plants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Locations Section */}
          <div className="space-y-4">
            <div>
              <Label>Project Locations</Label>
              <p className="text-sm text-slate-500 mt-1">
                Add geographic locations for this project
              </p>
            </div>

            {/* Location Input */}
            <Card className="bg-slate-50 border-slate-200 p-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-sm">
                    Location Label
                  </Label>
                  <Input
                    id="label"
                    name="label"
                    value={currentLocation.label}
                    onChange={handleLocationInputChange}
                    placeholder="e.g., Main Study Site"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.0001"
                      value={currentLocation.latitude}
                      onChange={handleLocationInputChange}
                      placeholder="-90 to 90"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.0001"
                      value={currentLocation.longitude}
                      onChange={handleLocationInputChange}
                      placeholder="-180 to 180"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {isGeocodingLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-2 rounded">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fetching location name...</span>
                  </div>
                )}

                <Button
                  onClick={getDeviceLocation}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Use My Location
                </Button>

                {/* Location Map Preview */}
                {currentLocation.latitude && currentLocation.longitude && (
                  <div className="space-y-2">
                    <Label className="text-sm">Location Preview</Label>
                    <LocationMap
                      latitude={parseFloat(currentLocation.latitude)}
                      longitude={parseFloat(currentLocation.longitude)}
                      label={currentLocation.label || 'New Location'}
                    />
                  </div>
                )}

                <Button
                  onClick={addLocation}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
            </Card>

            {/* Added Locations List */}
            {locations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Added Locations</Label>
                <div className="space-y-2">
                  {locations.map((loc, index) => (
                    <Card key={index} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sage-600" />
                        <div>
                          <p className="font-medium text-sm">{loc.label}</p>
                          <p className="text-xs text-slate-500">
                            {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLocation(index)}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
