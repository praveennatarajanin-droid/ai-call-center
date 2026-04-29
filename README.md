# AI-Powered Smart Call Centre Automation System

## Architecture Overview

This project is divided into a Node.js backend using Express and Prisma ORM, and a modern React (Vite) frontend with TailwindCSS.

### 🗄️ Database Schema
We utilized SQLite (easily swappable to PostgreSQL or MySQL via `prisma/schema.prisma`) with the following models:
- **User**: Stores CRM records with `type` (NEW / EXISTING), phone, and name.
- **CallLog**: Logs every automated call simulation, linking to the user, with intent and duration.
- **Package**: Contains services info like pricing and description.
- **Payment**: Tracks payments.
- **Interaction**: Chat history between user and AI.

### ⚙️ Backend (Port 5000)
- **Framework:** Express + TypeScript
- **ORM:** Prisma
- **Key Endpoints:**
  - `GET /api/users` - Fetches CRM data
  - `GET /api/calls` - Fetches call history
  - `GET /api/analytics` - Provides stats for the dashboard charts
  - `POST /api/call/incoming` - Processes simulated calls, detects intent (package_inquiry, payment_issue, etc.), checks new vs existing user logic, and logs the call.

### 💻 Frontend (Port 5173)
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (Dark SaaS theme)
- **Components:** Recharts for dynamic analytics, Lucide React for modern iconography.
- **Pages:**
  1. **Dashboard:** High-level metrics, call volume trends, real-time AI action logs.
  2. **Call Logs:** Searchable datatable showing intent, duration, and status.
  3. **Customers:** CRM View showing user profiles, last payment status, and join date.
  4. **Analytics:** Deep dive charts for intent distribution and peak hourly volume.
  5. **Simulator:** An interactive playground where you can trigger the AI call pipeline with dummy voice text, watch the logic detect intent, and create new leads or respond to existing customers.

## Folder Structure

```
d:\projects\Ai based call\
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # DB Models
│   │   └── dev.db             # Local Database
│   ├── src/
│   │   ├── index.ts           # Express API Server
│   │   └── seed.ts            # Dummy Data Seeder
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CallLogs.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Simulator.tsx
│   │   ├── App.tsx            # Main Layout (Sidebar/Navigation)
│   │   ├── index.css          # Tailwind Directives & Custom Scrollbar
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
```

## How to use

1. **Both servers are currently running in the background!**
2. **Access the Frontend**: Go to [http://localhost:5173](http://localhost:5173) in your browser.
3. Use the **Simulator** tab to test out the logic. Try typing:
   - *"I want to know about your basic package"*
   - *"I have a payment issue"*
   - Observe how it detects intent and logs the call in the **Call Logs** tab!
