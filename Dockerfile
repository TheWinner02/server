WORKDIR /app
COPY ./video_extractor/package*.json ./
RUN npm install
COPY ./video_extractor .
CMD ["node", "server.js"]