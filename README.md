# ZADIA OS - Sistema Operativo Empresarial Agéntico

![ZADIA OS Logo](https://img.shields.io/badge/ZADIA%20OS-Agentic%20Enterprise%20OS-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange)
![License](https://img.shields.io/badge/License-Private-red)

## 🚀 Descripción del Proyecto

**ZADIA OS** es una plataforma revolucionaria de operaciones autónomas que utiliza **IA agéntica** y un **Gemelo Digital de la Organización** para orquestar flujos de trabajo complejos con autonomía e inteligencia empresarial.

### 🎯 Características Principales

- 🤖 **IA Agéntica Avanzada**: Agentes inteligentes que ejecutan tareas complejas de forma autónoma
- 🏢 **Gemelo Digital Organizacional**: Representación digital completa de tu empresa
- ⚡ **Automatización Inteligente**: Procesos empresariales automatizados con decisiones en tiempo real
- 📊 **Análisis Predictivo**: Insights profundos sobre el rendimiento organizacional
- 🔒 **Seguridad Empresarial**: Protección robusta con cifrado extremo a extremo
- 🌐 **Colaboración Unificada**: Herramientas integradas para equipos distribuidos
- 🔗 **Integración Universal**: Conecta con todas tus herramientas existentes

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```typescript
Frontend:
├── Next.js 15.5.3 (App Router)
├── React 19.1.0
├── TypeScript 5.0
├── Tailwind CSS 4.0
└── shadcn/ui + Radix UI

Backend & Servicios:
├── Firebase Authentication
├── Cloud Firestore
├── Firebase Storage
└── Node.js Runtime

Herramientas:
├── ESLint (Moderno)
├── Zod (Validaciones)
├── React Hook Form
├── React i18next
└── Lucide Icons
```

### Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js (App Router)
│   ├── (auth)/            # Rutas de autenticación
│   ├── (main)/            # Rutas protegidas principales
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes React reutilizables
│   ├── ui/               # Componentes UI base (shadcn)
│   ├── layout/           # Componentes de layout
│   ├── landing/          # Componentes de landing page
│   └── dashboard/        # Componentes del dashboard
├── contexts/             # Contextos de React (AuthContext)
├── hooks/                # Hooks personalizados
├── lib/                  # Utilidades y configuraciones
├── services/             # Servicios de Firebase y APIs
├── validations/          # Esquemas de validación con Zod
├── locales/              # Archivos de traducciones
└── types/                # Definiciones de tipos TypeScript
```

## 🚦 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18.0 o superior
- **npm** o **yarn**
- **Firebase Project** configurado
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/your-org/zadia-os-agent.git
cd zadia-os-agent
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configuración de Environment

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication (Email/Password y Google)
3. Configurar Firestore Database
4. Configurar reglas de seguridad:

```javascript
// Copiar contenido de firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas de seguridad estrictas implementadas
  }
}
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🏃‍♂️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run start        # Ejecutar build de producción

# Calidad de Código
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 🔐 Seguridad

ZADIA OS implementa múltiples capas de seguridad:

- **Autenticación robusta** con Firebase Auth
- **Reglas de Firestore** granulares y estrictas
- **Middleware de protección** para rutas sensibles
- **Headers de seguridad** (CSP, XSS Protection, etc.)
- **Validación de datos** en cliente y servidor
- **Cifrado extremo a extremo** para datos críticos

## 🌍 Internacionalización

Soporte completo para múltiples idiomas:

- **Español** (es) - Idioma principal
- **Inglés** (en) - Idioma secundario

Configuración automática basada en preferencias del usuario.

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Firebase Hosting

```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login y configurar
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## 🧪 Testing

```bash
# Unit Tests (a implementar)
npm run test

# E2E Tests (a implementar)  
npm run test:e2e

# Coverage (a implementar)
npm run test:coverage
```

## 📈 Performance

ZADIA OS está optimizado para máximo rendimiento:

- **Static Site Generation (SSG)** donde es posible
- **Server-Side Rendering (SSR)** para contenido dinámico
- **Code Splitting** automático
- **Image Optimization** con Next.js
- **Bundle Analysis** y optimización continua

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto es **propietario** y confidencial. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas:

- **Email**: support@zadia-os.com
- **Documentation**: [docs.zadia-os.com](https://docs.zadia-os.com)
- **Status**: [status.zadia-os.com](https://status.zadia-os.com)

## 🔄 Changelog

### v0.1.0 (Actual)
- ✅ Autenticación completa con Firebase
- ✅ Dashboard funcional con perfiles de usuario
- ✅ Landing page responsive
- ✅ Internacionalización ES/EN
- ✅ Arquitectura modular y escalable
- ✅ Seguridad empresarial implementada

---

**Desarrollado con ❤️ por el equipo de ZADIA OS**
