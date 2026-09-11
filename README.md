# 📱 Documentación del Frontend — Aplicación Offline-First

Aplicación web moderna desarrollada con **React 19**, **TypeScript** y **Vite**, diseñada bajo un sólido enfoque **offline-first**. Permite la creación, gestión y persistencia local de solicitudes sin depender de la red, sincronizándolas de forma totalmente transparente con la API backend en **.NET 8** tan pronto como se restablece la conexión a Internet.

---

## 🛠️ Tecnologías Utilizadas

* **React 19** + **TypeScript**
* **Vite** *(Build Tool & Dev Server)*
* **Dexie.js** *(Wrapper sobre IndexedDB para la persistencia de datos local)*
* **Tailwind CSS** *(Framework de estilos UI)*

---

## ⚡ Prerrequisitos

Antes de iniciar el proyecto, asegúrate de contar con el siguiente entorno instalado:

* **Node.js:** v24.0
* **npm:** Gestor de paquetes incluido con Node.js

---

## 🚀 Pasos de Instalación y Configuración

Para enlazar la aplicación con el servicio backend en .NET, debes verificar el puerto en el que corre tu API local y ajustar el punto de enlace.
1. Abre el archivo: src/services/syncService.ts
2. En la Línea 5, actualiza la constante API_URL asegurándote de colocar el puerto correcto configurado en tu backend

### 1. Instalar dependencias
Clona el repositorio, navega a la carpeta del proyecto y ejecuta:

bash
npm install

## Ejecutar en Entorno de Desarrollo
npm run dev
