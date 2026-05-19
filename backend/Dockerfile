FROM php:8.2-cli

WORKDIR /app

RUN apt-get update && apt-get install -y \
    zip unzip curl git libzip-dev

RUN docker-php-ext-install pdo pdo_mysql zip

COPY . .

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN composer install

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=10000