FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
COPY seed.js ./

RUN npx prisma generate

EXPOSE 5555

CMD ["npx", "prisma", "studio", "--port", "5555", "--hostname", "0.0.0.0"]
