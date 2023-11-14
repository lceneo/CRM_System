#/bin/sh
cat > /usr/share/nginx/html/config/config.js << EOF
__config = {
        apiUrl: "${API_URL}",
        protocol: "${API_PROTOCOL}"
      }
EOF

nginx -g "daemon off;"
