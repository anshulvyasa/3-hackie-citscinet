# Scientist Dashboard Setup Guide

This guide will help you set up the scientist dashboard feature in your CitSciNet application.

## Features

✅ **Scientist Profiles** - Display scientist name, role, description, and avatar
✅ **Project Listings** - Show all projects by a scientist with descriptions
✅ **Scientists Directory** - Browse all scientists in the system
✅ **Project Management** - Track project status (active, completed, archived)

## Database Setup

### 1. Run the Migration

The following SQL tables have been created via the migration file:
- `scientists` - Scientist profile information
- `projects` - Projects associated with scientists

**File**: `supabase/migrations/20260214_create_scientists_projects.sql`

To apply this migration:
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of the migration file
5. Execute the query

### 2. Table Structure

#### Scientists Table
```sql
- id (UUID, primary key)
- name (text, required) - Full name of the scientist
- role (text, required) - Job title/role (e.g., "Lead Researcher")
- description (text, optional) - Bio or about section
- avatar_url (text, optional) - Profile picture URL
- email (text, required) - Contact email
- user_id (UUID, optional) - Link to authentication user
- created_at (timestamptz) - Auto-generated
- updated_at (timestamptz) - Auto-generated
```

#### Projects Table
```sql
- id (UUID, primary key)
- name (text, required) - Project name
- description (text, required) - Project details
- scientist_id (UUID, required) - Link to scientist
- status (text, default: 'active') - One of: active, completed, archived
- image_url (text, optional) - Project cover image
- created_at (timestamptz) - Auto-generated
- updated_at (timestamptz) - Auto-generated
```

## File Structure

### New Components
- `components/scientist/scientist-profile.tsx` - Displays scientist profile card
- `components/scientist/projects-list.tsx` - Lists all projects by a scientist

### New Pages
- `app/scientists/page.tsx` - Browse all scientists directory
- `app/scientist/page.tsx` - Individual scientist profile with projects

## Usage

### View All Scientists
Navigate to `/scientists` to see a grid of all scientists with:
- Avatar/profile picture
- Name and role
- Brief description
- Project count
- Link to full profile

### View Scientist Profile
Click "View Profile" on any scientist card or navigate to:
```
/scientist?id={scientist_id}
```

This displays:
- Full scientist profile (name, role, description, email)
- All projects by that scientist
- Project details (name, description, image, status, date)

## Adding Scientists and Projects

### Using Supabase Dashboard

#### Add a Scientist
1. Go to Supabase Dashboard → **Table Editor**
2. Select `scientists` table
3. Click **Insert row**
4. Fill in:
   - **name**: "Dr. Jane Smith"
   - **role**: "Lead Researcher"
   - **description**: "Expertise in wetland ecology..."
   - **avatar_url**: "https://cloudinary.com/..." (optional)
   - **email**: "jane@example.com"

#### Add a Project
1. Select `projects` table
2. Click **Insert row**
3. Fill in:
   - **name**: "Amazon Rainforest Survey"
   - **description**: "Comprehensive study of biodiversity..."
   - **scientist_id**: Select a scientist
   - **status**: Choose active/completed/archived
   - **image_url**: "https://cloudinary.com/..." (optional)

### Using API (For Frontend Integration)

```typescript
import { supabase } from '@/lib/supabase/client';

// Add scientist
const { data, error } = await supabase
  .from('scientists')
  .insert({
    name: 'Dr. Jane Smith',
    role: 'Lead Researcher',
    description: 'Wetland ecology specialist',
    email: 'jane@example.com',
    user_id: userId // if authenticated
  })
  .select()
  .single();

// Add project
const { data: project, error } = await supabase
  .from('projects')
  .insert({
    name: 'Amazon Survey',
    description: 'Biodiversity study...',
    scientist_id: scientistId,
    status: 'active',
    image_url: 'https://...'
  })
  .select()
  .single();
```

## Styling

The dashboard uses:
- **Colors**: Sage greens, slate grays matching the theme
- **Components**: Shadcn/UI components (Avatar, Badge, Card, Button)
- **Layout**: Responsive grid for scientists directory
- **Icons**: Lucide React icons

## Security

Row Level Security (RLS) is enabled:
- ✅ Public read access - anyone can view scientists and projects
- ✅ Authenticated users can create/manage their own profiles
- ✅ Users can only update their own scientist profiles
- ✅ Users can only manage projects linked to their scientist profile

## Customization

### Change Colors
Edit the color classes in components:
- `scientist-profile.tsx` - Lines with `bg-sage-*`, `text-sage-*`
- `projects-list.tsx` - Status badge colors

### Change Page Layout
- Edit `app/scientists/page.tsx` to adjust grid columns
- Modify `app/scientist/page.tsx` for single profile layout

### Add More Fields
1. Create a new Supabase migration to add columns
2. Update the component interfaces (TypeScript types)
3. Update the component JSX to display new fields

## Troubleshooting

### Scientists/Projects not showing
- Verify tables exist in Supabase
- Check RLS policies are correctly set
- Ensure migration was applied successfully
- Check browser console for error messages

### Images not loading
- Verify image URLs are accessible
- Use Cloudinary URLs or similar CDN
- Check CORS settings if using external images

### Profile pages show 404
- Ensure scientist ID in URL matches database
- Check RLS policies allow public read access

## Future Enhancements

Consider adding:
- Edit/create scientist profile forms
- Manage projects interface
- Search and filter scientists
- Scientist achievements/awards
- Publication links
- Collaboration features
- Comments/reviews on projects
