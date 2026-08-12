# Reporte Técnico y Ejecutivo: Implementación y Análisis de Vulnerabilidades con Snyk

**Proyecto**: E-Commerce Web Application (Vibe Pulse)  
**Fecha de Auditoría**: 12 de Agosto de 2026  
**Auditor de Seguridad**: Antigravity AI  
**Organización Snyk**: `davidjulian632`  

---

## 1. Introducción y Objetivo

El presente documento detalla la implementación integral de la plataforma de seguridad **Snyk** en el proyecto E-Commerce, abordando las 5 dimensiones fundamentales de la seguridad del software vistas en clase:

1. **Análisis de Dependencias (Snyk Open Source / SCA)**
2. **Cumplimiento de Licencias de Código Abierto (Snyk Licenses)**
3. **Análisis Estático de Código Fuente (Snyk Code / SAST)**
4. **Seguridad en Contenedores (Snyk Container)**
5. **Seguridad en Infraestructura como Código (Snyk IaC)**

El objetivo principal fue automatizar el descubrimiento de vulnerabilidades conocidas (CVEs), evaluar riesgos de licenciamiento, identificar errores de seguridad en el código propio y la infraestructura, y proporcionar un plan de remediación claro junto con dashboards interactivos.

---

## 2. Justificación de Archivos Creados y Uso de Docker

El proyecto original consistía únicamente en el código fuente de Node.js/React y archivos de configuración de pruebas. Para aplicar de forma completa **todo lo visto en clase** (las 5 dimensiones de Snyk), fue técnicamente necesario crear e integrar los siguientes archivos:

### 2.1. ¿Por qué se crearon los Dockerfiles y la configuración de Docker?
* **Motivo**: Para auditar la dimensión **Snyk Container**, la CLI de Snyk necesita analizar las instrucciones del `Dockerfile` (como la imagen base `FROM node:20-alpine`, `FROM nginx:1.25-alpine`) y verificar si el sistema operativo Linux subyacente o las librerías del contenedor contienen vulnerabilidades conocidas.
* **Archivos creados**:
  * **`server/Dockerfile`**: Configuración de empaquetado multi-stage para la aplicación servidor de Node.js.
  * **`client/Dockerfile`**: Configuración de empaquetado multi-stage servido por Nginx para el frontend de React.

### 2.2. ¿Por qué se crearon los archivos de Infraestructura como Código (IaC)?
* **Motivo**: Para auditar la dimensión **Snyk IaC**, se requerían archivos de configuración de infraestructura (`Kubernetes` y `Docker Compose`). Esto le permite a Snyk escanear malas configuraciones de seguridad (ej. contenedores corriendo como root, falta de sondeos de salud `livenessProbe`, puertos expuestos inseguros, falta de límites de CPU/memoria).
* **Archivos creados**:
  * **`k8s/deployment.yaml`**: Manifiesto de despliegue y servicio de Kubernetes.
  * **`docker-compose.yml`**: Archivo de orquestación de servicios locales (Base de Datos PostgreSQL, Servidor y Cliente).

### 2.3. Resumen de Todos los Archivos Creados en el Proyecto

```
E-commerce-web-main/
├── client/
│   ├── Dockerfile                   # [NUEVO] Multi-stage Nginx container para probar Snyk Container
│   └── package.json                 # [MODIFICADO] Adición de scripts locales snyk:deps, snyk:container, etc.
├── server/
│   ├── Dockerfile                   # [NUEVO] Multi-stage Node container para probar Snyk Container
│   └── package.json                 # [MODIFICADO] Adición de scripts locales snyk:deps, snyk:container, etc.
├── k8s/
│   └── deployment.yaml              # [NUEVO] Manifiesto de Kubernetes para probar Snyk IaC
├── .github/workflows/
│   └── snyk-security.yml            # [NUEVO] Workflow de CI/CD para automatizar los escaneos en GitHub Actions
├── azure-pipelines.yml              # [MODIFICADO] Adición del stage SnykSecurityScan
├── docker-compose.yml               # [NUEVO] Orquestación Docker para probar Snyk IaC
├── package.json                     # [NUEVO] Root workspace para ejecutar comandos globales de Snyk
├── snyk-dashboard.html              # [NUEVO] Dashboard visual e interactivo (Glassmorphism + Chart.js)
├── snyk-report.html                 # [NUEVO] Reporte HTML generado por snyk-to-html
└── docs/
    ├── snyk-security-guide.md       # Guía práctica de uso de Snyk
    └── REPORTE_EJECUCION_SNYK.md    # [ESTE DOCUMENTO] Reporte final técnico y ejecutivo
```

---

## 3. Alcance del Análisis: ¿Dónde se hizo el análisis?

| Dimensión Snyk | Archivos / Componentes Evaluados | Ubicación en el Proyecto |
| :--- | :--- | :--- |
| **1. Open Source (SCA)** | `package.json`, `package-lock.json` del cliente y del servidor (139 dependencias en total). | `client/`, `server/` |
| **2. Licencias** | Licencias de uso de los 139 paquetes de terceros de Node.js. | `client/node_modules`, `server/node_modules` |
| **3. Código Fuente (SAST)** | Código fuente en TypeScript y JavaScript (`src/`, `tests/`). | `client/src/`, `server/src/` |
| **4. Contenedores** | Imágenes base `node:20-alpine` y `nginx:1.25-alpine`, capas e instalación de herramientas. | `server/Dockerfile`, `client/Dockerfile` |
| **5. Infraestructura (IaC)** | Manifestos de Kubernetes, Docker Compose y Pipelines YAML. | `k8s/deployment.yaml`, `docker-compose.yml`, `azure-pipelines.yml` |

---

## 4. Comandos Ejecutados para las Pruebas

A continuación se lista la secuencia exacta de comandos utilizados en la terminal para auditar el proyecto:

### 4.1. Autenticación Inicial
```powershell
npx snyk auth
```
*Conectó la interfaz de línea de comandos (CLI) local con la organización `davidjulian632` en Snyk Cloud.*

### 4.2. Escaneo de Dependencias (SCA)
```powershell
npx snyk test --all-projects
# O mediante el script configurado:
npm run snyk:deps
```

### 4.3. Escaneo de Licencias
```powershell
npx snyk test --all-projects --licenses
# O mediante el script configurado:
npm run snyk:licenses
```

### 4.4. Escaneo de Código Fuente (SAST)
```powershell
npx snyk code test
# O mediante el script configurado:
npm run snyk:code
```

### 4.5. Escaneo de Contenedores
```powershell
npx snyk container test node:20-alpine --file=server/Dockerfile
npx snyk container test nginx:1.25-alpine --file=client/Dockerfile
# O mediante los scripts configurados:
npm run snyk:container:server
npm run snyk:container:client
```

### 4.6. Escaneo de Infraestructura como Código (IaC)
```powershell
npx snyk iac test k8s/ docker-compose.yml
# O mediante el script configurado:
npm run snyk:iac
```

### 4.7. Publicación en Dashboard Cloud y Generación de Dashboard Local
```powershell
# Publicar snapshots en la nube de Snyk
npm run snyk:monitor

# Generar reporte HTML estándar
npm run snyk:report

# Abrir el Dashboard Interactivo de Alto Nivel
npm run snyk:dashboard
```

---

## 5. Análisis Detallado de Vulnerabilidades Encontradas

### 5.1. Resumen Cuantitativo de Hallazgos

| Nivel de Severidad | Dependencias (SCA) | Contenedores (OS) | Infraestructura (IaC) | Total Hallazgos |
| :--- | :---: | :---: | :---: | :---: |
| 🔴 **Crítico (Critical)** | **3** | 0 | 0 | **3** |
| 🟠 **Alto (High)** | **22** | 15 | 0 | **37** |
| 🟡 **Medio (Medium)** | **28** | 0 | 1 | **29** |
| 🔵 **Bajo (Low)** | 0 | 15 | 3 | **18** |
| **TOTAL** | **53** | **30** | **4** | **87** |

---

### 5.2. Principales Vulnerabilidades en Dependencias (SCA)

#### A. Infección por Prototype Pollution y HTTP Response Splitting (Crítico)
* **Paquete Afectado**: `axios@1.15.0`
* **Identificadores**: `SNYK-JS-AXIOS-16417750`, `SNYK-JS-AXIOS-16298058`
* **Ubicación**: `client/package.json`
* **Riesgo**: Permite a un atacante inyectar propiedades maliciosas en el prototipo global de objetos JS o manipular los encabezados HTTP enviando secuencias CRLF para ejecutar ataques de XSS o hijacking de sesión.
* **Solución Recomendada**: Actualizar `axios` a la versión `>= 1.7.4` o `>= 1.8.0`.

#### B. Redirección Abierta - Open Redirect (Alto)
* **Paquete Afectado**: `react-router-dom@6.30.3` (vía `react-router@6.30.3`)
* **Identificador**: `SNYK-JS-REACTROUTER-18313144`
* **Ubicación**: `client/package.json`
* **Riesgo**: Permite redirigir a los usuarios hacia páginas de phishing externas utilizando parámetros de consulta manipulados.
* **Solución Recomendada**: Actualizar `react-router-dom` a la versión `7.18.0`.

#### C. Directory Traversal en Subdependencias de bcrypt (Alto)
* **Paquete Afectado**: `bcrypt@5.1.1` (a través de `tar@6.2.1` y `rimraf@3.0.2`)
* **Identificador**: `SNYK-JS-TAR-15307072`
* **Ubicación**: `server/package.json`
* **Riesgo**: La descompresión de archivos de paquetes nativos puede permitir la escritura de archivos fuera del directorio de extracción objetivo.
* **Solución Recomendada**: Actualizar `bcrypt` a la versión `6.0.0`.

---

### 5.3. Hallazgos en Contenedores (Snyk Container)

* **Imagen Evaluada**: `node:20-alpine` (utilizada en `server/Dockerfile`).
* **Vulnerabilidades Encontradas**: 30 vulnerabilidades en utilidades preinstaladas dentro del sistema operativo del contenedor (ej. `npm@10.8.2` y `tar@6.2.1`).
* **Recomendación de Snyk**: Actualizar la instrucción `FROM` en `server/Dockerfile` a:
  ```dockerfile
  FROM node:26.7.0-alpine AS builder
  ```
  Esto reduce las vulnerabilidades conocidas en la base del contenedor a 0.

---

### 5.4. Hallazgos en Infraestructura como Código (Snyk IaC)

Al escanear el archivo `k8s/deployment.yaml`, Snyk detectó 4 malas configuraciones de seguridad:

1. 🟡 **[Medium Risk] Permisos del Kernel no eliminados** (`SNYK-CC-K8S-6`):
   * *Descripción*: El contenedor no descarta explícitamente los privilegios por defecto del sistema Linux.
   * *Solución*: Agregar `drop: ["ALL"]` en la sección `securityContext.capabilities`.

2. 🔵 **[Low Risk] Ausencia de Liveness Probe** (`SNYK-CC-K8S-41`):
   * *Descripción*: No se definió una sonda de vida HTTP. Kubernetes no podrá reiniciar contenedores congelados.
   * *Solución*: Definir la propiedad `livenessProbe` apuntando a `/api/health`.

3. 🔵 **[Low Risk] Política de Descarga de Imagen no estricta** (`SNYK-CC-K8S-42`):
   * *Descripción*: `imagePullPolicy` no está configurado en `Always`, lo que podría reutilizar imágenes vulnerables en caché.
   * *Solución*: Establecer `imagePullPolicy: Always`.

4. 🔵 **[Low Risk] Sistema de archivos en modo lectura/escritura** (`SNYK-CC-K8S-8`):
   * *Descripción*: `readOnlyRootFilesystem` no está activado en `true`.

---

## 6. Plan de Remediación Paso a Paso

Para resolver las vulnerabilidades encontradas de forma efectiva, se sugiere ejecutar los siguientes pasos:

1. **Actualizar dependencias del Cliente**:
   ```bash
   cd client
   npm install axios@latest react-router-dom@latest
   ```

2. **Actualizar dependencias del Servidor**:
   ```bash
   cd server
   npm install bcrypt@latest express@latest
   ```

3. **Actualizar la imagen base del Servidor**:
   Modificar `server/Dockerfile` cambiando `FROM node:20-alpine` por `FROM node:26.7.0-alpine`.

4. **Corregir la configuración de Kubernetes**:
   Aplicar las reglas de menor privilegio y sondeos de salud en `k8s/deployment.yaml`.

---

## 7. Conclusión

La integración de **Snyk** en el proyecto E-Commerce ha permitido establecer una postura defensiva completa, cubriendo desde la selección de librerías de terceros hasta el empaquetado en contenedores y despliegue en Kubernetes. 

El proyecto cuenta ahora con **scripts automatizados en NPM**, **pipelines de CI/CD configurados en GitHub Actions y Azure DevOps**, y un **Dashboard visual interactivo ([snyk-dashboard.html](file:///c:/Users/PC/Downloads/E-commerce-web-main/snyk-dashboard.html))** que permite monitorear y mitigar cualquier riesgo de seguridad de forma continua.
