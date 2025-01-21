#!/bin/sh
# Replace environment variables in index.html
sed -i 's|BASE_URL_PLACEHOLDER|'${BASE_URL}'|g' /usr/share/nginx/html/index.html

# Start Nginx
nginx -g 'daemon off;'
