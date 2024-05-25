# Use an official Node.js runtime as the base image
FROM node:20.11.1-slim
WORKDIR /app
COPY package*.json ./
RUN npm install\
    && npm install typescript -g
COPY . .
RUN tsc
EXPOSE 3000
EXPOSE 80
EXPOSE 443

CMD ["node", "/app/dist/app.js"]
