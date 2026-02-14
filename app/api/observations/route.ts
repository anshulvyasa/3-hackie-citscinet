import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bounds = searchParams.get('bounds');
    const category = searchParams.get('category');

    let query = supabase
      .from('observations')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (bounds) {
      const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
      query = query
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching observations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch observations' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      sighting_name,
      category,
      latitude,
      longitude,
      description,
      image_url,
      user_id,
    } = body;

    if (
      !sighting_name ||
      !category ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['Water', 'Wildlife', 'Air', 'Plants'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    const location = `POINT(${longitude} ${latitude})`;

    const insertData: any = {
      sighting_name,
      category,
      location,
      latitude,
      longitude,
      description,
      image_url,
      user_id,
    };

    const { data, error } = await supabase
      .from('observations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating observation:', error);
      return NextResponse.json(
        { error: 'Failed to create observation' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
