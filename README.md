# CitSciNet - Citizen Science Platform

A comprehensive web application for citizen scientists to log environmental observations and visualize them on an interactive map.

## Features

### Core Functionality
- **Interactive Dashboard**: Split-screen view with observation list and full-screen Leaflet map
- **Observation Logging**: Multi-step form to log sightings with:
  - Sighting name and category (Water, Wildlife, Air, Plants)
  - GPS location capture or manual map selection
  - Optional image upload (URL-based, ready for Cloudinary/S3 integration)
  - Description field
- **Real-time Map**: Leaflet map with marker clustering showing all observations
- **Offline Support**: Draft saving to LocalStorage for offline capability
- **Category Filtering**: Filter observations by environmental category

### Technical Features
- **PostGIS Integration**: Geographic data stored as PostGIS geography points
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Nature-Inspired Theme**: Sage greens, slate grays, and whites color palette
- **Type-Safe**: Full TypeScript support with Supabase types
- **Optimized Performance**: React Query for caching and efficient data fetching

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Maps**: Leaflet.js with react-leaflet and marker clustering
- **Database**: Supabase with PostGIS extension
- **State Management**: TanStack Query (React Query)
- **Form Handling**: Multi-step wizard with validation

## Database Schema

The `observations` table includes:
- `id` (UUID): Primary key
- `sighting_name` (text): Name of the observation
- `category` (text): One of: Water, Wildlife, Air, Plants
- `location` (geography): PostGIS point (WGS84)
- `latitude` / `longitude` (numeric): Coordinates for easy querying
- `description` (text): Optional description
- `image_url` (text): Optional image URL
- `user_id` (UUID): User who created the observation
- `created_at` / `updated_at` (timestamptz): Timestamps

Row Level Security (RLS) is enabled with policies for:
- Public read access
- Authenticated user creation
- User-specific update/delete

## API Routes

### GET /api/observations
Fetch observations with optional filtering:
- Query param `category`: Filter by category (Water, Wildlife, Air, Plants)
- Query param `bounds`: Filter by bounding box (minLat,minLng,maxLat,maxLng)

### POST /api/observations
Create a new observation:
```json
{
  "sighting_name": "Blue Jay at park",
  "category": "Wildlife",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "description": "Spotted a blue jay...",
  "image_url": "https://...",
  "user_id": "..."
}
```

## Key Components

### Dashboard (`/dashboard`)
Main application view with:
- Left panel: Scrollable list of recent observations
- Right panel: Interactive map with clustered markers
- Top bar: Category filter and "Log Sighting" button

### Observation Form
Multi-step wizard:
1. **Step 1**: Basic information (name, category, description)
2. **Step 2**: Location selection (GPS capture or map picker)
3. **Step 3**: Image upload and final submission

### Offline Drafts
LocalStorage-based draft system:
- Automatically saves work if connection is lost
- View and manage saved drafts
- Load drafts to complete and submit

## Getting Started

The application is ready to run. The database is already configured with:
- PostGIS extension enabled
- Observations table created
- RLS policies configured
- Spatial indexes for performance

Simply navigate to the dashboard to start logging observations!

## Color Scheme

The nature-inspired design uses:
- **Primary**: Sage green (#5e8a74 - HSL 145 30% 45%)
- **Background**: Off-white (#f5f7f5 - HSL 140 20% 97%)
- **Accents**: Slate gray and natural tones
- **Category Colors**:
  - Water: Blue (#3b82f6)
  - Wildlife: Amber (#f59e0b)
  - Air: Violet (#8b5cf6)
  - Plants: Emerald (#10b981)

## Future Enhancements

Ready for:
- Authentication system integration
- Image upload to cloud storage (Cloudinary/S3)
- Advanced filtering and search
- Data export and analytics
- Mobile app development
- Community features and social sharing
