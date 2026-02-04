# PROPOSAL PROYEK
## Sistem POS Terintegrasi untuk Food Court

---

## HALAMAN DEPAN

**PT. [Nama Perusahaan]**

**PROPOSAL PENGEMBANGAN SISTEM**

**Food Court Integrated POS System**

**Tanggal:** 3 Februari 2026  
**Dokumen:** PROPOSAL-FOODCOURT-POS-2026  
**Status:** Untuk Persetujuan  

---

## 1. EXECUTIVE SUMMARY

Kami mengusulkan pengembangan **Sistem POS Terintegrasi** untuk food court yang dapat mengelola lebih dari 30 tenant dengan pembayaran terpusat. Sistem ini dirancang untuk meningkatkan efisiensi operasional, mengurangi kesalahan transaksi, dan memberikan pengalaman pelanggan yang lebih baik.

### Highlights:
- ✅ **Centralized Payment System** - Pembayaran terpusat, tenant tidak langsung terima uang
- ✅ **Multi-Tenant Management** - Support hingga 30+ tenant dengan real-time order tracking
- ✅ **Flexible Revenue Sharing** - Otomatis perhitungan komisi untuk tenant, food court, dan developer
- ✅ **Real-time Notifications** - Notifikasi instant ke tenant, kasir, dan customer
- ✅ **Multiple Delivery Options** - Antar meja, ambil sendiri, alarm device, display TV, pengeras suara
- ✅ **Mobile-First Approach** - Android tablet untuk tenant, web untuk kasir, responsive web untuk customer

**Total Investasi:** Rp [X.XXX.XXX] (breakdown dalam section 6)  
**ROI Expected:** 12-18 bulan  
**Time to Market:** 3-4 bulan (development & testing)

---

## 2. LATAR BELAKANG & MASALAH

### 2.1 Current State (Masalah Existing)

Operasi food court saat ini menghadapi beberapa tantangan:

#### A. Pembayaran yang Tidak Terstruktur
- ❌ Setiap tenant mengelola pembayaran sendiri (error-prone)
- ❌ Sulit tracking total revenue food court
- ❌ Pembagian komisi sering manual & tidak akurat
- ❌ Risiko kehilangan uang / pencurian

#### B. Order Management yang Inefficient
- ❌ Pelanggan sering salah order atau lupa pesan ke tenant mana
- ❌ Tenant tidak tahu kapan customer datang ambil
- ❌ Tidak ada tracking real-time order status
- ❌ Customer experience buruk (menunggu lama tanpa tahu status)

#### C. Operations yang Kompleks
- ❌ Tidak ada visibility ke management tentang performance setiap tenant
- ❌ Sulit track peak hours, popular items, customer behavior
- ❌ Manual reporting = time-consuming & error-prone
- ❌ Skalabilitas terbatas dengan pertumbuhan tenant

#### D. Customer Experience
- ❌ Tidak ada sistem antrian yang jelas
- ❌ Customer bingung dimana tempat kasir
- ❌ Tidak tahu pesanan sudah siap atau belum
- ❌ Proses pembayaran yang tidak transparan

### 2.2 Impact Finansial

| Metrik | Estimasi | Impact |
|--------|----------|--------|
| **Waktu pembayaran per customer** | 5-10 menit | ❌ Customer churn |
| **Error rate transaksi** | 2-3% | ❌ Dispute, refund, reputation |
| **Revenue leakage** | 1-2% | ❌ Kerugian finansial |
| **Tenant churn** | 5-10% per tahun | ❌ Sulit cari tenant baru |
| **Customer satisfaction** | 60-70% | ❌ Low repeat rate |

---

## 3. SOLUSI YANG DITAWARKAN

### 3.1 Konsep Sistem

**Integrated Centralized POS System** dengan arsitektur:

```
Tenant (Input Order) 
    ↓ [Generate QR Code]
    ↓
Customer (Scan QR)
    ↓
Kasir (Scan QR, Process Payment)
    ↓ [Real-time Notification via Socket.io]
    ↓
Tenant (Prepare Order)
    ↓ [Ready Notification]
    ↓
Customer (Pickup/Dine-in)
    ↓
Revenue Auto-Calculated & Distributed
```

### 3.2 Core Features

#### A. Tenant Application (Android Tablet)
- **Input Pesanan** - Form mudah untuk order entry
- **QR Generation** - Automatic unique QR per order
- **Print/Display QR** - Opsi print atau display ke customer
- **Real-time Paid Notification** - Instant alert ketika customer bayar
- **Order Management** - Status tracking (pending → paid → preparing → ready)
- **PIN Login** - Secure authentication

#### B. Kasir Application (Web/Tablet)
- **QR Scanner** - Scan order dari customer
- **Payment Processing** - Flexible payment methods (cash, card, e-wallet, QRIS)
- **Transaction Management** - History, refund, adjustment
- **Multi-Counter Support** - 1 kasir per counter, scalable to 3 per counter
- **PIN Login** - Simple but secure
- **Real-time Dashboard** - Transaction overview

#### C. Customer Experience
- **QR Order Tracking** - Scan/input order number untuk lihat status
- **Real-time Status** - Waiting → Ready → Completed
- **Display Monitor Integration** - Lihat nomor antrian di TV
- **Notification Options** - Alert via device, alarm, TV announcement

#### D. Management Dashboard
- **Real-time Analytics** - Order volume, revenue, peak hours
- **Tenant Performance** - Top sellers, rating, revenue per tenant
- **Payment Reports** - Daily/weekly/monthly settlement
- **Revenue Sharing** - Auto-calculation & distribution to tenant
- **Inventory Tracking** - (Optional future)

---

## 4. BENEFITS & EXPECTED OUTCOMES

### 4.1 Finansial Benefits

| Benefit | Estimasi | Tahun 1 |
|---------|----------|---------|
| **Reduce Revenue Leakage** | 1-2% of total revenue | Rp [XX.XXX.XXX] |
| **Reduce Operational Cost** | Hemat 2 staff kasir | Rp [X.XXX.XXX] |
| **Increase Transaction Speed** | Dari 5-10 min → 2-3 min | 40% faster checkout |
| **Increase Customer Throughput** | 30-50% more customers/hour | Rp [XX.XXX.XXX] more revenue |
| **Reduce Tenant Disputes** | 0.5% less chargebacks | Rp [X.XXX.XXX] |
| **Commission Revenue** | 1% developer fee per transaction | Rp [XX.XXX.XXX] |

**Total Estimated Year 1 Benefit: Rp [XXX.XXX.XXX] - [XXX.XXX.XXX]**

### 4.2 Operational Benefits

✅ **Transparency** - Semua transaksi tercatat digital & transparent  
✅ **Accountability** - Setiap tenant bisa lihat komisi mereka real-time  
✅ **Scalability** - Mudah add tenant baru tanpa upgrade sistem  
✅ **Automation** - Revenue sharing otomatis calculated  
✅ **Reporting** - Analytics & reports otomatis generate  
✅ **Support** - Dedicated technical support team

### 4.3 Customer Experience Benefits

✅ **Faster Checkout** - 2-3 menit vs 5-10 menit sebelumnya  
✅ **Clear Status** - Real-time order status visibility  
✅ **Multiple Notification** - SMS, app, TV display, alarm device  
✅ **Convenient** - Scan QR pakai smartphone, tidak perlu kupon fisik  
✅ **Transparent Pricing** - Lihat detail order & harga sebelum bayar  

### 4.4 Tenant Benefits

✅ **Instant Payment Notification** - Tahu langsung order sudah dibayar  
✅ **Better Customer Service** - Bisa manage waiting time  
✅ **Higher Revenue** - Lebih banyak customers karena faster service  
✅ **Financial Transparency** - Real-time commission tracking  
✅ **Reduced Disputes** - Semua tercatat digital  

---

## 5. DETAIL TEKNIS & TIMELINE

### 5.1 Technology Stack

**Backend:**
- Node.js + Express.js (production-ready, scalable)
- PostgreSQL (ACID compliance, financial data integrity)
- Socket.io (real-time notifications)
- JWT + bcrypt (secure authentication)

**Frontend - Tenant:**
- React Native (Android tablet)
- Offline-first with local caching

**Frontend - Kasir & Display:**
- React.js + Vite (fast, responsive)
- PWA capability

**Deployment:**
- Docker containerization
- AWS/Digital Ocean/Local VPS
- 99.5% uptime SLA

### 5.2 Development Timeline

```
PHASE 1: Planning & Setup (Week 1-2)
├── Detailed requirement gathering
├── Database design & finalization
├── API specification
└── Dev environment setup

PHASE 2: Backend Development (Week 3-6)
├── Authentication system
├── Core APIs (Order, Payment, QR)
├── Notification service (Socket.io)
├── Revenue sharing logic
└── Database & migrations

PHASE 3: Frontend Development (Week 7-10)
├── Tenant App (React Native)
├── Kasir App (React.js)
├── Customer App (React.js)
└── Display Monitor

PHASE 4: Integration & Testing (Week 11-12)
├── End-to-end testing
├── Performance testing
├── Security testing
├── UAT with stakeholders

PHASE 5: Deployment & Training (Week 13-14)
├── Production deployment
├── Staff training
├── Go-live support
└── Handover to maintenance team

Total Timeline: 3-4 months
```

### 5.3 Project Phases & Deliverables

#### Phase 1: Setup & Planning
**Duration:** 2 minggu  
**Deliverables:**
- [ ] Detailed requirement document
- [ ] Database schema finalized
- [ ] API specification (Swagger/OpenAPI)
- [ ] Dev environment ready (Docker)
- [ ] Git repository setup

#### Phase 2: Backend Development
**Duration:** 4 minggu  
**Deliverables:**
- [ ] Authentication APIs (login, PIN verification)
- [ ] Order management APIs (CRUD)
- [ ] Payment processing APIs
- [ ] QR code generation & validation
- [ ] Real-time notification system
- [ ] Revenue sharing calculation
- [ ] Reporting APIs
- [ ] Admin panel backend
- [ ] Database migrations & seed data

#### Phase 3: Frontend Development
**Duration:** 4 minggu  
**Deliverables:**
- [ ] Tenant App (Android) - fully functional
- [ ] Kasir App (Web) - fully functional
- [ ] Customer App (Web) - fully functional
- [ ] Display Monitor Dashboard
- [ ] Admin Dashboard
- [ ] QR scanner integration
- [ ] Push notification integration

#### Phase 4: Integration & Testing
**Duration:** 2 minggu  
**Deliverables:**
- [ ] End-to-end testing report
- [ ] Performance testing report (load testing)
- [ ] Security testing report (penetration testing)
- [ ] UAT sign-off from business team
- [ ] Bug fixes & optimization
- [ ] Production readiness checklist

#### Phase 5: Deployment & Training
**Duration:** 1-2 minggu  
**Deliverables:**
- [ ] Production deployment completed
- [ ] Staff training materials
- [ ] User manual & documentation
- [ ] 24/7 support setup
- [ ] Go-live successful
- [ ] Monitoring & alerting setup

---

## 6. INVESTASI & BUDGET

### 6.1 Development Cost

| Item | Cost | Qty | Total |
|------|------|-----|-------|
| **Senior Backend Developer** | Rp 30.000.000 | 1 | Rp 30.000.000 |
| **Frontend Developer (React Native)** | Rp 25.000.000 | 1 | Rp 25.000.000 |
| **Frontend Developer (React.js)** | Rp 25.000.000 | 2 | Rp 50.000.000 |
| **QA / Testing Engineer** | Rp 15.000.000 | 1 | Rp 15.000.000 |
| **Project Manager / Scrum Master** | Rp 20.000.000 | 1 | Rp 20.000.000 |
| **UI/UX Designer** | Rp 15.000.000 | 1 | Rp 15.000.000 |
| **DevOps / Infrastructure** | Rp 10.000.000 | 1 | Rp 10.000.000 |
| | | **SUBTOTAL** | **Rp 165.000.000** |

### 6.2 Hardware & Infrastructure Cost

| Item | Cost | Qty | Total |
|------|------|-----|-------|
| **Android Tablets (Tenant)** | Rp 3.000.000 | 35 | Rp 105.000.000 |
| **Kasir PCs/Tablets** | Rp 5.000.000 | 3 | Rp 15.000.000 |
| **Display Monitor (TV)** | Rp 2.000.000 | 2 | Rp 4.000.000 |
| **Portable Device / Alarm** | Rp 500.000 | 35 | Rp 17.500.000 |
| **Network Infrastructure** | Rp 10.000.000 | 1 | Rp 10.000.000 |
| **Server & Database** | Rp 5.000.000/mo | 12 | Rp 60.000.000 |
| **Networking & Setup** | Rp 10.000.000 | 1 | Rp 10.000.000 |
| | | **SUBTOTAL** | **Rp 221.500.000** |

### 6.3 Ongoing Cost (Year 1)

| Item | Monthly | Yearly |
|------|---------|--------|
| **Server Hosting & Maintenance** | Rp 5.000.000 | Rp 60.000.000 |
| **Support & Maintenance Team** | Rp 10.000.000 | Rp 120.000.000 |
| **Backup & Disaster Recovery** | Rp 1.000.000 | Rp 12.000.000 |
| **License & Third-party APIs** | Rp 2.000.000 | Rp 24.000.000 |
| **Training & Documentation** | Rp 2.000.000 | Rp 24.000.000 |
| | **TOTAL** | **Rp 240.000.000** |

### 6.4 Summary Budget

| Category | Amount |
|----------|--------|
| **Development Cost** | Rp 165.000.000 |
| **Hardware & Infrastructure** | Rp 221.500.000 |
| **Year 1 Operational Cost** | Rp 240.000.000 |
| **TOTAL YEAR 1 INVESTMENT** | **Rp 626.500.000** |
| **Year 2+ Operational Cost (Per Year)** | **Rp 180.000.000** |

### 6.5 ROI Calculation

**Assumptions:**
- Average daily transactions: 300-500
- Average transaction value: Rp 150.000
- Daily revenue: Rp 45.000.000 - Rp 75.000.000
- Monthly revenue: Rp 1.350.000.000 - Rp 2.250.000.000

**Benefits (Conservative Estimate):**

**Year 1:**
- Reduce revenue leakage (1%): Rp 162.000.000
- Reduce operational cost (2 staff): Rp 240.000.000
- Increase throughput (30%): Rp 486.000.000
- Commission revenue (1%): Rp 162.000.000
- **Total Year 1 Benefit: Rp 1.050.000.000**

**Net Profit Year 1:**
- Total Benefit: Rp 1.050.000.000
- Total Investment: Rp 626.500.000
- **Net Profit: Rp 423.500.000**
- **ROI: 67.5% (Year 1)**

**Payback Period: 7-8 months**

---

## 7. RISKS & MITIGATION STRATEGY

### 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **System downtime** | Medium | High | 99.5% SLA, redundant infrastructure, automated failover |
| **Data loss** | Low | Critical | Daily automated backup, disaster recovery plan |
| **Security breach** | Low | Critical | Penetration testing, SSL/TLS encryption, secure coding practices |
| **Performance issues** | Medium | High | Load testing, caching strategy, database optimization |
| **Integration issues** | Medium | Medium | Early integration testing, API mocking, extensive documentation |

### 7.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Staff resistance** | Medium | Medium | Early change management, comprehensive training, support team |
| **Tenant adoption** | Medium | Medium | Easy-to-use interface, on-site training, responsive support |
| **Customer confusion** | Low | Medium | Clear signage, customer education, help desk support |
| **Revenue accuracy issues** | Low | High | Automated reconciliation, regular audits, clear reporting |

### 7.3 Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **Scope creep** | High | High | Strict change management, phased approach, clear requirements |
| **Talent shortage** | Medium | High | Early hiring, outsourcing if needed, knowledge transfer |
| **Testing delays** | Medium | Medium | Automated testing, parallel testing, clear test strategy |

---

## 8. SUCCESS METRICS & KPIs

### 8.1 Business KPIs

| KPI | Target | Baseline | Success Criteria |
|-----|--------|----------|------------------|
| **Transaction Speed** | 2-3 min | 5-10 min | ✅ 50% reduction |
| **Customer Satisfaction** | 85%+ | 60-70% | ✅ 20+ point increase |
| **Revenue Leakage** | <0.5% | 1-2% | ✅ 75% reduction |
| **Tenant Retention** | 95%+ | 90% | ✅ 5+ point increase |
| **System Uptime** | 99.5% | N/A | ✅ Consistent uptime |
| **Daily Transactions** | 350+ | 300-500 | ✅ 20-30% increase |

### 8.2 Operational KPIs

| KPI | Target | Success Criteria |
|-----|--------|------------------|
| **Staff Training Completion** | 100% | ✅ All staff trained within 2 weeks |
| **Bug Resolution Time** | <24 hours | ✅ Critical bugs fixed same day |
| **System Performance** | <1s response time | ✅ 99% API calls <1s |
| **Data Accuracy** | 99.9% | ✅ Regular reconciliation pass |

### 8.3 Financial KPIs

| KPI | Target | Year 1 | Year 2+ |
|-----|--------|--------|---------|
| **ROI** | >50% | 67.5% | 450%+ |
| **Payback Period** | <12 months | 7-8 months | N/A |
| **Cost Reduction** | 30% | 30% (operational) | 30% |
| **Revenue Increase** | 20%+ | 20-30% | 5-10% |

---

## 9. IMPLEMENTASI & GOVERNANCE

### 9.1 Project Governance

**Project Sponsor:** [Owner Name]  
**Project Manager:** [To be assigned]  
**Steering Committee:** Owner, Pengelola, Technical Lead  

**Decision Authority:**
- Scope changes > Rp 10.000.000: Owner approval
- Timeline changes: PM + Sponsor
- Budget changes: Sponsor + CFO

### 9.2 Stakeholders

| Stakeholder | Role | Responsibility |
|-------------|------|-----------------|
| **Owner** | Sponsor | Approve budget, scope, timeline |
| **Pengelola** | Business Owner | Requirement gathering, UAT, training |
| **Kasir Staff** | End User | Testing, training, feedback |
| **Tenant** | End User | Testing, training, adoption |
| **IT Team** | Support | Infrastructure, security, maintenance |
| **Development Team** | Vendor | Development, testing, deployment |

### 9.3 Communication Plan

| Audience | Frequency | Format | Owner |
|----------|-----------|--------|-------|
| **Steering Committee** | Weekly | Meeting + Report | PM |
| **Business Team** | Bi-weekly | Status meeting | PM |
| **Development Team** | Daily | Stand-up | Tech Lead |
| **All Stakeholders** | Monthly | Executive summary | PM |

---

## 10. NEXT STEPS & REKOMENDASI

### 10.1 Immediate Actions (If Approved)

1. **Week 1-2:**
   - Form project team
   - Schedule kick-off meeting
   - Finalize requirements dengan semua stakeholders
   - Create detailed project plan

2. **Week 2-3:**
   - Procure hardware (tablets, PCs, monitors)
   - Setup development environment
   - Begin Phase 1 (Planning & Setup)

3. **Month 2-3:**
   - Backend development starts
   - Design database schema
   - Frontend planning

### 10.2 Rekomendasi

✅ **Approve project** dengan timeline 3-4 bulan  
✅ **Allocate budget** Rp 626.500.000 untuk Year 1  
✅ **Form project team** dengan experienced personnel  
✅ **Set clear success criteria** dan tracking mechanism  
✅ **Establish governance** dan decision-making process  
✅ **Plan change management** untuk staff & tenant  

---

## 11. APPENDIX

### A. Detailed Use Cases

**Scenario 1: Happy Path (Normal Order)**
1. Customer orders di Tenant A
2. Tenant input order → QR generated
3. Customer scan QR di kasir
4. Kasir process payment
5. Notification to tenant
6. Tenant prepare & deliver
7. Order completed

**Scenario 2: Alternative Payment (Pay Later)**
1. Customer orders → Generate QR
2. Customer dine-in → Mark as dine-in
3. After meal, customer scan QR di table
4. Kasir scan & process payment
5. Same flow as above

**Scenario 3: Multiple Items dari Multiple Tenant**
1. Customer order dari Tenant A, B, C
2. Generate 3 QR codes (atau 1 QR dengan multiple items)
3. Kasir scan 1 QR → show all items from all tenants
4. Process 1 payment untuk semua
5. Revenue auto-split ke setiap tenant

### B. Security Considerations

- PIN hashing (bcrypt)
- HTTPS encryption
- JWT token authentication
- CORS configuration
- SQL injection prevention
- XSS protection
- Rate limiting

### C. Compliance & Regulation

- PCI-DSS (jika ada payment card)
- Data privacy (GDPR-like requirements)
- Financial reporting standards
- Audit trail untuk semua transaksi

### D. Support & Maintenance

**Year 1-3:**
- Dedicated support team (2-3 people)
- 24/7 hotline support
- Monthly maintenance window
- Quarterly feature updates

**Year 3+:**
- Transition to internal team
- Knowledge transfer program
- Maintenance only mode

---

## KESIMPULAN

Sistem POS Terintegrasi ini adalah investasi strategis yang akan:
- ✅ Meningkatkan revenue 20-30% dalam tahun pertama
- ✅ Mengurangi operational cost 30%
- ✅ Payback dalam 7-8 bulan
- ✅ Memberikan competitive advantage di market

Dengan ROI 67.5% dan payback period yang singkat, ini adalah keputusan bisnis yang solid.

**Kami siap untuk memulai implementasi segera setelah approval.**

---

**Dokumen ini disiapkan oleh:** [Your Name]  
**Tanggal:** 3 Februari 2026  
**Status:** Untuk Persetujuan Owner

---

*Lampiran: Detailed Technical Specification tersedia dalam file terpisah*  
*Lampiran: Cost Breakdown & Financial Projection tersedia dalam spreadsheet terpisah*  
*Lampiran: Architecture Diagram tersedia dalam ARCHITECTURE.md*
