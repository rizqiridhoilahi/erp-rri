# Cloudflare Email Worker — ERP RRI Inbound Email Pipeline

## Arsitektur

```
Pengirim → marzuqi@pt-rri.com
  ↓ MX record → Cloudflare Email Routing
  ↓ Email Worker (email-worker.js)
  ├── 1. Parse email (headers + body)
  ├── 2. POST /api/v1/email/inbound → email_log (inbound=true) → Mail Center Inbox
  └── 3. Brevo API → Gmail (DKIM/SPF valid → Inbox, bukan Spam)
       └── Fallback: message.forward() jika Brevo gagal
```

## Cara Deploy

### 1. Generate Secret
```bash
openssl rand -hex 32
# Contoh: a1b2c3d4e5f6...
```

### 2. Set Vercel Environment Variable
```bash
npx vercel env add EMAIL_INBOUND_SECRET
# Paste secret dari langkah 1
```

### 3. Deploy Worker via Cloudflare Dashboard
1. Buka https://dash.cloudflare.com → Workers & Pages → **Create Worker**
2. Hapus template default, paste semua isi `email-worker.js`
3. Klik **Deploy**
4. Buka tab **Settings → Variables**
5. Tambahkan environment variables:

| Variable | Value | Contoh |
|----------|-------|--------|
| `ERP_INBOUND_URL` | URL API inbound | `https://erp-rri.vercel.app/api/v1/email/inbound` |
| `ERP_INBOUND_SECRET` | Secret dari langkah 1 | `a1b2c3d4e5f6...` |
| `BREVO_API_KEY` | Brevo API key | `xkeysib-...` |
| `FORWARD_TO_EMAIL` | Gmail tujuan | `mazzjoeq@gmail.com` |
| `SENDER_EMAIL` | Verified sender | `marzuqi@pt-rri.com` |
| `SENDER_NAME` | Nama pengirim | `ERP RRI` |

### 4. Hubungkan ke Email Routing
1. Buka Cloudflare Dashboard → **Email Routing → Routing Rules**
2. Buat rule baru:
   - **Action:** `Send to Worker`
   - **Destination:** Pilih Worker yang baru dibuat
   - **Catch-all:** Jika ingin semua email ke `*@pt-rri.com` masuk worker
3. Simpan

### 5. Test
Kirim email dari akun Gmail lain ke `marzuqi@pt-rri.com`:
- Cek Mail Center Inbox → harus muncul
- Cek Gmail `mazzjoeq@gmail.com` → masuk Inbox, bukan Spam
