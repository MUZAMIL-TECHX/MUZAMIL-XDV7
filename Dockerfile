FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg webp git && \
    rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 9090
ENV NODE_ENV=production
CMD ["node", "launcher.js"]
