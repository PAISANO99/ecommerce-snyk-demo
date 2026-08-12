# Guía Completa de Seguridad con Snyk en el Proyecto E-Commerce

Esta guía cubre la aplicación práctica de la herramienta **Snyk** en las 5 dimensiones fundamentales de la seguridad del software vistas en clase:

1. **Análisis de Dependencias (Snyk Open Source / SCA)**
2. **Cumplimiento de Licencias (Snyk Licenses)**
3. **Análisis Estático de Código (Snyk Code / SAST)**
4. **Seguridad en Contenedores (Snyk Container)**
5. **Infraestructura como Código (Snyk Infrastructure as Code / IaC)**

---

## 1. Requisitos Previos y Autenticación

Para ejecutar Snyk en tu máquina local:

1. Tener Node.js instalado (v18+).
2. Autenticar la CLI de Snyk ejecutando en la terminal:
   ```bash
   npx snyk auth
   ```
   *Esto abrirá el navegador para conectar tu cuenta gratuita o empresarial de Snyk y sincronizar el token local.*

---

## 2. Las 5 Dimensiones de Snyk en el Proyecto

### 2.1. Análisis de Dependencias (Open Source / SCA)

**Propósito**: Identificar librerías de terceros (`npm packages`) en `package.json` / `package-lock.json` que tengan vulnerabilidades conocidas (CVEs).

* **Comandos en Consola**:
  ```bash
  # Escanear cliente frontend
  cd client && npx snyk test

  # Escanear servidor backend
  cd server && npx snyk test

  # Escanear todos los proyectos desde la raíz
  npm run snyk:deps
  ```

* **Flags útiles**:
  * `--severity-threshold=high`: Muestra únicamente vulnerabilidades de severidad alta o crítica.
  * `--json`: Genera el reporte estructurado en formato JSON.

---

### 2.2. Análisis de Licencias de Código Abierto (Snyk Licenses)

**Propósito**: Detectar riesgos legales e incompatibilidades de licencias (ej. GPL, AGPL vs Licencias permisivas MIT/Apache-2.0) en los módulos de terceros.

* **Comandos en Consola**:
  ```bash
  # Escanear licencias en cliente
  cd client && npx snyk test --licenses

  # Escanear licencias en servidor
  cd server && npx snyk test --licenses

  # Escanear licencias en todo el proyecto desde la raíz
  npm run snyk:licenses
  ```

---

### 2.3. Análisis Estático de Código Fuente (Snyk Code / SAST)

**Propósito**: Analizar el código propio escrito en TypeScript/JavaScript (`src/`, `tests/`) buscando fallos de seguridad (SQL Injection, XSS, Path Traversal, Hardcoded Secrets, etc.).

* **Comandos en Consola**:
  ```bash
  # Escanear código del proyecto
  npx snyk code test

  # Ejecutar desde script de NPM
  npm run snyk:code
  ```

---

### 2.4. Seguridad en Contenedores (Snyk Container)

**Propósito**: Escanear imágenes de Docker y archivos `Dockerfile` buscando vulnerabilidades en la imagen base (ej. `node:20-alpine`, `nginx:1.25-alpine`) y en paquetes del SO (apk/apt).

* **Archivos Evaluados**:
  * [Dockerfile Servidor](file:///c:/Users/PC/Downloads/E-commerce-web-main/server/Dockerfile)
  * [Dockerfile Cliente](file:///c:/Users/PC/Downloads/E-commerce-web-main/client/Dockerfile)

* **Comandos en Consola**:
  ```bash
  # Escanear Dockerfile del Servidor
  npm run snyk:container:server

  # Escanear Dockerfile del Cliente
  npm run snyk:container:client
  ```

---

### 2.5. Infraestructura como Código (Snyk IaC)

**Propósito**: Evaluar archivos de configuración de infraestructura (`Docker Compose`, `Kubernetes Manifests`, `Azure Pipelines`) en busca de malas configuraciones de seguridad (ej. contenedores corriendo como root, falta de límites de memoria/CPU, puertos inseguros).

* **Archivos Evaluados**:
  * [docker-compose.yml](file:///c:/Users/PC/Downloads/E-commerce-web-main/docker-compose.yml)
  * [deployment.yaml](file:///c:/Users/PC/Downloads/E-commerce-web-main/k8s/deployment.yaml)
  * [azure-pipelines.yml](file:///c:/Users/PC/Downloads/E-commerce-web-main/azure-pipelines.yml)

* **Comandos en Consola**:
  ```bash
  # Escanear la infraestructura del proyecto
  npx snyk iac test k8s/ docker-compose.yml

  # Ejecutar mediante script NPM
  npm run snyk:iac
  ```

---

## 3. Resumen de Comandos en Root `package.json`

| Comando NPM | Descripción | Herramienta Snyk |
| :--- | :--- | :--- |
| `npm run snyk:deps` | Escanea vulnerabilidades en dependencias NPM de client y server | Snyk Open Source |
| `npm run snyk:licenses` | Verifica el cumplimiento de licencias de código abierto | Snyk Licenses |
| `npm run snyk:code` | Análisis estático del código fuente TS/JS (SAST) | Snyk Code |
| `npm run snyk:container:server` | Escanea el `Dockerfile` del backend | Snyk Container |
| `npm run snyk:container:client` | Escanea el `Dockerfile` del frontend | Snyk Container |
| `npm run snyk:iac` | Escanea `docker-compose.yml` y manifiestos `k8s/` | Snyk IaC |
| `npm run snyk:all` | Ejecuta la suite completa de seguridad secuencialmente | Snyk Suite |

---

## 4. Automatización en CI/CD

El proyecto cuenta con integración automática para Snyk en los pipelines de integración continua:

* **GitHub Actions**: [.github/workflows/snyk-security.yml](file:///c:/Users/PC/Downloads/E-commerce-web-main/.github/workflows/snyk-security.yml)
* **Azure DevOps Pipelines**: [azure-pipelines.yml](file:///c:/Users/PC/Downloads/E-commerce-web-main/azure-pipelines.yml) (Stage `SnykSecurityScan`)

Para activar la ejecución en CI/CD, simplemente agregue el secreto `SNYK_TOKEN` en las configuraciones de su repositorio de GitHub o Azure DevOps.
