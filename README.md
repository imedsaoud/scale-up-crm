# 🚀 SCALE UP CRM 2024

## 🌟 Introduction

Scale Up CRM 2024 est une solution de gestion de la relation client,conçue pour offrir une configurabilité et une extensibilité maximales. Ce CRM modulaire et performant est idéal pour les micro-entreprise TPE/PME qui souhaitent optimiser leurs interactions clients pas à pas, tout en bénéficiant d'un système robuste et sécurisé. Grâce à une architecture moderne et à une intégration continue, Scale Up CRM 2024 garantit une expérience utilisateur fluide et une maintenance aisée.

## 🛠️ Getting Started

### Step 1: 🚀 Initial Setup

- Clone the repository: `git clone https://github.com/imedsaoud/scale-up-crm.git`
- Navigate: `cd scale-up-crm`
- Install dependencies: `npm ci`

### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `npm run dev`
- Building: `npm run build`
- Production Mode: Set `.env` to `NODE_ENV="production"` then `npm run build && npm run start`
  
## 🚀 Back-end

- 📁 Modular Structure: Organized by feature for easy navigation and scalability.
- 💨 Faster Execution with tsx: Rapid TypeScript execution with esbuild, complemented by tsc for type checking.
- 🌐 Stable Node Environment: Latest LTS from 27/05/2024 Node v20  version in .nvmrc.
- 🔧 Simplified Environment Variables with Envalid: Centralized and easy-to-manage configuration.
- 🔗 Path Aliases: Cleaner code with shortcut imports.
- 🔄 Dependabot Integration: Automatic updates for secure and up-to-date dependencies.
- 🔒 Security: Helmet for HTTP header security and CORS setup.
- 📊 Logging: Efficient logging with pino-http.
- 🧪 Comprehensive Testing: Robust setup with Vitest and Supertest.
- 🔑 Code Quality Assurance: Husky and lint-staged for consistent quality.
- ✅ Unified Code Style: ESLint and Prettier for a consistent coding standard.
- 📃 API Response Standardization: ServiceResponse class for consistent API responses.
- 🐳 Docker Support: Ready for containerization and deployment.
- 📝 Input Validation with Zod: Strongly typed request validation using Zod.
- 🧩 API Spec Generation: Automated OpenAPI specification generation from Zod schemas to ensure up-to-date and accurate API documentation.

## 📁 Backend Structure

```
.
scale-up-crm/
│
├── dist/
├── node_modules/
├── server/
│ ├── core/
│ │ ├── config/
│ │ ├── constants/
│ │ ├── errors/
│ │ ├── types/
│ │ └── utils/
│ ├── features/
│ │ ├── shared/
│ │ │ ├── domain/
│ │ │ │ ├── dtos/
│ │ │ │ ├── entities/
│ │ │ │ └── value-objects/
│ │ │ └── presentation/
│ │ │ ├── middlewares/
│ │ │ └── validators/
│ │ │
│ │ ├── crm/
│ │ │ ├── domain/
│ │ │ │ ├── datasources/
│ │ │ │ ├── dtos/
│ │ │ │ ├── entities/
│ │ │ │ ├── repositories/
│ │ │ │ ├── services/
│ │ │ │ └── usecases/
│ │ │ │
│ │ │ ├── infrastructure/
│ │ │ │ ├── datasource/
│ │ │ │ ├── repository/
│ │ │ │ └── services/
│ │ │ │
│ │ │ └── presentation/
│ │ │ ├── controllers/
│ │ │ ├── routes/
│ │ │ └── validators/
│ │ └── ...
│ ├── app.test.ts
│ ├── app.ts
│ ├── routes.ts
│ ├── server.ts
│ └── testServer.ts
├── .env
├── .env.template
├── .env.test
├── ...
├── package.json
└── ...

```

## 🚀 Front-end



🎉 Happy coding!
