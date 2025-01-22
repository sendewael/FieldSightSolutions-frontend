# Stage 1: Build the Angular app
FROM node:22 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

# Replace BASE_URL_PLACEHOLDER in the src/index.html before building
RUN sed -i 's|BASE_URL_PLACEHOLDER|${BASE_URL:-http://localhost:8000/api}|g' /app/src/index.html

# Now build the Angular app
RUN ng build --configuration=production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/fieldsightsolutions-frontend/browser /usr/share/nginx/html

ENV BASE_URL "http://localhost:8000/api"

EXPOSE 80

# Start Nginx without modifying the index.html again
CMD nginx -g 'daemon off;'