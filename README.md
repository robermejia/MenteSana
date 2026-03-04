# 🧠 MenteSana - Auto-registro TCC

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**MenteSana** es una aplicación diseñada para facilitar el proceso de autorregistro en la Terapia Cognitivo-Conductual (TCC). Permite a los usuarios registrar situaciones, emociones, pensamientos automáticos y generar respuestas racionales de forma estructurada y segura.

🔗 **[Visitar el Despliegue en Vivo](https://mentesana-s9sn.onrender.com/)**

![MenteSana Preview](https://robermejia.com/img/portfolio/large/project-23/3.png)

## ✨ Características Principales

- **Registro Estructurado (TCC):** Documenta situaciones, emociones (con intensidad), pensamientos automáticos y respuestas alternativas.
- **Visualización de Estadísticas:** Analiza patrones emocionales y cognitivos a través de gráficos interactivos.
- **Autenticación con Firebase:** Sistema de cuentas seguro para guardar registros en la nube (Firestore).
- **Modo Demo (LocalStorage):** Prueba la aplicación sin necesidad de crear una cuenta; los datos se guardan en tu navegador.
- **Importación y Exportación:** Realiza copias de seguridad de tus registros en formato JSON e impórtalos cuando lo necesites.
- **Interfaz Moderna e Intuitiva:** Diseño completamente responsive y con soporte para diferentes resoluciones, ofreciendo una experiencia de usuario amigable.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18
- **Build Tool:** Vite
- **Estilos:** CSS Modules / Variables CSS y Tailwind CSS (para utilidades y componentes)
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Backend & Base de Datos:** Firebase (Authentication y Firestore)
- **Despliegue:** Render

## 🚀 Instalación y Uso Local

Sigue estos pasos para correr el proyecto en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd tcc-auto-registro
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

4. **Correr el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo de Vite.
- `npm run build`: Construye la aplicación optimizada para producción.
- `npm run preview`: Previsualiza la build de producción localmente.

## 📝 Licencia

Este proyecto es para uso personal y como portafolio.
