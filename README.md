# TaskPulse — Online Professional Work & Digital Services Platform

> A full-stack managed digital services platform connecting customers (businesses, employees, job seekers, researchers, and students) with verified freelance workers through a centralized Administrator Quality-Check (QC) and Escrow system.

---

## 🌟 Key Features

* **Managed Marketplace & Quality Gate**: Unlike open freelance sites, all worker submissions must pass an **Admin Quality Check (QC)** before release to the customer.
* **16-State Order Lifecycle**: Conflict-free state machine governing quotations, payments, assignments, submissions, revisions, and completions.
* **12 Comprehensive Service Categories**:
  1. Academic Support & Proofreading
  2. Microsoft Word Services & Typesetting
  3. Microsoft Excel Modeling & Data Cleaning
  4. PowerPoint Pitch Decks & Slide Redesign
  5. ATS-Optimized CV & Career Documents
  6. Research & Documentation
  7. Programming & IT Tasks (Python, Automation, Bug Fixes)
  8. Graphic & Digital Design
  9. PDF Conversion & OCR Form Recovery
  10. Data Entry & Virtual Administration
  11. Business Reports & Proposals
  12. Custom & Bespoke Requests
* **Dynamic Requirement Forms**: Flexible JSON schemas per service category that collect specific parameters (e.g., target role for CV, row count for Excel, slide count for PPT).
* **Escrow Financial Engine**: 80/20 worker payout and platform commission splitting, PayHere MD5 signature verification, and simulated sandbox payment.
* **Secure File Vault**: Categorized tags (`CUSTOMER_ORIGINAL`, `WORKER_DRAFT`, `FINAL_DELIVERABLE`), size/MIME validation, and authenticated streaming downloads.
* **Role-Based Portals**:
  * **Customer Portal**: Create orders, review quotations, pay via escrow, download files, request revisions, and rate workers.
  * **Worker Workspace**: Accept/decline task offers, track active jobs, upload deliverables for Admin QC, and track wallet earnings.
  * **Admin Control Center**: Live platform revenue/profit stats, master orders table, quotation builder, specialist dispatcher, and worker approvals.
* **Quick Role Switcher Ribbon**: 1-click test credential switching in the top navigation bar.

---

## 🛠️ Technology Stack

* **Backend API**: Node.js, Express.js, TypeScript
* **Database & ORM**: PostgreSQL / SQLite via Prisma ORM
* **Frontend Web App**: React 18, Vite, TypeScript
* **Styling**: Handcrafted Modern Vanilla CSS Design Tokens (Dark-slate theme, glassmorphism, responsive grid)
* **Authentication**: JWT with bcrypt password hashing
* **Payment Integration**: PayHere Checkout Sandbox (Sri Lanka LKR & International Cards)

---

## 📂 Repository Structure

```text
Digital Services Platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # 14 normalized database models
│   │   └── seed.ts              # Seeds 12 categories, services, and accounts
│   ├── src/
│   │   ├── controllers/         # Auth, Orders, Services, Assignments, Payments, Admin
│   │   ├── middleware/          # JWT auth, role guards, Multer upload security
│   │   ├── routes/              # Modular Express routes
│   │   ├── utils/               # PayHere MD5 hash, Prisma client
│   │   └── server.ts            # Express server bootstrap
│   ├── .env.example             # Safe environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Modals (NewOrder, OrderDetails, Auth)
│   │   ├── context/             # AuthContext with 1-click demo switcher
│   │   ├── pages/
│   │   │   ├── public/          # LandingPage, ServiceCatalogPage
│   │   │   ├── customer/        # CustomerPortal
│   │   │   ├── worker/          # WorkerWorkspace
│   │   │   └── admin/           # AdminControlCenter
│   │   └── styles/              # Design tokens (variables.css, global.css, components.css)
│   ├── index.html
│   └── package.json
│
├── .gitignore                   # Multi-tier exclusion for node_modules, envs, dbs
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js** v18+ (Tested on v22.15.1)
* **npm** v9+

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Generate Prisma client and create database tables
npx prisma db push

# Seed 12 service categories, sample packages, and test accounts
npx ts-node-dev prisma/seed.ts

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 👥 Demo Test Accounts

The platform includes a **Quick Role Switcher Ribbon** at the top of the interface for 1-click instant login:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@taskpulse.lk` | `Admin@12345` | Quotation builder, Worker assignment, QC approval gate, Financial analytics |
| **Customer** | `customer@example.com` | `Customer@12345` | Order placement, PayHere payment, File downloads, Revisions, Reviews |
| **Worker** | `worker@example.com` | `Worker@12345` | Task acceptance, Deliverable upload for QC, Wallet earnings |

---

## 📄 License
This project is licensed under the MIT License.
