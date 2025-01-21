# Stage 1: Build the Angular app
FROM node:22 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/fieldsightsolutions-frontend/browser /usr/share/nginx/html

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENV BASE_URL "http://localhost:8000/api"

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]