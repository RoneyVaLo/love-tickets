# Tickets Canjeables

Sistema web de gestión de tickets canjeables de actividades entre dos usuarios (Usuario Principal y Novia).

## Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: TailwindCSS 4
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router v7
- **Testing**: Vitest + fast-check (property-based testing)

## Estructura del Proyecto

```
src/
├── components/     # Componentes React
├── hooks/          # Custom hooks
├── services/       # Servicios de Firebase y API
├── types/          # Definiciones de tipos TypeScript
├── utils/          # Funciones utilitarias
└── test/           # Configuración de tests
```

## Configuración

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar Firebase:
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Copiar `.env.example` a `.env`
   - Completar las variables de entorno con las credenciales de Firebase

3. Iniciar el servidor de desarrollo:
```bash
pnpm dev
```

## Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm test` - Ejecuta todos los tests
- `pnpm test:unit` - Ejecuta solo tests unitarios
- `pnpm test:property` - Ejecuta solo property-based tests
- `pnpm test:watch` - Ejecuta tests en modo watch
- `pnpm test:ui` - Abre la interfaz de Vitest
- `pnpm lint` - Ejecuta el linter

## Configuración de Firebase

El proyecto requiere las siguientes variables de entorno:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Ver `.env.example` para más detalles.

## Testing

El proyecto utiliza una estrategia dual de testing:

- **Unit Tests**: Para casos específicos y edge cases
- **Property-Based Tests**: Para verificar propiedades universales usando fast-check

Ejecutar tests:
```bash
pnpm test
```

## Especificación

La especificación completa del proyecto se encuentra en `.kiro/specs/tickets-canjeables/`
