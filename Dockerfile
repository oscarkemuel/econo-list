# # syntax = docker/dockerfile:1

# # Adjust NODE_VERSION as desired
# ARG NODE_VERSION=18.17.1
# FROM node:${NODE_VERSION}-slim as base

# LABEL fly_launch_runtime="Node.js/Prisma"

# # Node.js/Prisma app lives here
# WORKDIR /app

# # Set production environment
# ENV NODE_ENV="production"


# # Throw-away build stage to reduce size of final image
# FROM base as build

# # Install packages needed to build node modules
# RUN apt-get update -qq && \
#     apt-get install -y build-essential openssl pkg-config python-is-python3

# # Install node modules
# COPY --link package.json yarn.lock ./
# RUN yarn install --frozen-lockfile --production=false

# # Generate Prisma Client
# COPY --link prisma .
# RUN npx prisma generate

# # Copy application code
# COPY --link . .

# # Build application
# RUN yarn run build

# # Remove development dependencies
# RUN yarn install --production=true


# # Final stage for app image
# FROM base

# # Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# # Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# # installs, work.
# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
#     && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
#       --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# # Copy built application
# COPY --from=build /app /app

# # Setup sqlite3 on a separate volume
# RUN mkdir -p /data
# VOLUME /data

# # Entrypoint prepares the database.
# ENTRYPOINT [ "/app/docker-entrypoint.js" ]

# # Start the server by default, this can be overwritten at runtime
# EXPOSE 3000
# ENV DATABASE_URL="file:///data/sqlite.db" \
#     PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome" \
#     PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
# CMD [ "yarn", "run", "start" ]

# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=16.17.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js/Prisma"


# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install NPM
RUN apt-get update && apt-get install -y npm

# Throw-away build stage to reduce size of final image
FROM base as build

# # Install packages needed to build node modules
# RUN apt-get update -y && \
#     apt-get install -y python-is-python3 pkg-config build-essential

# Install node modules
COPY --link package.json yarn.lock ./
RUN npm install --production=false

# # Generate Prisma Client
COPY --link prisma .
RUN npx prisma generate

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Setup sqlite3 on a separate volume
RUN mkdir -p /data
VOLUME /data

# Entrypoint prepares the database.
ENTRYPOINT [ "/app/docker-entrypoint.js" ]

RUN apt-get install -y wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
RUN apt-get install chromium -y

EXPOSE 3000
ENV DATABASE_URL="file:///data/sqlite.db" \
    PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]