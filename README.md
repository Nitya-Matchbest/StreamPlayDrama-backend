# Drama Platform Backend

Backend server for Drama Platform Blog system using Node.js, Express, and MongoDB.

## Features
- RESTful API for blog management
- MongoDB integration (same database as StreamPlay)
- Image upload with GridFS
- Blog CRUD operations
- Category filtering
- Search functionality

## Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env` file

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Blogs
- `GET /api/blogs` - Get all blogs (with pagination)
- `GET /api/blogs/:id` - Get blog by ID
- `GET /api/blogs/slug/:slug` - Get blog by slug
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### Upload
- `POST /api/upload` - Upload image
- `GET /api/image/:filename` - Get uploaded image

## Database
- Host: 43.205.217.221:27030
- Database: streamplay
- Collection: dramablogs

## Port
Default: 5001
