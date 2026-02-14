import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET - Fetch projects with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (projectId) {
      // Get single project with locations
      const { data: project, error: projectError } = (await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()) as any;

      if (projectError) throw projectError;

      const { data: locations, error: locError } = (await supabase
        .from('project_locations')
        .select('*')
        .eq('project_id', projectId)) as any;

      if (locError) throw locError;

      // Parse PostGIS location data
      const parsedLocations = (locations || []).map((loc: any) => {
        let latitude: number | undefined;
        let longitude: number | undefined;

        // Handle PostGIS point object
        if (loc.location) {
          if (typeof loc.location === 'object') {
            if ('coordinates' in loc.location) {
              // GeoJSON format: [lng, lat]
              [longitude, latitude] = loc.location.coordinates;
            } else if ('lat' in loc.location && 'lng' in loc.location) {
              latitude = loc.location.lat;
              longitude = loc.location.lng;
            }
          } else if (typeof loc.location === 'string') {
            // Parse WKT format: "POINT(lng lat)"
            const match = loc.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
            if (match) {
              longitude = parseFloat(match[1]);
              latitude = parseFloat(match[2]);
            }
          }
        }

        return {
          id: loc.id,
          label: loc.label || '',
          latitude: latitude ?? loc.latitude,
          longitude: longitude ?? loc.longitude,
          created_at: loc.created_at,
        };
      });

      return NextResponse.json({ project, locations: parsedLocations });
    } else {
      // Get all projects
      const { data: projects, error } = (await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })) as any;

      if (error) throw error;

      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project with locations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, locations } = body;

    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    if (!['Water', 'Wildlife', 'Air', 'Plants'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create project
    const { data: project, error: projectError } = (await ((supabase.from('projects') as any)
      .insert({
        name,
        description,
        category,
      } as any)
      .select()
      .single())) as any;

    if (projectError) throw projectError;

    // Add locations if provided
    if (locations && Array.isArray(locations) && locations.length > 0) {
      const locationsData = locations.map((loc: any) => ({
        project_id: project.id,
        location: `POINT(${loc.longitude} ${loc.latitude})`,
        label: loc.label || '',
      }));

      const { error: locError } = (await ((supabase.from('project_locations') as any)
        .insert(locationsData))) as any;

      if (locError) throw locError;
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, category } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { data: project, error } = (await ((supabase.from('projects') as any)
      .update({
        name,
        description,
        category,
      } as any)
      .eq('id', id)
      .select()
      .single())) as any;

    if (error) throw error;

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { error } = (await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)) as any;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}