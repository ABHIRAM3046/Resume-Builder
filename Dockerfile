FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

ENV VITE_SUPABASE_URL=uriPlaceholder
ENV VITE_SUPABASE_ANON_KEY=keyPlaceholder

# Expose the port your app runs on
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev"]