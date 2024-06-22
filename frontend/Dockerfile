# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app/

# Install Angular CLI globally and node packages
RUN npm install -g @angular/cli && npm install

# Add the rest of the client code
COPY . /app

# Expose port 4200 for the Angular server
EXPOSE 4200

# Start the Angular app using the CLI
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]
