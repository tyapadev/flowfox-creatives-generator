# FlowFox Creatives Generation Service

AI-powered service for generating marketing headlines and images with manual pairing capabilities.

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Prisma** with PostgreSQL (Supabase)
- **OpenAI API** for headline and image generation
- **React Hook Form** + **Zod** for form validation

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for PostgreSQL)
- OpenAI API key

### Step 1: Clone and Install Dependencies

```bash
npm install
```

### Step 2: Configure Supabase Database

1. Create a project in [Supabase](https://supabase.com) or use existing one
2. Get DATABASE_URL (connection string):
   - Go to Supabase Dashboard → Settings → Database
   - Find "Connection string" section
   - Select "URI" and copy the connection string
   - Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - Or for direct connection: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

3. Create `.env` file in project root based on `.env.example`:


### Step 3: Initialize Database

**Option 1: Via Supabase SQL Editor (recommended)**

If `prisma db push` doesn't work due to connection pooling, execute SQL manually:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `prisma/init.sql` file
3. Execute SQL query
4. Then generate Prisma Client:

```bash
npm run db:generate
```

**Option 2: Via Prisma CLI**

If you have direct connection string (not through pooler):

```bash
# Generate Prisma Client
npm run db:generate

# Apply migrations to database
npm run db:push
```

**Note:** If using connection pooling (port 6543), you need direct connection string (port 5432) for Prisma migrations. Find it in Supabase Dashboard → Settings → Database → Connection string → Direct connection.

### Step 4: Run the Project

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Project will be available at `http://localhost:3000`

## Features

### 1. Campaign Brief Form
- Create campaign with fields: name, industry, target audience, tone, description
- Client-side validation with React Hook Form + Zod
- Error handling and loading states

### 2. AI Headlines Generator
- Generate German headlines using OpenAI GPT-4
- 8-15 words per headline
- Considers campaign context (industry, audience, tone)
- Generate 3-5 headlines at once

### 3. AI Image Generator
- Generate images using OpenAI DALL-E 3
- 16:9 aspect ratio
- Professional, brand-safe images
- Generate 1-5 images at once

### 4. Pairing Interface
- Display all generated headlines and images
- Visual indication of already paired elements
- Intuitive interface for selection and pairing
- Side-by-side layout for convenience

### 5. Creatives Gallery
- Grid with adaptive layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Display paired headlines and images
- Ability to delete pairs (unpairing)
- Empty state with helpful hints

## Project Structure

```
creative/
├── app/
│   ├── api/
│   │   ├── campaigns/route.ts
│   │   ├── ai/
│   │   │   ├── headlines/generate/route.ts
│   │   │   └── images/generate/route.ts
│   │   └── creatives/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CampaignForm.tsx
│   ├── HeadlineGenerator.tsx
│   ├── ImageGenerator.tsx
│   ├── PairingInterface.tsx
│   └── CreativesGallery.tsx
├── lib/
│   ├── prisma.ts
│   └── openai.ts
├── prisma/
│   └── schema.prisma
└── types/
    └── index.ts
```

## API Endpoints

### POST /api/campaigns
Create new campaign

### GET /api/campaigns
Get all campaigns

### POST /api/ai/headlines/generate
Generate headlines for campaign

### GET /api/ai/headlines/generate?campaignId=...
Get campaign headlines

### POST /api/ai/images/generate
Generate images for campaign

### GET /api/ai/images/generate?campaignId=...
Get campaign images

### POST /api/creatives
Create pair (headline + image)

### GET /api/creatives?campaignId=...
Get all campaign pairs

### DELETE /api/creatives/[id]
Delete pair (unpairing)

## Database Schema

### Campaign
- id, name, industry, audience, tone, description
- timestamps (createdAt, updatedAt)

### Headline
- id, text, campaignId, status
- timestamps

### Image
- id, imageUrl, prompt, campaignId, status
- timestamps

### Creative
- id, campaignId, headlineId, imageId, status, metadata
- timestamps
- Unique constraint on (headlineId, imageId, campaignId)

## Deployment to Vercel

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Automatic deployments on push to main branch
4. Prisma migrations run automatically via postinstall hook

## Technical Decisions

### TypeScript
- Strict mode enabled
- All types explicitly defined (no `any`)
- Using Zod for runtime validation

### Error Handling
- Structured API responses: `{ success: boolean, data?, error? }`
- Try/catch blocks around all AI operations
- User-friendly error messages

### UX
- Loading states for all async operations
- Disabled buttons during processing
- Visual feedback for all actions

## Known Limitations

- Images from OpenAI stored as URLs (can be improved with file storage)
- No pagination for large lists
- No caching for generated content
- No ability to edit headlines/images after generation

## Future Improvements

- Add ability to edit headlines
- Implement pagination for large lists
- Add ability to save images locally
- Add export creatives (PDF, JSON)
- Add one-click headline copying
- Add preview mode for creatives

## Development Time

- Project setup and database: ~30 minutes
- Creating API endpoints: ~1.5 hours
- Creating UI components: ~1.5 hours
- Integration and testing: ~30 minutes
- Documentation and configuration: ~30 minutes

**Total time: ~4.5 hours**

## Cursor AI Setup

### Model
Used Claude Sonnet 4.5 for main development and GPT-4 for TypeScript type assistance.

### .cursorrules
Configuration includes:
- Using TypeScript strict mode
- English language responses
- Response structure with code examples
- Support for Next.js 15 App Router patterns

### Cursor Usage
- **Chat**: for creating project structure and components
- **Inline suggestions**: for completing boilerplate code
- **Codebase search**: for navigation and understanding structure

### Code Verification
- All AI-generated parts checked manually
- TypeScript compiler check (`npx tsc --noEmit`)
- Manual end-to-end testing of all functions
- ESLint linting check

### AI-generated Code Percentage
Approximately 60% of code was generated using Cursor AI, but all critical parts (business logic, types, error handling) were verified and adapted manually.
