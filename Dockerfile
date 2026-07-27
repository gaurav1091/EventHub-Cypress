FROM cypress/included:14.5.4

WORKDIR /app

ENV CI=true \
    EVENTHUB_ENV=qa \
    EVENTHUB_TEST_DATA_NAMESPACE=docker-local

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN mkdir -p reports cypress/screenshots cypress/videos cypress/downloads

ENTRYPOINT []
CMD ["npm", "run", "test:smoke"]
