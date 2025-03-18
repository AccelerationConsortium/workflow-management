# Unit Operations Registration System

A modern web application for managing and registering chemical unit operation equipment. This system allows users to create, view, edit, and delete unit operation records, as well as manage equipment-related technical documentation.

## Features

- Dashboard overview with key statistics
- Complete CRUD operations for unit operation equipment
- Detailed equipment information management, including technical specifications, location, and maintenance information
- Responsive design for mobile and desktop devices
- Modern Material UI interface

## Technology Stack

- **Frontend**:
  - React 18
  - TypeScript
  - React Router v6
  - Material UI v5
  - React Query
  - Vite
  - React Hook Form
  - Date-fns
  - MUI X-Date-Pickers

- **Backend**:
  - Node.js
  - Express
  - RESTful API design

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher

### Required Dependencies

The following key dependencies are required for the project:

```json
{
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0",
  "@hookform/resolvers": "^3.3.4",
  "@mui/icons-material": "^5.14.9",
  "@mui/material": "^5.14.9",
  "@mui/x-date-pickers": "^6.19.7",
  "@tanstack/react-query": "^4.35.3",
  "date-fns": "^2.30.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hook-form": "^7.51.1",
  "react-router-dom": "^6.16.0"
}
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd uo-registration
```

2. Install dependencies:
```bash
# Install all dependencies including development dependencies
npm install

# If you encounter any issues with date picker components, run:
npm install @mui/x-date-pickers@6.19.7 date-fns@2.30.0 --save
```

3. Verify installation:
```bash
# Check if all dependencies are correctly installed
npm list --depth=0
```

### Development Mode

```bash
# Start frontend development server
npm run dev

# Start backend development server in a separate terminal
npm run dev:server
```

### Troubleshooting Common Issues

1. Date Picker Issues:
   - If you see errors related to date-pickers, try reinstalling the specific versions:
   ```bash
   npm uninstall @mui/x-date-pickers date-fns
   npm install @mui/x-date-pickers@6.19.7 date-fns@2.30.0 --save
   ```

2. Port Conflicts:
   - The development server will automatically try alternative ports if 5173 is in use
   - You can manually specify a port using:
   ```bash
   npm run dev -- --port 3000
   ```

### Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

### Running in Production

```bash
npm run start
```

## Project Structure

```
uo-registration/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Common components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── server/            # Backend server code
│   │   └── routes/        # API routes
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx           # Application entry
│   ├── main.tsx          # React rendering entry
│   └── index.css         # Global styles
├── index.html            # HTML template
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # Node.js TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project dependencies and scripts
```

## API Documentation

### Unit Operation API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/unit-operations` | GET | Get all unit operations |
| `/api/unit-operations/:id` | GET | Get specific unit operation |
| `/api/unit-operations` | POST | Create new unit operation |
| `/api/unit-operations/:id` | PUT | Update unit operation |
| `/api/unit-operations/:id` | DELETE | Delete unit operation |

## Future Plans

- User authentication and authorization
- File upload functionality
- Database integration
- Unit testing
- Internationalization support 
