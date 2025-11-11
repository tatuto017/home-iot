FROM node:22-bullseye
WORKDIR /app
RUN apt update && apt -y upgrade
RUN npm install -g npm-check-updates && \
    npm install -g @google/clasp \
    npm install -g line-simulator
