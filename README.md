# Programacion - Guia General

Este repositorio contiene 2 ejercicios independientes. Cada uno tiene su propio `README.md` y dependencias.

## Requisitos generales

- Node.js y npm instalados
- Ejecutar comandos desde la carpeta del ejercicio correspondiente

## Estructura

- `ejercicio 1/`: app Angular (`criptoactivos`)
- `ejercicio 2/`: CMS modular con plugins dinamicos (Angular + Webpack Module Federation)

## Ejercicio 1 - Criptoactivos

### Informacion basica

- Proyecto generado con Angular CLI `21.1.4`
- Incluye host y microfrontends (`mfe-dashboard`, `mfe-transactions`)
- Script principal de desarrollo: `npm start` (equivale a `ng serve`)

### Como ejecutarlo

```bash
cd "ejercicio 1"
npm install
npm start
```

App principal: `http://localhost:4200/`

### Comandos utiles

```bash
npm run start:host
npm run start:mfe-dashboard
npm run start:mfe-transactions
npm run build
npm run test
```

Nota: si vas a probar la arquitectura con microfrontends, levanta tambien los `mfe-*` en terminales separadas.

## Ejercicio 2 - CMS Modular con Plugins Dinamicos

### Informacion basica

- Host CMS con carga dinamica de widgets remotos
- Uso de Module Federation, Signals y guard de integridad
- Remotes disponibles: `analytics` y `notes`

### Como ejecutarlo

En una terminal:

```bash
cd "ejercicio 2"
npm install
npm run start:remote:analytics
```

Remote analytics: `http://localhost:4201/`

En otra terminal:

```bash
cd "ejercicio 2"
npm run start:remote:notes
```

Remote notes: `http://localhost:4202/`

En una tercera terminal:

```bash
cd "ejercicio 2"
npm start
```

Host: `http://localhost:4200/`

### Comandos utiles

```bash
npm run build
npm run build:all
```
