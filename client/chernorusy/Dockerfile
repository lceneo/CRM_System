FROM node:18.17.1-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx ngcc --properties es2023 browser module main --first-only --create-ivy-entry-points

COPY . .

RUN npm run build


FROM nginx:stable

COPY default.conf /etc/nginx/conf.d

COPY --from=build /app/dist/chernorusy /usr/share/nginx/html

WORKDIR /start

COPY ./start-app.sh .

EXPOSE 80

CMD [ "sh", "start-app.sh" ]






