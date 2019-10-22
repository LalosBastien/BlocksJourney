FROM node:11.7 as build

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm install -g @angular/cli@1.7.4
RUN ng build

FROM httpd:2.4

ENV HTTPD__DocumentRoot /var/www

WORKDIR /usr/local/apache2/htdocs/

COPY --from=build /app/dist/ .

