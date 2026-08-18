FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Set working directory to /app
WORKDIR /app

# Copy everything
COPY . .

# Setup server
WORKDIR /app/server
RUN npm install
RUN npx prisma generate

# The port our app listens on
EXPOSE 3000

# Start server
CMD ["npm", "start"]
