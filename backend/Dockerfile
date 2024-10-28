# build stage
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# prod stage
FROM node:18-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist

# zkapp-cli keys 디렉토리 생성
RUN mkdir -p /root/.cache/zkapp-cli/keys/

# 키 파일들을 Docker 컨테이너의 캐시 디렉토리로 복사
COPY ./keys/biddingcontractPayer.json /root/.cache/zkapp-cli/keys/biddingcontractPayer.json
COPY ./keys/biddingcontract.json /root/.cache/zkapp-cli/keys/biddingcontract.json
COPY ./keys/auctionPayer.json /root/.cache/zkapp-cli/keys/auctionPayer.json
COPY ./keys/auctioncontract.json /root/.cache/zkapp-cli/keys/auctioncontract.json

COPY package*.json ./
COPY config.json ./ 
COPY .env ./

RUN npm install --only=production
RUN rm package*.json

EXPOSE 3001

CMD [ "node", "dist/src/main.js" ]
