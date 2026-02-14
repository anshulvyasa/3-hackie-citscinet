# Cloudinary Setup Guide

This project now includes file upload functionality with drag-and-drop support that uploads images directly to Cloudinary.

## Setup Steps

### 1. Create a Cloudinary Account
- Go to https://cloudinary.com/
- Sign up for a free account
- Navigate to your Dashboard

### 2. Get Your Credentials
- From the Dashboard, copy your **Cloud Name**
- Keep this handy for the environment variables

### 3. Create an Upload Preset
This allows unsigned uploads from the browser without exposing your API key.

1. Go to **Settings** → **Upload** (in your Cloudinary dashboard)
2. Click **Add upload preset**
3. Set the following:
   - **Name**: `citscienet` (must match the preset name in the code)
   - **Folder**: `citscienet/observations` (optional, for organization)
   - **Signing Mode**: Unsigned (allows browser uploads)
   - **Save**

### 4. Configure Environment Variables
Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
```

**Note**: Only the cloud name is needed in the client environment since we're using unsigned uploads. Never expose your API Key or API Secret in client-side code.

### 5. Update Your .env.local File
If you don't have a `.env.local` file in the root of your project, create one with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
```

### 6. Test the Upload
1. Start your development server: `npm run dev`
2. Navigate to the dashboard and create a new observation
3. In Step 3 (Image Upload), try uploading an image:
   - Drag and drop an image
   - Click "From Device" to select from your computer
4. The image should upload and display a preview
5. When you submit, the Cloudinary URL will be stored in your database

## Features

✅ **Device Upload**: Click to select images from your computer
✅ **Drag & Drop**: Drag images directly onto the upload area
✅ **Preview**: Instant preview of selected image
✅ **Replace**: Replace uploaded image with another
✅ **Validation**: File type and size checking (max 5MB)
✅ **Error Handling**: Clear error messages for upload failures

## File Changes

### New Files Created:
- `components/forms/image-upload.tsx` - Main upload component with drag-drop UI
- `lib/cloudinary.ts` - Cloudinary upload utility function

### Modified Files:
- `components/forms/observation-form.tsx` - Updated to use ImageUpload component

## Troubleshooting

### "Cloudinary cloud name is not configured"
- Make sure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in `.env.local`
- Restart your development server after adding environment variables

### "Unsigned uploads not allowed"
- Verify your upload preset is set to "Unsigned" mode in Cloudinary settings
- Check the preset name is exactly `citscienet`

### Upload fails silently
- Check the browser console for error messages
- Verify the file is an image and less than 5MB
- Ensure your Cloudinary account is active

### CORS Issues
- Cloudinary handles CORS automatically for unsigned uploads
- If issues persist, check your Cloudinary security settings

## Optional: Google Drive Integration

For future enhancement, you can add Google Drive integration:

1. In Cloudinary settings, enable "Google Drive" as a media source
2. Users can then select "From Google Drive" in the upload interface
3. This requires additional configuration but uses the same upload flow

## Optional: Server-Side Upload with API Key

For more secure uploads (useful if you need to validate or process images server-side):

1. Add to `.env` (not exposed to client):
   ```env
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. Create a server API route for secure uploads
3. Update the client to POST to your endpoint instead of Cloudinary directly

This approach is more secure but adds backend complexity.
