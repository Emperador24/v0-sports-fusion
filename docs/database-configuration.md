# Database Configuration

## Environment Variables

The application uses the following environment variables for database configuration:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `SINGLESTORE_HOST` | Database host address | `localhost` |
| `SINGLESTORE_USER` | Database username | `admin` |
| `SINGLESTORE_PASSWORD` | Database password | `password` |
| `SINGLESTORE_DATABASE` | Database name | `sportsfusion` |
| `SINGLESTORE_PORT` | Database port | `3306` |

## Default Values

Default values are provided as a fallback mechanism when environment variables are not explicitly set. These defaults are primarily intended for development and testing environments.

### Important Notes:

1. **Production Environments**: In production, always explicitly set all database environment variables. The default values are not suitable for production use.

2. **Mock Database Mode**: When running in development or preview environments without proper database configuration, the application will automatically use a mock database implementation that doesn't require an actual database connection.

3. **Security**: The default password is intentionally simple and should never be used in production. Always set a strong, unique password in your production environment.

## Configuration Precedence

1. Explicitly set environment variables
2. Default values (if environment variables are not set)
3. Mock database (in development/preview when connection fails)

## Example Configuration

For local development with a SingleStore database:

\`\`\`env
SINGLESTORE_HOST=localhost
SINGLESTORE_USER=myuser
SINGLESTORE_PASSWORD=mypassword
SINGLESTORE_DATABASE=sportsfusion_dev
SINGLESTORE_PORT=3306
\`\`\`

For production deployment:

\`\`\`env
SINGLESTORE_HOST=your-production-host.singlestore.com
SINGLESTORE_USER=production_user
SINGLESTORE_PASSWORD=strong-unique-password
SINGLESTORE_DATABASE=sportsfusion_prod
SINGLESTORE_PORT=3306
