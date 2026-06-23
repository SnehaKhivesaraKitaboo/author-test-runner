# EPUB Automation Tester — staging container.
# Uses the official Cypress image which bundles Chrome + all OS libs Cypress/Puppeteer need.
# Pin by digest in production; tag pinned here to match cypress@12.17.4.
FROM cypress/browsers:node-18.16.0-chrome-114.0.5735.133-1-ff-114.0.2-edge-114.0.1823.51-1

ENV NODE_ENV=production \
    OPEN_BROWSER=0 \
    PORT=4321 \
    # Reuse the image's preinstalled browsers instead of downloading Puppeteer's Chromium
    PUPPETEER_SKIP_DOWNLOAD=1 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# App source
COPY . .

# Run as the non-root user provided by the Cypress base image.
RUN mkdir -p runs logs && chown -R node:node /app
USER node

EXPOSE 4321

# Disk-only by default; override SKIP_DB / DB_* via env or --env-file at deploy time.
CMD ["node", "server.js"]
