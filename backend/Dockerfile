# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port on which the backend will run (assuming 3003)
EXPOSE 3003

# entrypoint
COPY entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint
ENTRYPOINT ["docker-entrypoint"]

# Start the backend server
#CMD ["npm", "start"]
