# 🌱 EcoThread

> **Sustainable Circular Fashion & NGO Clothing Redistribution Platform**  
> *Home Pickup Scheduler • Garment QC Grading Workstation • Amazon-Style Beneficiary Catalog • Zero-Cost Tokenized Checkout • Automated 80G Tax Exemption PDF Generation*

EcoThread directly tackles textile waste, landfill saturation, and clothing poverty by aligning with **UN Sustainable Development Goals (SDG 12: Responsible Consumption, SDG 1: No Poverty, SDG 13: Climate Action)**.

---

## 🏛️ System Architecture

The project is structured into two decoupled subdirectories:

```
EcoThread/
├── backend/                       # Spring Boot 3.3.x (Java 21, Maven Wrapper)
│   ├── src/main/java/com/ecothread/
│   │   ├── config/                # Spring Security 6, JWT Filter, CORS, OpenAPI Swagger
│   │   ├── controller/            # REST Endpoints (/auth, /pickups, /catalog, /admin, /orders, /invoices, /impact)
│   │   ├── data/                  # DataInitializer (pre-seeded users, pickups, catalog, 80G invoice)
│   │   ├── dto/                   # Request/Response Data Transfer Objects
│   │   ├── model/                 # JPA Entities (User, Address, PickupRequest, InventoryItem, BeneficiaryOrder, DonationInvoice)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   └── service/               # OpenPDF 80G generator, Pickup, Inventory, Order & Impact services
│   └── src/main/resources/
│       ├── application.properties # H2 in-memory dev profile (zero-config startup)
│       └── application-prod.properties # PostgreSQL switchable production profile
│
└── frontend/                      # React 19 + Vite + Tailwind CSS + Lucide Icons
    ├── src/
    │   ├── components/            # Navbar, RoleSwitcher, LoginModal, Footer
    │   ├── context/               # AuthContext with 1-click Demo Persona Switcher & Cart state
    │   ├── pages/
    │   │   ├── donor/             # DonorPortal & Doorstep PickupSchedulerModal with 80G PDF downloader
    │   │   ├── beneficiary/       # Amazon-style BeneficiaryStore, ProductCard, CartDrawer & Orders
    │   │   ├── admin/             # Warehouse QC Grading Workstation & Order Dispatch Controls
    │   │   └── logistics/         # Driver Route Dispatch & doorstep bag count verification
    │   └── services/              # Axios API layer with JWT interceptors
```

---

## 🚀 Quick Start Guide

### One-Command Launch (Backend + Frontend)

Simply run the executable launcher script from the root directory:

```bash
./run.sh
```

This script automatically:
- Detects and exports OpenJDK 21
- Verifies Node.js & npm dependencies
- Starts the Spring Boot backend on `http://localhost:8080`
- Starts the Vite frontend dev server on `http://localhost:5173`
- Handles graceful shutdown of both servers on `Ctrl+C`

---

### Manual Individual Commands

#### 1. Run the Spring Boot Backend

```bash
cd backend
# Run via Maven wrapper
./mvnw spring-boot:run
```

- **Backend API**: `http://localhost:8080`
- **H2 Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:ecothreaddb`, User: `sa`, Password: *(empty)*)
- **Interactive Swagger / OpenAPI UI**: `http://localhost:8080/swagger-ui/index.html`
- **Raw OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

### 2. Run the Vite Frontend

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

---

## 👥 Preloaded Demo Credentials

The platform seeds sample accounts for all 4 roles so you can verify each workflow instantly using the **Top Role Switcher** or standard login:

| Role | Email | Password | Persona & Capabilities |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@ecothread.org` | `password123` | **Aarav Sharma**: Schedule doorstep pickups, track status steps, view personal water/carbon offsets, and download Section 80G Tax Receipts. |
| **Beneficiary** | `beneficiary@ecothread.org` | `password123` | **Priya Kumari**: **150 seasonal credits balance**, browse Amazon-style catalog, apply demographic/size/season filters, and checkout at zero cost. |
| **Logistics Driver** | `driver@ecothread.org` | `password123` | **Ramesh Kumar**: View assigned doorstep collection routes, verify bag count, and transition status to `PICKED_UP` and `DELIVERED_TO_HUB`. |
| **Warehouse Admin** | `admin@ecothread.org` | `password123` | **Neha**: Grade incoming garments (**Grade A** -> Store Catalog, **Grade B** -> Bulk NGO Aid, **Recycle** -> Fiber Spinning), and advance order dispatch status. |

---

## 🌟 Key Application Features

### 1. Donor Portal & Doorstep Collection
- **Doorstep Pickup Scheduler**: Select calendar date, time slot (Morning, Midday, Evening), bag count, garment types, and address.
- **Pickup Rescheduling & Cancellation**: Donors can reschedule date/time slot or cancel pending pickups with automated driver route updates.
- **Interactive Live Eco-Impact Calculator**: Dynamic simulator calculating real-time fresh water conserved (Liters), CO₂ avoided (Kg), urban tree absorption equivalents, and indicative Section 80G tax deductions with 1-click pickup prefill.
- **Official 80G Tax Exemption PDF**: One-click download streaming a high-resolution, branded PDF certificate generated via OpenPDF with organization registration numbers, digital seal, and donation breakdown.
- **Public 80G Certificate Verification**: Public registry tool (`/api/invoices/verify/{number}`) allowing tax authorities or donors to verify cryptographic authenticity and donation breakdown.

### 2. Amazon-Style Beneficiary Store
- **Multi-Attribute Filters & Sorting**: Filter by demographic (*Men, Women, Kids*), size (*XS, S, M, L, XL*), season (*Winter, Summer, Monsoon*), and sort by credit cost or title.
- **Garment Quick-View & Sanitization Log**: Inspection modal detailing 3-step hospital-grade UV-C sterilization and fabric care guidelines.
- **Zero-Cost Tokenized Checkout**: Slide-over cart drawer validating seasonal NGO credits with festive celebration confetti.
- **Order Tracking**: Visual status progression: `ORDERED` ➔ `DISPATCHED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.

### 3. Warehouse QC & Admin Hub
- **Scientific Sorting Interface**:
  - **Grade A**: Prime condition -> Automatically published to online Beneficiary Store.
  - **Grade B**: Good condition with minor wear -> Routed to Bulk NGO Disaster Relief and Slum Community Aid drives.
  - **Recycle / Downcycling**: Frayed or torn fabrics -> Routed to industrial textile shredders for automotive insulation.
- **Beneficiary Quota Management**: Admin workstation to allocate seasonal winter quotas (+50 credits) and emergency disaster relief allowances (+100 credits).
- **ESG Sustainability & Circularity Report**: Real-time Circularity Rate gauge (`91.5%+`), UN SDG alignment metrics (SDG 12, SDG 1, SDG 13), and CSV export.

### 4. Logistics Fleet Dispatch
- **Cluster Pickups**: Filter pickup route tasks by pincode clusters and execution statuses.
- **Doorstep Verification**: Verify collected bags and weight before transitioning statuses to `PICKED_UP`, `DELIVERED_TO_HUB`, and issuing 80G certificates.

---

## 🧪 Verification & Testing

### Backend Unit & Integration Tests
```bash
cd backend
JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./mvnw test
```
*Executes Spring context loading tests, PDF byte validation, pickup reschedule/cancellation, 80G verification, and ESG sustainability calculations.*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Builds production assets with Vite & Tailwind CSS.*

---

## 📄 License
EcoThread is licensed under the Apache 2.0 License.
