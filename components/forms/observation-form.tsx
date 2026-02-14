'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Upload, Loader2, Save } from 'lucide-react';
import { saveDraft } from '@/lib/offline-storage';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { ImageUpload } from './image-upload';

const LocationPicker = dynamic(() => import('./location-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-muted flex items-center justify-center rounded-md">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface FormData {
  sighting_name: string;
  category: 'Water' | 'Wildlife' | 'Air' | 'Plants' | '';
  latitude: number | null;
  longitude: number | null;
  description: string;
  image_url: string;
}

interface ObservationFormProps {
  onSubmit: (data: Omit<FormData, 'category'> & { category: string }) => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
}

export function ObservationForm({
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
}: ObservationFormProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    sighting_name: '',
    category: '',
    latitude: null,
    longitude: null,
    description: '',
    image_url: '',
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: 'Getting location...',
        description: 'Please allow location access in your browser.',
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFormData('latitude', position.coords.latitude);
          updateFormData('longitude', position.coords.longitude);
          toast({
            title: 'Location captured!',
            description: `Lat: ${position.coords.latitude.toFixed(
              4
            )}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
        },
        (error) => {
          toast({
            title: 'Location error',
            description:
              'Unable to get your location. Please select manually on the map.',
            variant: 'destructive',
          });
        }
      );
    } else {
      toast({
        title: 'Not supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = () => {
    if (!formData.sighting_name || !formData.category) {
      toast({
        title: 'Cannot save draft',
        description: 'Please provide at least a name and category.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      toast({
        title: 'Cannot save draft',
        description: 'Please select a location.',
        variant: 'destructive',
      });
      return;
    }

    const draft = saveDraft({
      sighting_name: formData.sighting_name,
      category: formData.category as 'Water' | 'Wildlife' | 'Air' | 'Plants',
      latitude: formData.latitude,
      longitude: formData.longitude,
      description: formData.description,
      image_url: formData.image_url,
    });

    toast({
      title: 'Draft saved!',
      description: 'Your observation has been saved locally.',
    });

    if (onSaveDraft) {
      onSaveDraft();
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.sighting_name || !formData.category) {
          toast({
            title: 'Missing information',
            description: 'Please provide a name and category.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 2:
        if (formData.latitude === null || formData.longitude === null) {
          toast({
            title: 'Location required',
            description: 'Please select a location on the map.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.image_url) {
          toast({
            title: 'Image required',
            description: 'Please upload an image of your observation before submitting.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    if (formData.category === '') {
      toast({
        title: 'Invalid data',
        description: 'Please select a category.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      sighting_name: formData.sighting_name,
      category: formData.category,
      latitude: formData.latitude!,
      longitude: formData.longitude!,
      description: formData.description,
      image_url: formData.image_url,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sighting_name">Sighting Name *</Label>
              <Input
                id="sighting_name"
                placeholder="e.g., Blue Jay at park"
                value={formData.sighting_name}
                onChange={(e) =>
                  updateFormData('sighting_name', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Water">Water</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Plants">Plants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you observed..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              onClick={handleGetLocation}
              className="w-full"
              variant="outline"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Capture Current GPS Location
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="0.0000"
                  value={formData.latitude ?? ''}
                  onChange={(e) =>
                    updateFormData(
                      'latitude',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="0.0000"
                  value={formData.longitude ?? ''}
                  onChange={(e) =>
                    updateFormData(
                      'longitude',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Location on Map</Label>
              <LocationPicker
                position={
                  formData.latitude && formData.longitude
                    ? [formData.latitude, formData.longitude]
                    : null
                }
                onLocationSelect={(lat, lng) => {
                  updateFormData('latitude', lat);
                  updateFormData('longitude', lng);
                }}
              />
            </div>

            <div className="flex gap-2 justify-between">
              <Button type="button" onClick={() => setStep(1)} variant="outline">
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
              <CardTitle>Image Upload (Required)</CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              currentImage={formData.image_url}
              onImageUrlChange={(url) => updateFormData('image_url', url)}
            />

            <div className="flex gap-2 justify-between">
              <Button type="button" onClick={() => setStep(2)} variant="outline">
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  variant="outline"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Observation'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full ${
              s === step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </form>
  );
}
