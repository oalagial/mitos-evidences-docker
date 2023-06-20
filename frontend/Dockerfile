# Use an official Node.js runtime as the base image
FROM node:14 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the React app for production
RUN npm run build

# Use a smaller and efficient base image for serving the static files
FROM nginx:alpine

# Copy the built React app from the builder stage to the Nginx web root directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the port on which the frontend will run (assuming 80)
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
