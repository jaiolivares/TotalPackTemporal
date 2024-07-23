# Etapa de construcción
FROM node:alpine AS build

WORKDIR /usr/src/app

# Reusar capa de angular CLI
RUN npm install -g @angular/cli

# Copiar solo el lock de dependencias
COPY package-lock.json /usr/src/app/package-lock.json
COPY package.json /usr/src/app/package.json
RUN npm install --force

# Copiar el resto del src
COPY . /usr/src/app

# Construir la aplicación
RUN ng build --configuration production

# Etapa de producción
FROM nginx:stable-alpine

# Copiar archivos de construcción a nginx
COPY --from=build /usr/src/app/dist/emisor-tradicional /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80

# Comando por defecto para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]