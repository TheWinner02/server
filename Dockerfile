FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app
COPY ./video_extractor/package*.json ./
RUN npm install
COPY ./video_extractor .
CMD ["node", "server.js"]
