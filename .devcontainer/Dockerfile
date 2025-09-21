FROM node:20-bullseye
# ✅ Debian-based, works with Rollup native builds
# Set working directory
WORKDIR /app

# Install system deps needed for build (native modules, less, etc.)
RUN apt-get update && apt-get install -y \
  bash \
  python3 \
  g++ \
  make \
  && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies locally
RUN npm install

# Copy full source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Add node_modules/.bin to PATH
ENV PATH=/app/node_modules/.bin:$PATH

# Default command: run Vite dev server
#CMD ["vite", "dev", "--host", "--force"]
CMD ["npx", "vite", "dev", "--host", "--force"]

#CMD ["npm", "run", "vite:dev", "--",  "--host"]