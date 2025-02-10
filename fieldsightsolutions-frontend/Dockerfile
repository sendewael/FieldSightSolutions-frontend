FROM nginx:alpine

# Install Node.js in the runtime image
RUN apk add --no-cache nodejs npm

# Set environment variable
ENV BASE_URL "http://placeholder:8000"

# Expose port 80
EXPOSE 80

# Copy project files into the container (into the correct directory)
COPY . /fieldsightsolutions-frontend/app

# Set working directory to where your app is
WORKDIR /fieldsightsolutions-frontend/app

# Install dependencies and Angular CLI
RUN npm install --legacy-peer-deps && npm install -g @angular/cli

# Remove lines from leaflet.css
RUN sed -i '/background-image: url(images\/layers.png);/d' node_modules/leaflet/dist/leaflet.css && \
    sed -i '/background-image: url(images\/layers-2x.png);/d' node_modules/leaflet/dist/leaflet.css && \
    sed -i '/background-image: url(images\/marker-icon.png);/d' node_modules/leaflet/dist/leaflet.css

# Copy entrypoint.sh and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy custom NGINX configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
