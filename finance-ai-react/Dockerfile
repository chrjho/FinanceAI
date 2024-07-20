# Use the official Node.js image.
FROM node:18

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory.
COPY package*.json ./

# Install the dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the React app.
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the React app.
CMD ["npm", "start"]