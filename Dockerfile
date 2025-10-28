# Use Node.js 18 for building
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Build the React (Vite) app for production
RUN npm run build

# --- Stage 2: Run the production build with a lightweight server ---
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for frontend
EXPOSE 80

# Run NGINX
CMD ["nginx", "-g", "daemon off;"]