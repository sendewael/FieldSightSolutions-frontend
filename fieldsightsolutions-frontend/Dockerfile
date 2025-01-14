# Use Nginx to serve the Angular app
FROM nginx:alpine

# Copy built Angular files from the correct directory to the Nginx HTML directory
COPY ./dist/fieldsightsolutions-frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]