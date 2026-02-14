'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ScientistProfileProps {
  name: string;
  role: string;
  description?: string;
  avatar_url?: string;
  email?: string;
}

export function ScientistProfile({
  name,
  role,
  description,
  avatar_url,
  email,
}: ScientistProfileProps) {
  // Get initials for avatar fallback
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-sage-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            {avatar_url && <AvatarImage src={avatar_url} alt={name} />}
            <AvatarFallback className="bg-sage-200 text-sage-900 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{name}</h1>
            <Badge variant="secondary" className="bg-sage-200 text-sage-900 mb-3">
              {role}
            </Badge>
            {email && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Email:</span> {email}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {description && (
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
