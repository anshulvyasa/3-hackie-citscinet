'use client';

import type { Observation } from '@/lib/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Calendar } from 'lucide-react';

const categoryColors = {
  Water: 'bg-blue-500',
  Wildlife: 'bg-amber-500',
  Air: 'bg-violet-500',
  Plants: 'bg-emerald-500',
};

interface ObservationListProps {
  observations: Observation[];
  onObservationClick?: (observation: Observation) => void;
}

export function ObservationList({
  observations,
  onObservationClick,
}: ObservationListProps) {
  if (observations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No observations yet. Be the first to log a sighting!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {observations.map((observation) => (
        <Card
          key={observation.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onObservationClick?.(observation)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {observation.image_url && (
                <div className="flex-shrink-0">
                  <img
                    src={observation.image_url}
                    alt={observation.sighting_name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg truncate">
                    {observation.sighting_name}
                  </h3>
                  <Badge
                    className={`${
                      categoryColors[observation.category]
                    } text-white flex-shrink-0`}
                  >
                    {observation.category}
                  </Badge>
                </div>
                {observation.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {observation.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {observation.latitude.toFixed(4)},{' '}
                      {observation.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(observation.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
