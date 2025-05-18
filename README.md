# SportsFusion

A comprehensive application for tracking and managing sports activities.

## Environment Variables

### Database Configuration

The application requires the following environment variables for database configuration:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `SINGLESTORE_HOST` | Database host address | `localhost` |
| `SINGLESTORE_USER` | Database username | `admin` |
| `SINGLESTORE_PASSWORD` | Database password | `password` |
| `SINGLESTORE_DATABASE` | Database name | `sportsfusion` |
| `SINGLESTORE_PORT` | Database port | `3306` |

Default values are provided as fallbacks when environment variables are not explicitly set. In production, always set these variables explicitly.

### Authentication Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Full URL of your application (in production) | Production only |

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (or rely on defaults for development)
4. Run the development server: `npm run dev`

## Deployment

When deploying to Vercel, make sure to configure all required environment variables in your project settings.

For more detailed information about database configuration, see [Database Configuration](./docs/database-configuration.md).
