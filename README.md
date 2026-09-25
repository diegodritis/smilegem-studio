# SmileGem Studio 💎🦷

> **Professional 3D & 2D Tooth Gem Design Studio**  
> Diseñador interactivo en tiempo real para aplicaciones estéticas dentales, gemas dentales personalizadas y odontogramas clínicos.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Características Principales

- **Renderizado 3D Anatómico Fotorrealista**:
  - Arcada superior e inferior con geometría dental anatómica (cara labial plana, filo incisal cincelado, estrechamiento cervical).
  - Encía continua (*gingiva*) suavemente integrada.
  - Esmalte dental multicapa PBR con refracción física (`clearcoat`, roughness variable e IOR de esmalte húmedo).
  - Iluminación de estudio calibrada (*softbox banks* y luz hemisférica).
- **Herramientas de Gemas Dentales**:
  - Catálogo de gemas con formas geométricas y cristales de alta fidelidad.
  - Selección por *raycasting* directo sobre superficies dentales con orientación normal tangencial.
  - Transformaciones interactivas (escala, rotación, traslación sobre la superficie dental).
  - Menú contextual rápido (click derecho o botón de herramientas): Duplicar, Voltear H/V, Copiar, Pegar, Eliminar.
- **Odontograma Clínico 2D & Vista Dual**:
  - Nomenclatura dental estándar FDI (11 a 48).
  - Sincronización instantánea bidireccional entre la visualización 3D y el esquema clínico 2D.
- **Exportación & Portafolio**:
  - Exportación en alta resolución PNG y fichas técnicas clínicas en PDF con `jspdf`.
  - Catálogo de plantillas preconfiguradas y guardado de diseños de clientes.
  - Modo Showcase / Exhibición para presentación directa al cliente.
- **Nube & Autenticación (Opcional)**:
  - Integración nativa con Supabase para almacenamiento persistente y cuentas de usuario.
  - Funcionamiento *offline-first* con LocalStorage si no hay conexión o configuración backend.

---

## 🔒 Medidas de Seguridad Implementadas

1. **Protección de Credenciales y Secretos**:
   - Todas las claves de API y variables de entorno (`.env`, `.env.*`) están estrictamente excluidas del repositorio mediante `.gitignore`.
   - Se provee un archivo `.env.example` con valores de plantilla seguros para desarrolladores.
2. **Dependencias Auditadas & Dependabot**:
   - Configuración activa de GitHub Dependabot (`.github/dependabot.yml`) para alertas tempranas y actualizaciones automáticas de parches de seguridad.
3. **Control de Flujo CI/CD Seguro**:
   - Pipeline de despliegue mediante GitHub Actions con permisos mínimos necesarios (`contents: read`, `pages: write`, `id-token: write`).
4. **Política de Divulgación Responsable**:
   - Guía oficial en [SECURITY.md](./SECURITY.md) para reporte de vulnerabilidades.

---

## 🚀 Instalación y Desarrollo Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18 o superior
- `npm` v9 o superior

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/diegodritis/smilegem-studio.git
cd smilegem-studio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible localmente en `http://localhost:5173`.

---

## 📦 Construcción para Producción

```bash
# Compilar TypeScript y empaquetar con Vite
npm run build

# Previsualizar el bundle de producción localmente
npm run preview
```

---

## 🌐 Despliegue en la Nube

El proyecto está configurado para desplegarse automáticamente en **GitHub Pages** mediante GitHub Actions en cada actualización a la rama `main`:
- Repositorio: [https://github.com/diegodritis/smilegem-studio](https://github.com/diegodritis/smilegem-studio)
- Aplicación en vivo: `https://diegodritis.github.io/smilegem-studio/`

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
