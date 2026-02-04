# DOKUMENTASI CARA KERJA SISTEM POS FOOD COURT
## User Manual & Operating Procedures

---

## DAFTAR ISI

1. [Overview Sistem](#overview-sistem)
2. [Panduan untuk Tenant](#panduan-untuk-tenant)
3. [Panduan untuk Kasir](#panduan-untuk-kasir)
4. [Panduan untuk Customer](#panduan-untuk-customer)
5. [Panduan Display Monitor](#panduan-display-monitor)
6. [Panduan Admin/Pengelola](#panduan-adminpengelola)
7. [Skenario & Use Cases](#skenario--use-cases)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## OVERVIEW SISTEM

### Bagaimana Sistem Bekerja?

```
ALUR LENGKAP TRANSAKSI:

1. TENANT TAHAP (10 menit sebelum customer sampai ke kasir)
   ├─ Customer datang ke tenant
   ├─ Tenant input detail pesanan di tablet
   └─ Sistem auto-generate QR code UNIK

2. CUSTOMER TAHAP (Customer bawa QR ke kasir)
   ├─ Customer scan QR pakai smartphone
   ├─ Lihat detail order & total harga
   └─ Pergi ke kasir dengan QR (print atau foto)

3. KASIR TAHAP (2-3 menit)
   ├─ Customer tunjukkan QR (print/foto) ke kasir
   ├─ Kasir scan QR dengan scanner/tablet
   ├─ Sistem tampilkan detail order & total
   ├─ Customer lihat list item dan confirm total
   ├─ Kasir process pembayaran (cash/card/e-wallet)
   └─ Payment successful ✅

4. TENANT NOTIFIKASI (Instant)
   ├─ Tenant terima real-time notification
   ├─ Terdengar alarm/notification di tablet
   ├─ Status order berubah menjadi "PAID"
   └─ Tenant mulai prepare pesanan

5. CUSTOMER NOTIFIKASI (Real-time)
   ├─ Customer dapat notifikasi order sudah dibayar
   ├─ Lihat nomor antrian di TV monitor
   └─ Display "order sedang dipersiapkan"

6. TENANT PREPARE (5-10 menit)
   ├─ Tenant masak/siapkan pesanan
   ├─ Tablet menunjukkan list order yang harus dikerjakan
   └─ Tenant mark order sebagai "READY"

7. NOTIFIKASI SIAP (Instant)
   ├─ Kasir lihat nomor antrian di monitor
   ├─ Customer dengar alarm/pengumuman di PA system
   ├─ Display TV tampilkan "Order [nomor] READY"
   └─ Portable device alarm berbunyi (optional)

8. CUSTOMER PICKUP/DINE-IN
   ├─ Customer ambil makanan (atau tenant antar ke meja)
   ├─ Tenant mark order "COMPLETED"
   └─ Revenue auto-calculated & distributed

9. REVENUE SETTLEMENT (Auto)
   ├─ System hitung komisi untuk setiap pihak
   ├─ Tenant dapat 97% dari total order mereka
   ├─ Food court dapat 2%
   └─ Developer dapat 1%
```

---

## PANDUAN UNTUK TENANT

### BAGIAN 1: LOGIN & SETUP AWAL

#### Langkah 1: Setup Device (Pertama Kali)
1. Buka aplikasi Tenant di tablet Android
2. Layar pertama: **"Enter PIN"**
3. Input PIN yang diberikan oleh pengelola tempat
4. Tap **"LOGIN"**
5. Jika benar → Masuk ke dashboard
6. Jika salah → Error message "PIN tidak valid"

**PIN tersimpan di device**, jadi hanya login 1 kali di awal hari (atau sesuai preferensi).

#### Langkah 2: Verify Tenant Information
Setelah login pertama kali:
1. Lihat halaman **"My Profile"**
2. Verify informasi:
   - Nama tenant
   - Nomor tenant (T001, T002, dst)
   - Lokasi di food court
   - Revenue share percentage (contoh: 97%)
3. Tap **"Confirm"** jika semua sudah benar

---

### BAGIAN 2: CARA INPUT PESANAN

#### Scenario: Customer Datang Pesan

**Step-by-step:**

1. **Dashboard Tenant**
   ```
   ┌─────────────────────────────────┐
   │  TENANT DASHBOARD               │
   ├─────────────────────────────────┤
   │  Pending Orders: 0               │
   │  Paid Orders: 2                  │
   │  Ready Orders: 1                 │
   │                                  │
   │  [+ NEW ORDER] [VIEW ALL] [STATS]
   ├─────────────────────────────────┤
   │ Recent Orders:                   │
   │ • Order #T001-001 → READY        │
   │ • Order #T001-002 → PAID         │
   └─────────────────────────────────┘
   ```

2. **Tap [+ NEW ORDER]**
   ```
   ┌─────────────────────────────────┐
   │  NEW ORDER FORM                  │
   ├─────────────────────────────────┤
   │ Customer Name: [______]          │
   │ Customer Phone: [______] (optional)
   │ Order Type: ○ Takeaway ● Dine-in │
   │ Table Number: [__] (if dine-in)  │
   │                                  │
   │ [ADD ITEMS]                      │
   └─────────────────────────────────┘
   ```

3. **Input Data Customer:**
   - Nama (required) - contoh: "Budi"
   - No HP (optional) - contoh: "081234567890"
   - Jenis order: Pilih "Takeaway" atau "Dine-in"
   - Jika "Dine-in": input nomor meja

4. **Tap [ADD ITEMS] untuk tambah menu**
   ```
   ┌─────────────────────────────────┐
   │  SELECT ITEMS                    │
   ├─────────────────────────────────┤
   │ 🔍 Search menu...               │
   │                                  │
   │ POPULAR:                         │
   │ ✓ Nasi Kuning       Rp 25.000    │
   │ ✓ Ayam Bakar        Rp 35.000    │
   │ ✓ Soto Ayam         Rp 20.000    │
   │ ✓ Es Cendol         Rp 10.000    │
   │                                  │
   │ [CONFIRM]                        │
   └─────────────────────────────────┘
   ```

5. **Pilih item & kuantitas**
   - Tap menu item yang ingin dipesan
   - Popup muncul:
     ```
     Nasi Kuning - Rp 25.000
     Qty: [1] [+] [-]
     [ADD TO ORDER]
     ```
   - Adjust qty sesuai kebutuhan
   - Tap [ADD TO ORDER]

6. **Ulangi step 5 untuk item lainnya**
   - Customer bisa order dari menu yang sama
   - Atau add item baru dengan tap [+ ADD MORE ITEMS]

7. **Order Summary**
   ```
   ┌─────────────────────────────────┐
   │  ORDER SUMMARY                   │
   ├─────────────────────────────────┤
   │ Customer: Budi (+6281234567890)  │
   │ Type: Takeaway                   │
   │                                  │
   │ Items:                           │
   │ • Nasi Kuning    x2    Rp 50.000 │
   │ • Ayam Bakar     x1    Rp 35.000 │
   │ • Es Cendol      x2    Rp 20.000 │
   │                                  │
   │ Subtotal:              Rp 105.000│
   │ Tax (0%):              Rp 0      │
   │ TOTAL:                 Rp 105.000│
   │                                  │
   │ [CANCEL] [GENERATE QR]           │
   └─────────────────────────────────┘
   ```

8. **Tap [GENERATE QR]** (Jika sudah sesuai)
   - Sistem auto-generate QR code unik
   - Order status: PENDING
   - QR berisi semua detail order

---

### BAGIAN 3: DISPLAY QR KE CUSTOMER

Setelah QR di-generate, ada 3 pilihan:

#### Opsi A: Print QR (Recommended)
1. Tablet akan menampilkan QR code
2. Tap **[PRINT QR]**
3. Dialog muncul: "Pilih printer"
4. Tap printer yang tersedia (misal: "Printer_T001")
5. Tunggu printing selesai (~10 detik)
6. Berikan struk/kupon ke customer

```
┌─────────────────────┐
│   FOOD COURT POS    │
├─────────────────────┤
│   Tenant: Warung X  │
│   Order #: T001-045 │
│                     │
│   ┌─────────────────┐
│   │     ██████      │
│   │     ██████      │ (QR CODE)
│   │     ██████      │
│   │     ██████      │
│   └─────────────────┘
│                     │
│  Customer: Budi     │
│  Items: 3           │
│  Total: Rp 105.000  │
│                     │
│ Pay at Cashier      │
│ ★★★★★★★★★★★★★★★ │
└─────────────────────┘
```

#### Opsi B: Display QR di Tablet
1. Setelah generate QR, tap **[DISPLAY]**
2. Tablet akan full-screen display QR code
3. Customer pake smartphone camera → tap untuk scan QR
4. Customer bisa liat order detail di device mereka
5. Setelah scanned, tap **[CONFIRM]** untuk lanjut

#### Opsi C: Customer Foto QR
1. QR ditampilkan di tablet (seperti Opsi B)
2. Customer foto QR pakai smartphone
3. Customer bisa lihat order detail (scan atau upload foto)

---

### BAGIAN 4: NOTIFIKASI ORDER DIBAYAR

#### Notifikasi Real-Time Masuk

Ketika customer sudah bayar di kasir, tablet tenant akan:

1. **Alert Muncul:**
   ```
   🔔 DING DING DING (Sound alert)
   
   ┌─────────────────────────────────┐
   │  ⭐ PESANAN BARU! ⭐             │
   ├─────────────────────────────────┤
   │  Order #T001-045                 │
   │  Customer: Budi                  │
   │  Payment: Rp 105.000 ✅ PAID     │
   │  Payment Method: CASH             │
   │                                  │
   │  Items:                          │
   │  • Nasi Kuning x2                │
   │  • Ayam Bakar x1                 │
   │  • Es Cendol x2                  │
   │                                  │
   │  [VIEW DETAIL] [CONFIRM]         │
   └─────────────────────────────────┘
   ```

2. **Tap [CONFIRM]** untuk acknowledge
   - Alert hilang
   - Order masuk ke "PAID ORDERS" list
   - Status order: PAID → Siap dikerjakan

#### Lihat Semua Paid Orders

Tap **"PAID ORDERS"** di dashboard untuk lihat semua order yang perlu dikerjakan:

```
┌─────────────────────────────────┐
│  PAID ORDERS (5)                 │
├─────────────────────────────────┤
│ 1. T001-045 - Budi (Takeaway)    │
│    ├─ Nasi Kuning x2             │
│    ├─ Ayam Bakar x1              │
│    └─ Es Cendol x2               │
│    Total: Rp 105.000             │
│    [START PREPARING]             │
│                                  │
│ 2. T001-046 - Siti (Dine-in #5)  │
│    ├─ Gado-gado x1               │
│    └─ Jus Mangga x1              │
│    Total: Rp 35.000              │
│    [START PREPARING]             │
│                                  │
│ ... (3 more orders)              │
│                                  │
│ [FILTER] [SORT] [REFRESH]        │
└─────────────────────────────────┘
```

---

### BAGIAN 5: MARK ORDER SEBAGAI READY

#### Ketika Makanan Sudah Siap

1. **Tap order di "PAID ORDERS"**
   ```
   ┌─────────────────────────────────┐
   │  ORDER DETAIL #T001-045          │
   ├─────────────────────────────────┤
   │  Customer: Budi (Takeaway)       │
   │  Total: Rp 105.000 ✅ PAID      │
   │                                  │
   │  ITEMS TO PREPARE:               │
   │  ☑ Nasi Kuning x2 (5 min)        │
   │  ☑ Ayam Bakar x1 (8 min)         │
   │  ☑ Es Cendol x2 (2 min)          │
   │                                  │
   │  Status: PREPARING               │
   │  Started: 10:15 AM               │
   │  Est. Ready: 10:23 AM            │
   │                                  │
   │  [MARK AS READY]                 │
   └─────────────────────────────────┘
   ```

2. **Tap [MARK AS READY]** ketika semua item sudah siap
   - Status berubah: PAID → READY
   - Customer dapat notifikasi
   - Display monitor update
   - Nomor antrian tampil di TV

3. **Konfirmasi Muncul:**
   ```
   ┌─────────────────────────────────┐
   │  KONFIRMASI                      │
   ├─────────────────────────────────┤
   │  Semua item sudah siap untuk     │
   │  Order #T001-045 (Budi)?         │
   │                                  │
   │  [TIDAK] [YA, MARK AS READY]     │
   └─────────────────────────────────┘
   ```

4. **Tap [YA, MARK AS READY]**
   - Order pindah ke "READY ORDERS"
   - Customer notifikasi: "Order Anda siap diambil!"
   - Display TV: "Order Budi - Ready to Pickup!"

---

### BAGIAN 6: ANTAR ATAU AMBIL PESANAN

#### Scenario A: Takeaway (Customer ambil sendiri)
1. Customer datang ke tenant
2. Serahkan makanan
3. Tap **[CONFIRM PICKUP]** di order detail
4. Status: READY → COMPLETED
5. Transaksi selesai ✅

#### Scenario B: Dine-in (Antar ke meja)
1. Tenant antar makanan ke meja customer (nomor tabel sudah tercatat)
2. Tap **[DELIVERED]** di order detail
3. Status: READY → COMPLETED
4. Transaksi selesai ✅

#### Scenario C: Order diambil di Kasir
1. Kasir ambil makanan dari tenant
2. Serahkan ke customer
3. Kasir tap **[CONFIRM PICKUP]** di kasir app
4. Status update di tenant: READY → COMPLETED

```
┌─────────────────────────────────┐
│  ORDER COMPLETED #T001-045       │
├─────────────────────────────────┤
│  Customer: Budi ✅ COMPLETED     │
│  Completed Time: 10:25 AM        │
│  Total Duration: 10 minutes      │
│                                  │
│  Revenue Share:                  │
│  Your Share: Rp 101,850          │
│  (97% of Rp 105,000)            │
│                                  │
│  [VIEW RECEIPT] [NEW ORDER]      │
└─────────────────────────────────┘
```

---

### BAGIAN 7: LIHAT STATISTIK HARIAN

Tap **[STATISTICS]** di dashboard:

```
┌─────────────────────────────────┐
│  TODAY'S STATISTICS              │
├─────────────────────────────────┤
│  📊 Performance                   │
│  Total Orders: 25                │
│  Total Revenue: Rp 2,500,000      │
│  Your Share: Rp 2,425,000         │
│  Avg Order Time: 12 min           │
│  Completed: 23                    │
│  Cancelled: 2                     │
│                                  │
│  ⏰ Peak Hours                    │
│  11:30 - 12:30: 8 orders          │
│  12:30 - 13:30: 12 orders         │
│  13:30 - 14:30: 5 orders          │
│                                  │
│  📈 Top Items                     │
│  1. Nasi Kuning - 15 orders       │
│  2. Ayam Bakar - 12 orders        │
│  3. Es Cendol - 10 orders         │
│                                  │
│  [EXPORT REPORT] [DETAILED VIEW]  │
└─────────────────────────────────┘
```

---

### BAGIAN 8: TROUBLESHOOTING UNTUK TENANT

| Masalah | Solusi |
|---------|--------|
| **Tablet tidak bisa scan QR** | Pastikan kamera clean, atau buka camera app dulu |
| **PIN salah terus** | Hubungi pengelola untuk reset PIN |
| **Notifikasi tidak masuk** | Cek koneksi WiFi, atau restart app |
| **QR tidak print** | Cek printer power, atau gunakan display QR di tablet |
| **Customer lupa PIN** | Pengelola bisa reset via admin panel |
| **Order tidak masuk di kasir** | Tunggu 5-10 detik, atau refresh kasir app |

---

## PANDUAN UNTUK KASIR

### BAGIAN 1: LOGIN KE KASIR APP

#### Langkah 1: Buka Aplikasi
1. Buka aplikasi Kasir di PC/tablet di checkout counter
2. Layar: **"SELECT COUNTER"**
3. Pilih nomor counter yang Anda tugas (misal: "Counter 1")

```
┌─────────────────────────────────┐
│  SELECT YOUR COUNTER             │
├─────────────────────────────────┤
│  ○ Counter 1                      │
│  ○ Counter 2                      │
│  ○ Counter 3                      │
│                                  │
│  [NEXT]                          │
└─────────────────────────────────┘
```

#### Langkah 2: Enter PIN
1. Setelah pilih counter, masuk PIN Anda
2. PIN disimpan per counter
3. Jika benar → Masuk ke Kasir Dashboard

```
┌─────────────────────────────────┐
│  KASIR LOGIN - COUNTER 1         │
├─────────────────────────────────┤
│  Enter PIN:                       │
│  [●] [●] [●] [●]                │
│                                  │
│  [0] [1] [2] [3] [4] [5]         │
│  [6] [7] [8] [9]                 │
│  [CANCEL] [CONFIRM]              │
└─────────────────────────────────┘
```

---

### BAGIAN 2: DASHBOARD KASIR

Setelah login, Anda akan lihat:

```
┌──────────────────────────────────────────────┐
│  COUNTER 1 - KASIR DASHBOARD                  │
├──────────────────────────────────────────────┤
│  Kasir: Ahmad                                 │
│  Time: 10:15 AM | Status: 🟢 ONLINE          │
│  Transaction Today: 45                       │
│  Revenue Today: Rp 4,500,000                  │
│                                              │
│  ┌───────────────────────────────────────┐   │
│  │ [SCAN QR CODE HERE] 📱                │   │
│  │ Or tap to scan                         │   │
│  └───────────────────────────────────────┘   │
│                                              │
│  [RECENT TRANSACTIONS] [MANUAL ENTRY]        │
│  [END SHIFT]                                 │
└──────────────────────────────────────────────┘
```

---

### BAGIAN 3: SCAN QR DARI CUSTOMER

#### Scenario: Customer tunjukkan QR (Print atau Foto)

**Step 1: Customer datang ke kasir**
- Customer tunjukkan QR code (printed struk atau foto di smartphone)

**Step 2: Tap Area Scan atau Gunakan Scanner**
- Opsi A: Tap **[SCAN QR CODE HERE]** area untuk activate scanner
- Opsi B: Gunakan barcode scanner device (tembak ke QR)

**Step 3: Scanner Aktif**
```
┌──────────────────────────────────┐
│  📷 QR SCANNER ACTIVE             │
├──────────────────────────────────┤
│  Arahkan ke QR code               │
│  atau gunakan barcode scanner     │
│                                  │
│  [CANCEL]                        │
└──────────────────────────────────┘
```

**Step 4: Scan QR**
- Point camera ke QR code
- Atau gunakan physical barcode scanner
- System akan auto-detect dan process

**Step 5: Order Detail Muncul**
```
┌──────────────────────────────────┐
│  ORDER SCANNED ✅                │
├──────────────────────────────────┤
│  Order #: T001-045                │
│  Tenant: Warung Nasi Kuning       │
│  Customer: Budi                   │
│  Type: Takeaway                   │
│                                   │
│  ITEMS:                           │
│  • Nasi Kuning x2      Rp 50.000  │
│  • Ayam Bakar x1       Rp 35.000  │
│  • Es Cendol x2        Rp 20.000  │
│                                   │
│  TOTAL: Rp 105.000                │
│  Status: PENDING PAYMENT          │
│                                   │
│  [EDIT] [PROCEED TO PAYMENT]      │
└──────────────────────────────────┘
```

---

### BAGIAN 4: VERIFY ORDER DETAIL

Sebelum bayar, pastikan:
- ✅ Nama customer benar
- ✅ Items sesuai
- ✅ Total sudah benar
- ✅ Tidak ada item yang tertinggal

Jika ada kesalahan:
- Tap **[EDIT]** untuk modify
- Atau tap **[CANCEL]** untuk scan ulang

---

### BAGIAN 5: PROSES PEMBAYARAN

#### Step 1: Tap [PROCEED TO PAYMENT]

```
┌──────────────────────────────────┐
│  PAYMENT METHOD                   │
├──────────────────────────────────┤
│  Total: Rp 105.000                │
│  Tendered: [__________]           │
│                                   │
│  Payment Method:                  │
│  ○ Cash                           │
│  ○ Card (Debit/Credit)           │
│  ○ E-Wallet (OVO, Gopay, Dana)   │
│  ○ QRIS                           │
│                                   │
│  [BACK] [NEXT]                    │
└──────────────────────────────────┘
```

#### Step 2: Pilih Payment Method

**Option A: CASH**
1. Tap ○ **CASH**
2. Input jumlah uang yang diterima
3. System hitung kembalian otomatis

```
┌──────────────────────────────────┐
│  CASH PAYMENT                     │
├──────────────────────────────────┤
│  Total: Rp 105.000                │
│  Tendered: [__________]           │
│  Change: Rp [_________]           │
│                                   │
│  [BACK] [CONFIRM PAYMENT]         │
└──────────────────────────────────┘
```

**Option B: CARD**
1. Tap ○ **CARD**
2. Insert/tap kartu ke payment terminal
3. Customer enter PIN
4. Tunggu approval

```
┌──────────────────────────────────┐
│  CARD PAYMENT                     │
├──────────────────────────────────┤
│  Total: Rp 105.000                │
│  Please wait...                   │
│  Processing card payment...       │
│                                   │
│  ⏳ Connecting to payment gateway  │
│                                   │
│  [CANCEL]                         │
└──────────────────────────────────┘
```

**Option C: E-WALLET / QRIS**
1. Tap ○ **E-WALLET** atau **QRIS**
2. System generate QR code untuk customer
3. Customer scan QR pakai e-wallet app mereka
4. Konfirmasi di app mereka
5. Tunggu payment approval

```
┌──────────────────────────────────┐
│  E-WALLET PAYMENT                 │
├──────────────────────────────────┤
│  Total: Rp 105.000                │
│  Customer scan code:              │
│                                   │
│  ┌─────────────────────────────┐  │
│  │     ██████████████          │  │
│  │     ██████████████          │  │ (QR)
│  │     ██████████████          │  │
│  │     ██████████████          │  │
│  └─────────────────────────────┘  │
│                                   │
│  Waiting for customer approval... │
│  [CANCEL]                         │
└──────────────────────────────────┘
```

#### Step 3: Konfirmasi Pembayaran

```
┌──────────────────────────────────┐
│  PAYMENT SUCCESSFUL ✅            │
├──────────────────────────────────┤
│  Order #: T001-045                │
│  Amount: Rp 105.000               │
│  Method: CASH                     │
│  Tendered: Rp 110.000             │
│  Change: Rp 5.000                 │
│                                   │
│  Transaction ID: TXN-2026020301-05│
│  Time: 10:20 AM                   │
│                                   │
│  Tenant: Warung Nasi Kuning       │
│  🔔 Notification sent to tenant   │
│                                   │
│  [PRINT RECEIPT] [NEXT ORDER]     │
└──────────────────────────────────┘
```

#### Step 4: Print Receipt (Optional)
- Tap **[PRINT RECEIPT]** untuk print struk pembayaran
- Berikan ke customer sebagai bukti pembayaran

#### Step 5: Next Order
- Tap **[NEXT ORDER]** untuk scan order berikutnya
- Atau tap **[BACK]** ke dashboard

---

### BAGIAN 6: LIHAT TRANSACTION HISTORY

Tap **[RECENT TRANSACTIONS]** di dashboard:

```
┌──────────────────────────────────┐
│  TRANSACTION HISTORY - TODAY      │
├──────────────────────────────────┤
│  🔍 Search / Filter               │
│                                   │
│  1. 10:20 AM | T001-045 | Rp 105K │
│     Warung Nasi Kuning | CASH ✅  │
│     Budi                          │
│                                   │
│  2. 10:15 AM | T002-032 | Rp 85K  │
│     Bakso Pojok | CARD ✅         │
│     Siti                          │
│                                   │
│  3. 10:10 AM | T003-056 | Rp 120K │
│     Ayam Goreng | E-WALLET ✅     │
│     Roni                          │
│                                   │
│  ... (more transactions)          │
│                                   │
│  [EXPORT] [PRINT]                 │
└──────────────────────────────────┘
```

Tap salah satu untuk lihat detail atau refund.

---

### BAGIAN 7: END OF SHIFT

Sebelum meninggalkan counter:

1. Tap **[END SHIFT]**
   ```
   ┌──────────────────────────────────┐
   │  END OF SHIFT                     │
   ├──────────────────────────────────┤
   │  Counter 1 - Kasir Ahmad          │
   │  Shift: 10:00 AM - 06:00 PM       │
   │                                   │
   │  Total Transactions: 45           │
   │  Total Amount: Rp 4,500,000       │
   │  Expected Cash: Rp 2,800,000      │
   │  Actual Cash: [__________]        │
   │  Difference: [_________]          │
   │                                   │
   │  Notes: [_________________]       │
   │                                   │
   │  [CANCEL] [CONFIRM END SHIFT]     │
   └──────────────────────────────────┘
   ```

2. Hitung & input jumlah uang kas
3. Sistem akan compare expected vs actual
4. Jika ada selisih, catat di notes
5. Tap **[CONFIRM END SHIFT]**
6. Shift selesai, laporan dikirim ke admin

---

## PANDUAN UNTUK CUSTOMER

### BAGIAN 1: PESAN DI TENANT

**Step 1: Pilih Tenant**
- Customer jalan-jalan di food court
- Pilih salah satu tenant yang diinginkan (misal: Warung Nasi Kuning)

**Step 2: Order ke Tenant**
- Bilang kepada staff tenant produk apa yang ingin dipesan
- Staff tenant akan input di tablet mereka

**Step 3: Terima QR Code**
- Setelah order selesai, customer akan terima QR code
- Bisa dalam bentuk: printed struk atau display di tablet

---

### BAGIAN 2: SCAN QR DAN LIHAT ORDER

#### Opsi A: Scan QR via Smartphone

1. **Buka app Smartphone**
   - Buka camera app atau QR scanner app
   - Arahkan ke QR code dari tenant

2. **Scan QR**
   - Tunggu 1-2 detik sampai detected
   - Link akan otomatis muncul atau tap notifikasi

3. **Lihat Order Detail**
   ```
   ┌─────────────────────────────────┐
   │  ORDER DETAILS                   │
   ├─────────────────────────────────┤
   │  Order #: T001-045               │
   │  Tenant: Warung Nasi Kuning      │
   │  Customer: Budi                  │
   │                                  │
   │  STATUS: 🟡 PENDING PAYMENT      │
   │  Waktu tunggu estimasi: 15 min   │
   │                                  │
   │  ITEMS:                          │
   │  • Nasi Kuning x2     Rp 50.000  │
   │  • Ayam Bakar x1      Rp 35.000  │
   │  • Es Cendol x2       Rp 20.000  │
   │                                  │
   │  TOTAL: Rp 105.000               │
   │                                  │
   │  ✨ Show this QR to Cashier      │
   │  or take a photo to track status │
   │                                  │
   │  [SHARE] [SCREENSHOT]            │
   └─────────────────────────────────┘
   ```

#### Opsi B: Manual Input Order Number

Jika QR tidak bisa di-scan:
1. Buka web browser → Masuk ke: `pos.foodcourt.com/track`
2. Manual input order number (contoh: T001-045)
3. Klik **[SEARCH]**
4. Lihat order detail dan status

#### Opsi C: Lihat Nomor Antrian di TV Monitor

Customer bisa lihat status langsung dari TV monitor yang tersebar di area food court.

---

### BAGIAN 3: STATUS ORDER

Customer bisa lihat real-time status order mereka:

#### Status 1: PENDING PAYMENT (Kuning)
```
⏳ Pesanan Anda sedang menunggu pembayaran
Pergi ke Kasir untuk melakukan pembayaran
Estimasi waktu: 15 menit dari sekarang
```

#### Status 2: PAID / PREPARING (Biru)
```
🟦 Pesanan Anda sudah dibayar ✅
Tenant sedang menyiapkan makanan Anda
Estimasi waktu: 10 menit lagi
```

#### Status 3: READY (Hijau)
```
🟩 MAKANAN ANDA SIAP! ✅
Ambil di Tenant atau menunggu antar ke meja
```

#### Status 4: COMPLETED (Abu-abu)
```
✅ Pesanan Selesai
Terima kasih sudah pesan! Sampai jumpa lagi
```

---

### BAGIAN 4: NOTIFIKASI REAL-TIME

Customer bisa menerima notifikasi lewat berbagai cara:

#### A. Smartphone Notification
Jika customer allow push notification:
- ✅ "Pesanan Anda sudah dibayar, tenant sedang menyiapkan"
- ✅ "Pesanan Anda siap! Silakan ambil"
- ✅ "Pesanan selesai"

#### B. Display Monitor TV
Customer bisa lihat di TV monitor:
- Nomor antrian yang sudah siap
- Status order real-time
- Waktu perkiraan

```
┌─────────────────────────────────────┐
│  READY TO PICKUP                    │
├─────────────────────────────────────┤
│  Order #T001-045                    │
│  Customer: Budi                     │
│  Tenant: Warung Nasi Kuning         │
│  Ambil di Tenant atau Counter       │
│                                      │
│  Order #T002-032                    │
│  Customer: Siti                     │
│  Tenant: Bakso Pojok                │
│  Menunggu untuk diambil              │
│                                      │
│  ... (more ready orders)            │
└─────────────────────────────────────┘
```

#### C. Alarm Device / Pengeras Suara
- Jika enabled: Portable device customer akan berbunyi alarm
- Atau PA system announcement: "Order untuk Budi dari Warung Nasi Kuning siap diambil!"

---

### BAGIAN 5: AMBIL PESANAN

#### Scenario A: Takeaway (Customer ambil sendiri)
1. Lihat status: "READY ✅"
2. Pergi ke tenant
3. Sebutkan nama atau tunjukkan order #
4. Ambil makanan
5. Pesanan selesai

#### Scenario B: Dine-in (Antar ke meja)
1. Lihat status: "READY ✅"
2. Tenant akan antar makanan ke meja Anda
3. Nikmati makanan
4. Selesai

#### Scenario C: Kasir yang memberikan
1. Lihat status: "READY ✅"
2. Pergi ke Kasir
3. Sebutkan nama atau order #
4. Kasir akan ambilkan makanan dari tenant
5. Terima makanan dan nikmati

---

## PANDUAN DISPLAY MONITOR

### BAGIAN 1: SETUP DISPLAY

Display monitor adalah TV atau digital screen yang menampilkan:
- Ready orders (antrian yang siap diambil)
- Processing orders (order yang sedang dikerjakan)
- Statistics real-time
- Advertising/Promo (optional)

**Lokasi Display:**
- Di area kasir (1 monitor utama)
- Di tengah food court (1-2 monitor)
- Di dekat setiap tenant (optional)

---

### BAGIAN 2: READY ORDERS DISPLAY

Tampilan utama menampilkan order yang sudah READY:

```
┌──────────────────────────────────────┐
│  🔔 READY TO PICKUP                  │
├──────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Order #T001-045 ⭐             │ │
│  │  👤 Budi                        │ │
│  │  🍜 Warung Nasi Kuning          │ │
│  │  ✅ Ready!  Ambil di Tenant    │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Order #T002-032 ⭐             │ │
│  │  👤 Siti                        │ │
│  │  🍲 Bakso Pojok                 │ │
│  │  ✅ Ready!  Waiting for pickup  │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Order #T003-056 ⭐             │ │
│  │  👤 Roni                        │ │
│  │  🍗 Ayam Goreng Warung A        │ │
│  │  ✅ Ready!  Antar ke meja #7    │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ... (scroll untuk order lain)       │
│                                       │
└──────────────────────────────────────┘
```

### BAGIAN 3: PROCESSING ORDERS DISPLAY

Menampilkan order yang sedang dikerjakan per tenant:

```
┌──────────────────────────────────────┐
│  ⏳ PROCESSING ORDERS                 │
├──────────────────────────────────────┤
│                                       │
│  🍜 WARUNG NASI KUNING (5 order)    │
│  ├─ T001-044 - 8 min left           │
│  ├─ T001-045 - 3 min left           │
│  ├─ T001-046 - 5 min left           │
│  ├─ T001-047 - 12 min left          │
│  └─ T001-048 - 7 min left           │
│                                       │
│  🍲 BAKSO POJOK (3 order)            │
│  ├─ T002-030 - 4 min left           │
│  ├─ T002-032 - 1 min left (Almost!)  │
│  └─ T002-033 - 6 min left           │
│                                       │
│  🍗 AYAM GORENG (2 order)            │
│  ├─ T003-055 - 9 min left           │
│  └─ T003-056 - 2 min left (Almost!)  │
│                                       │
└──────────────────────────────────────┘
```

### BAGIAN 4: STATISTICS DISPLAY

Menampilkan real-time statistics:

```
┌──────────────────────────────────────┐
│  📊 TODAY'S STATISTICS               │
├──────────────────────────────────────┤
│                                       │
│  Total Orders: 127  |  Total Revenue  │
│  ┌────────────────┐  │  Rp 12.750.000 │
│  │ ████████░░░░░░ │  │                │
│  │ 127 completed  │  │                │
│  └────────────────┘  │                │
│                                       │
│  Average Time: 12 min                │
│  Peak Hours: 12:00 - 13:00 PM (35)   │
│                                       │
│  Top Tenants:                        │
│  1. Warung Nasi Kuning - 32 orders   │
│  2. Bakso Pojok - 28 orders          │
│  3. Ayam Goreng - 22 orders          │
│  4. Es Cendol House - 18 orders      │
│  5. Soto Ayam Lezat - 15 orders      │
│                                       │
└──────────────────────────────────────┘
```

---

## PANDUAN ADMIN/PENGELOLA

### BAGIAN 1: ADMIN DASHBOARD

Admin/Pengelola bisa akses admin panel dengan username & password untuk:

1. **Manage Tenants**
   - Tambah/hapus/edit tenant
   - Set revenue share percentage
   - View tenant performance

2. **Manage Checkout Counters**
   - Tambah/hapus counter
   - Assign kasir ke counter
   - Monitor counter status

3. **Manage Users**
   - Create kasir account
   - Manage PIN
   - View user activity log

4. **View Reports**
   - Daily/weekly/monthly reports
   - Revenue breakdown per tenant
   - Transaction analytics

5. **System Settings**
   - Configure revenue share default
   - Set tax percentage
   - Manage display settings
   - Configure notification preferences

6. **Financial Settlement**
   - Calculate payment to each tenant
   - Generate settlement reports
   - Track payment status

---

### BAGIAN 2: CREATE NEW TENANT

1. **Login admin panel**
2. Menu: **"Tenants" → [+ ADD TENANT]**
3. Form:
   ```
   Tenant Name: [Warung Nasi Kuning]
   Tenant Code: [T001]
   Location: [Sebelah kasir]
   Description: [Spesialisasi Nasi Kuning]
   Contact Person: [Budi]
   Phone: [081234567890]
   Revenue Share %: [97]
   Status: [ACTIVE]
   [CREATE]
   ```
4. Sistem auto-assign user untuk tenant
5. Share login credentials ke tenant

---

### BAGIAN 3: MANAGE KASIR & PIN

1. Menu: **"Users" → "Kasir"**
2. Lihat list semua kasir
3. Actions:
   - **Add New Kasir**: [+ ADD] → Input nama & email
   - **Reset PIN**: Tap kasir → [RESET PIN]
   - **Deactivate**: Tap kasir → [DEACTIVATE]
   - **View Activity**: Tap kasir → [ACTIVITY LOG]

```
┌──────────────────────────────────────┐
│  KASIR MANAGEMENT                    │
├──────────────────────────────────────┤
│  Kasir List:                         │
│  1. Ahmad (Counter 1) - Active       │
│     Last Login: Today 10:15 AM       │
│     Transactions: 45                 │
│     [RESET PIN] [ACTIVITY]           │
│                                       │
│  2. Siti (Counter 2) - Active        │
│     Last Login: Today 09:30 AM       │
│     Transactions: 38                 │
│     [RESET PIN] [ACTIVITY]           │
│                                       │
│  3. Roni (Counter 3) - Inactive      │
│     Last Login: Yesterday 06:00 PM   │
│     [ACTIVATE] [RESET PIN]           │
│                                       │
│  [+ ADD NEW KASIR]                   │
└──────────────────────────────────────┘
```

---

### BAGIAN 4: FINANCIAL SETTLEMENT

**Weekly Settlement Process:**

1. Menu: **"Finance" → "Settlement"**
2. Select periode: "Week of Feb 3-9, 2026"
3. Sistem auto-calculate:

```
┌──────────────────────────────────────┐
│  WEEKLY SETTLEMENT - Feb 3-9, 2026    │
├──────────────────────────────────────┤
│  Total Revenue: Rp 89.250.000         │
│                                       │
│  Breakdown:                           │
│  T001 Warung Nasi Kuning:             │
│  • Orders: 125                        │
│  • Revenue: Rp 28.750.000             │
│  • Share (97%): Rp 27.887.500         │
│  • Food Court (2%): Rp 575.000        │
│  • Developer (1%): Rp 287.500         │
│  [MARK PAID]                          │
│                                       │
│  T002 Bakso Pojok:                    │
│  • Orders: 108                        │
│  • Revenue: Rp 24.300.000             │
│  • Share (97%): Rp 23.571.000         │
│  • Food Court (2%): Rp 486.000        │
│  • Developer (1%): Rp 243.000         │
│  [MARK PAID]                          │
│                                       │
│  ... (more tenants)                   │
│                                       │
│  [EXPORT REPORT] [PRINT] [CONFIRM]   │
└──────────────────────────────────────┘
```

---

## SKENARIO & USE CASES

### SKENARIO 1: Order Normal (Takeaway)

```
10:05 AM - Customer datang ke Warung Nasi Kuning
  ├─ Memesan: 2 Nasi Kuning, 1 Ayam Bakar, 2 Es Cendol
  └─ Total: Rp 105.000

10:06 AM - Tenant input pesanan di tablet
  ├─ QR code di-generate otomatis
  ├─ QR di-print (atau display)
  └─ Customer terima struk dengan QR

10:07 AM - Customer pergi ke kasir
  ├─ Tunjukkan QR ke kasir
  ├─ Kasir scan QR
  └─ Order detail tampil

10:08 AM - Kasir proses pembayaran
  ├─ Customer bayar Rp 105.000 (cash)
  ├─ Kasir input jumlah uang
  ├─ Change: Rp 0 (jika pas)
  └─ Payment confirmed ✅

10:09 AM - Real-time notification ke tenant
  ├─ 🔔 Alert muncul di tablet tenant
  ├─ Order #T001-045 - Budi - PAID ✅
  ├─ Tenant acknowledge
  └─ Status berubah: PENDING → PAID

10:10 AM - Tenant mulai prepare pesanan
  ├─ Ambil beras, goreng nasi kuning
  ├─ Masak ayam
  └─ Siapkan es cendol

10:20 AM - Pesanan selesai
  ├─ Tenant tap [MARK AS READY]
  ├─ Status: PAID → READY
  └─ Notifikasi ke customer

10:21 AM - Customer dapat notifikasi
  ├─ SMS/app: "Pesanan Anda siap diambil!"
  ├─ Display TV: "Order Budi - Ready!"
  ├─ Alarm device (optional): berbunyi
  └─ Customer datang ke tenant

10:22 AM - Customer ambil pesanan
  ├─ Customer bilang nama ke tenant
  ├─ Tenant serahkan makanan
  ├─ Tenant tap [CONFIRM PICKUP]
  └─ Status: READY → COMPLETED ✅

10:23 AM - Revenue distribution
  ├─ System calculate:
  │  ├─ Tenant share: Rp 101.850 (97%)
  │  ├─ Food court: Rp 2.100 (2%)
  │  └─ Developer: Rp 1.050 (1%)
  └─ All recorded & distributed automatically

🎉 TRANSAKSI SELESAI - SUKSES!
```

---

### SKENARIO 2: Order Dine-in (Antar ke meja)

```
12:30 PM - Customer datang ke Warung Nasi Kuning
  ├─ Memesan: 1 Soto Ayam, 2 Gado-gado, 1 Jus Mangga
  ├─ Bilang: "Makan di sini"
  └─ Kasir assign: Meja #5

12:31 PM - Tenant input pesanan (mark DINE-IN, meja #5)
  ├─ QR code di-generate
  └─ Display QR atau print ke customer

12:32 PM - Customer pergi ke kasir dengan QR
  ├─ Kasir scan QR
  ├─ Confirm total: Rp 65.000
  └─ Customer bayar (card) → ✅

12:33 PM - Tenant notifikasi (PAID)
  ├─ Order T001-089 - Meja #5 - PAID
  ├─ Tenant siapkan

12:40 PM - Pesanan siap, tenant mark READY
  ├─ Tenant tap [MARK AS READY] + [DELIVERY]
  └─ Status: PAID → READY → DELIVERED

12:41 PM - Tenant antar ke meja #5
  ├─ Serahkan makanan dengan sopan
  ├─ Customer confirm: "Terima kasih"
  └─ Tenant tap [COMPLETED]

🎉 PESANAN SELESAI - CUSTOMER BISA MAKAN LANGSUNG DI MEJA!
```

---

### SKENARIO 3: Multiple Tenant (1 Order dari 3 Tenant)

```
13:00 PM - Customer ingin pesan dari 3 tempat berbeda
  ├─ Pergi ke Tenant A: order Nasi Kuning + Ayam (Rp 60.000)
  ├─ Pergi ke Tenant B: order Soto Ayam (Rp 20.000)
  └─ Pergi ke Tenant C: order Es Cendol (Rp 10.000)
  
  TOTAL: Rp 90.000

13:01 PM - Setiap tenant generate QR (atau 1 QR dengan items dari semua)
  Opsi A: 3 QR terpisah (1 per tenant)
  Opsi B: 1 Super QR (berisi items dari 3 tenant)

13:02 PM - Customer ke kasir dengan QR
  ├─ Kasir scan 1 atau 3 QR
  ├─ System auto-aggregate items
  ├─ Display all items: Nasi, Ayam, Soto, Es
  └─ Total: Rp 90.000

13:03 PM - Customer bayar Rp 90.000 (cash)
  ├─ 1 transaksi, 1 payment
  └─ All 3 tenants get notified simultaneously

13:04 PM - Real-time notification ke semua tenant
  ├─ Tenant A: Order #T001-090 (Nasi + Ayam) - PAID ✅
  ├─ Tenant B: Order #T002-067 (Soto) - PAID ✅
  └─ Tenant C: Order #T003-078 (Es) - PAID ✅

13:05-13:15 PM - Masing-masing tenant siapkan order
  ├─ Tenant A: ~10 min
  ├─ Tenant B: ~5 min
  └─ Tenant C: ~2 min

13:12 PM - Tenant C selesai duluan
  ├─ Mark READY
  ├─ Display: "Es Cendol - Ready!" ✅

13:15 PM - Tenant A dan B selesai
  ├─ Mark READY
  ├─ Display: "All orders ready!"

13:16 PM - Customer dapat notifikasi "All ready!"
  ├─ Ambil makanan dari setiap tenant
  └─ Payment auto-split ke semua 3 tenant

🎉 SUKSES - CUSTOMER DAPAT 3 MAKANAN DARI 3 TENANT DENGAN 1 TRANSAKSI!
```

---

## TROUBLESHOOTING

### MASALAH TENANT

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| **Notifikasi tidak masuk** | Koneksi WiFi putus | Restart WiFi / check signal |
| **QR tidak generate** | Server error | Refresh app / restart tablet |
| **Customer tidak terima notifikasi** | Notification disabled | Enable push notification |
| **Order tidak sync ke kasir** | Network latency | Tunggu 10 detik, refresh |
| **Tablet hang** | Memory issue | Restart tablet |

### MASALAH KASIR

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| **Tidak bisa scan QR** | Kamera buruk / QR rusak | Clean camera / minta reprint |
| **Payment gateway error** | Network issue / timeout | Retry payment / gunakan cash |
| **Pin tidak bekerja** | Wrong PIN | Double-check PIN digit |
| **Server offline** | Network outage | Check WiFi / call support |

### MASALAH CUSTOMER

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| **QR tidak bisa di-scan** | Smartphone camera issue | Gunakan barcode scanner app / input manual |
| **Status tidak update** | Network issue | Refresh page / wait 10 sec |
| **Notifikasi tidak masuk** | Notification disabled | Enable notification di browser/app |

---

## FAQ

### FAQ - Tenant

**Q: Bagaimana jika customer datang lagi untuk order tambahan?**
A: Generate QR baru untuk order tambahan. Setiap order adalah transaksi terpisah.

**Q: Berapa maksimal item dalam 1 order?**
A: Tidak ada batasan maksimal, tapi untuk efficiency, recommend max 5-10 item per order.

**Q: Apa kalau order di-cancel customer?**
A: Tap [CANCEL] di order detail → refund otomatis ke customer → revenue tidak recorded.

**Q: Bagaimana bonus/diskon?**
A: Input di "Notes" atau create custom pricing. Discuss dengan pengelola untuk komisi adjustment.

---

### FAQ - Kasir

**Q: Bagaimana jika pembayaran gagal?**
A: Tap [RETRY] atau switch ke payment method lain. Order tetap PENDING sampai payment berhasil.

**Q: Apa yang harus dilakukan jika ada overpayment?**
A: System otomatis hitung change. Jika customer tidak mau kembalian, input cash baru dan close transaction.

**Q: Bagaimana menangani refund?**
A: Tap [REFUND] di transaction detail → confirm reason → refund otomatis balik ke customer.

**Q: Bisakah edit harga setelah scan?**
A: Ya, tap [EDIT] → adjust harga → confirm. Catat reason di notes untuk audit trail.

---

### FAQ - Customer

**Q: Apa yang harus dilakukan jika hilang QR?**
A: Hubungi tenant atau kasir, sebutkan nama & jumlah order. Mereka bisa search di system.

**Q: Berapa lama order biasanya siap?**
A: Estimasi ada di order detail (biasanya 5-15 min tergantung menu & queue).

**Q: Bisa tidak sesuai janji kalau sudah bayar?**
A: Semua sudah terekam di system. Kasir / pengelola bisa verify kapan saja.

---

### FAQ - Admin

**Q: Bagaimana cara check audit trail?**
A: Menu: "Reports" → "Audit Log" → filter by date/user/action.

**Q: Berapa sering harus settlement?**
A: Recommend daily atau weekly. Sesuaikan dengan cash flow & preferensi owner.

**Q: Bagaimana jika ada mismatch di revenue?**
A: Check audit log, compare dengan kasir cash count, verify di database. Discrepancy < 0.5% normal.

**Q: Bagaimana backup data?**
A: Auto-backup every hour. Manual backup available di "Settings" → "Backup".

---

**END OF USER MANUAL**

Untuk pertanyaan lebih lanjut atau technical support, hubungi: support@foodcourt-pos.com / +62-xxx-xxxxx
