# Backend Dockerfile for Classroom Booking API
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 7072

# Set environment variable for port
ENV PORT=7072

# Start the application
CMD ["node", "simple-server.js"]
