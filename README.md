# HCA Frontend

Frontend for the most amazing HCA Project to date.

## Tech Stack

- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with Radix UI components
- **Package Manager**: Bun (recommended) / npm
- **API Client**: OpenAPI generated client
- **Deployment**: Docker with nginx

## Prerequisites

- **Node.js** 18+ 
- **Bun** (recommended) or npm
- **Chrome** browser (recommended)
- **Docker** (for deployment)

### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Getting Started

### 1. Install Dependencies

**Using Bun (recommended):**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

### 2. Start Development Server

**Using Bun:**
```bash
bun dev
```

**Using npm:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Docker Deployment

### Building for Production

**Build Docker image:**
```bash
docker build -t hca-frontend .
```

**Run container:**
```bash
docker run -p 3000:80 hca-frontend
```

The production application will be available at `http://localhost:3000`

### Docker Configuration

The application uses a multi-stage Docker build:
1. **Build stage**: Uses Bun to install dependencies and build the application
2. **Production stage**: Uses nginx to serve static files with SPA routing support

### Files Required for Docker

- `Dockerfile` - Multi-stage build configuration
- `nginx.conf` - Custom nginx configuration for SPA routing
- `.dockerignore` - Excludes unnecessary files from Docker context

### Production Considerations

- The nginx configuration includes gzip compression and security headers
- Static assets are cached for optimal performance
- SPA routing is handled by serving `index.html` for all routes
- Container runs on port 80 internally, mapped to your chosen external port

## API Integration

This project uses an OpenAPI generated client to communicate with the backend server.

### Prerequisites
- Backend server running on `http://localhost:8080`

### Generating API Client

When the backend is running, generate the API client:

```bash
# Generate the OpenAPI specification
bash gen_yaml.bash

# Generate the TypeScript client
bun x openapi --input api-spec.yaml --output ./src/lib/api
```

**With npm:**
```bash
# Generate the OpenAPI specification
bash gen_yaml.bash

# Generate the TypeScript client  
npx openapi --input api-spec.yaml --output ./src/lib/api
```

The generated client will be available in `./src/lib/api` and can be imported throughout the application.

## Development

### Available Scripts

**Using Bun:**
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build locally

**Using npm:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Development Setup

1. Ensure backend is running on port 8080
2. Frontend runs on port 3000
3. Use Chrome browser for optimal experience
4. Regenerate API client when backend schema changes

## Project Structure

```
src/
├── lib/
│   └── api/          # Generated OpenAPI client
├── components/       # React components (subdirectory /ui contains radix ui components)
├── pages/           # Application pages
└── styles/          # TailwindCSS styles
```

## UI Components

This project primarily uses Radix UI components styled with TailwindCSS. When building new components, prefer Radix UI primitives over custom Tailwind implementations for accessibility and consistency.

## Browser Support

Chrome is the recommended browser for development and optimal user experience.