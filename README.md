# Carlos Carias - Prueba Cemaco

Prueba técnica C# y React (Cemaco).

## Visión general

| Capa | Tecnología |
|------|------------|
| Frontend | React (Vite), React Router, Axios |
| Backend | ASP.NET Core 8 (Web API), JWT Bearer |
| Base de datos | PostgreSQL |
| Orquestación local | Docker Compose |


---

## Estructura del repositorio

```
cemaco-platform/
├── docker-compose.yml          # Postgres + backend + frontend (Nginx)
├── .env                        # Variables locales (opcional; ver ejecución)
├── backend/
│   ├── Dockerfile
│   ├── CemacoPlatform.sln
│   └── src/
│       ├── CemacoPlatform.API/           # Controllers, Program.cs, middleware
│       ├── CemacoPlatform.Application/   # DTOs, interfaces 
│       ├── CemacoPlatform.Domain/        # Entidades, enums
│       └── CemacoPlatform.Infrastructure/ # EF Core, DbContext, JWT, DI
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                # SPA + archivos estáticos
    ├── package.json
    └── src/
        ├── pages/public/         # Catálogo
        ├── pages/admin/        # Login admin, dashboard, productos
        ├── components/
        ├── services/             # Cliente HTTP (Axios)
        └── context/              # AuthProvider + estado de sesión
```

---

## Arquitectura del backend

Separación en cuatro proyectos .NET:

1. **Domain** — Entidades (`User`, `Product`), enums (`UserRole`: Admin / Colaborador). 
2. **Application** — Contratos y DTOs (`LoginRequest`, `ProductDto`, `CreateProductRequest`), `IJwtTokenService`, registro `AddApplication()`.
3. **Infrastructure** — `AppDbContext` (EF Core), PostgreSQL, implementación de JWT (`JwtTokenService`), opciones `Jwt`, extensión `AddInfrastructure()`.
4. **API** — Controladores (`Auth`, `Productos`, `Upload`), autenticación/autorización, CORS, archivos estáticos de `/uploads`, middleware de errores, creación de BD y datos iniciales.

---

## Base de datos

- **Motor:** PostgreSQL (imagen `postgres:16-alpine`).
- **Acceso:** Entity Framework Core 8 con **Npgsql** (`UseNpgsql` + cadena `ConnectionStrings:DefaultConnection`).
- **Esquema:** tablas generadas a partir del modelo (`User`, `Product`).
- **Desarrollo local:** en entorno **Development**, la API usa `EnsureCreatedAsync()` y datos iniciales (usuarios demo).

---

## Autenticación y roles

- **Catálogo:** las rutas públicas (`/`) **no requieren login**.
- **Gestión:** `POST /api/auth/login` devuelve JWT con rol **`Admin`** o **`Colaborador`**.
- **Permisos:** 
**Administrador** — crear, actualizar y eliminar productos. 
**Colaborador** — crear y actualizar (sin eliminar). La subida de imágenes (`POST /api/upload/product-image`) está permitida para ambos roles de gestión.
- **Contraseñas:** BCrypt.

Usuarios de demo: `admin@cemaco.com` / `Admin123!` (Admin); `colaborador@cemaco.com` / `Colaborador123!` (Colaborador).

---

## Frontend

- **React + Vite:** catálogo público en `/`; gestión en `/admin/login`, `/admin`, `/admin/productos`
- **HTTP:** Axios con `baseURL` apuntando a `/api` (proxy en desarrollo) o a `VITE_API_BASE_URL` + `/api` en build (Docker usa `ARG VITE_API_BASE_URL`).
- **Sesión:** token JWT en `localStorage`, cabecera `Authorization: Bearer` vía `setAuthToken` en el cliente API.
- **Contenedor:** build estático + **Nginx** sirviendo `dist` y fallback SPA (`try_files` a `index.html`).

---

## Levantar el proyecto en local

### Requisitos previos

| Herramienta | Uso |
|-------------|-----|
| **Docker Desktop** (o Docker Engine + Compose plugin) | Opción recomendada: todo el stack en contenedores |
| **.NET 8 SDK** | Opción híbrida: API con `dotnet run` |
| **Node.js 18+** y **npm** | Opción híbrida: frontend con `npm run dev` |

---

### Levantar con Docker Compose

Levanta PostgreSQL, API (.NET) y frontend (Nginx con la SPA compilada).

1. Abrir una terminal en `cemaco-platform/`.
2. Revisa archivo `.env` para revisar variables locales; **Compose** inyecta la cadena de conexión y la clave JWT en `docker-compose.yml`.
3. Ejecutar:

   ```bash
   docker compose up --build
   ```

4. Espera a que se levanten los 3 containers.

**URLs:**

| Servicio | URL |
|----------|-----|
| Catálogo y panel (frontend) | [http://localhost:3000](http://localhost:3000) |
| API / Swagger (Development) | [http://localhost:8080/swagger](http://localhost:8080/swagger) |
| PostgreSQL | `localhost:5432` (usuario `postgres`, contraseña `postgres`, base `cemaco`) |


**Detener:** `Ctrl+C` o, en otra terminal, `docker compose down`.  
**Recrear la base desde cero**: `docker compose down -v` y luego `docker compose up --build` (borra el volumen de Postgres).

---
