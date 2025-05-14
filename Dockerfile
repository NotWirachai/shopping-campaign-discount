FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 👇 เพิ่ม 2 บรรทัดนี้
ARG REACT_APP_API_KEY
ENV REACT_APP_API_KEY=$REACT_APP_API_KEY

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
