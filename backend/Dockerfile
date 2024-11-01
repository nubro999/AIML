# build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Install necessary build tools
RUN apk add --no-cache python3 make g++ linux-headers

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code AND contracts-cache directory
COPY . .
COPY contracts-cache ./contracts-cache

# Build the application
RUN npm run build

# prod stage
FROM node:20-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy built files and necessary files for running the application
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/contracts-cache ./contracts-cache

# Install runtime dependencies
RUN apk add --no-cache python3 make g++ linux-headers

EXPOSE 3001

CMD [ "node", "dist/src/main.js" ]
