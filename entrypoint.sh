#!/bin/sh

# Replace hardcoded localhost URLs in the specified file with the BASE_URL
echo "Replacing 'http://localhost:8000' with BASE_URL..."
sed -i "s|http://localhost:8000|$BASE_URL|g" src/app/Auth/inlogandregister/inlogandregister.component.ts
sed -i "s|http://localhost:8000|$BASE_URL|g" src/environments/environment.development.ts

# Log the BASE_URL value (for demonstration)
echo "The value of BASE_URL is: $BASE_URL"

# Build the Angular app
echo "Building the Angular app..."
ng build --configuration=production

# Start NGINX
echo "Starting NGINX..."
exec nginx -g "daemon off;"
