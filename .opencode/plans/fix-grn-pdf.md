# Fix GRN PDF

## 1. `src/app/api/v1/grn-customer/[id]/pdf/route.ts`

### 1a. Ganti select gudang (line 22)
```
.select('*, customer!customer_id(nama), gudang!gudang_id(nama), retur_penjualan!retur_penjualan_id(nomor)')
```
→
```
.select('*, customer!customer_id(nama), gudang!gudang_id(nama, lokasi), retur_penjualan!retur_penjualan_id(nomor)')
```

### 1b. Ganti type cast gudang (line 48)
```
const gudang = grn.gudang as { nama: string } | null
```
→
```
const gudang = grn.gudang as { nama: string; lokasi: string } | null
```

### 1c. Tambah gudangAlamat di pdfData (setelah line 68)
```
gudangAlamat: gudang?.lokasi ?? null,
```

## 2. `src/lib/pdf/grn-customer.ts`

### 2a. Interface — tambah gudangAlamat
```typescript
interface GrnCustomerData {
  ...
  gudangNama: string | null
  gudangAlamat: string | null
  ...
}
```

### 2b. Label Gudang (line 181)
```
'Gudang'
```
→
```
'Gudang RRI'
```

Value ganti jadi (line 183):
```
data.gudangNama + (data.gudangAlamat ? ' (' + data.gudangAlamat + ')' : '') || '-'
```

### 2c. Table outer border (line 41)
```
table: { width: '100%' },
```
→
```
table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000' },
```

### 2d. TOTAL ITEM row (lines 249-256)
Before:
```
isLastPage ? H(View, { style: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#000' } },
  H(View, { style: { flex: 1, padding: 4, justifyContent: 'center' } },
    H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' } }, 'TOTAL ITEM')
  ),
  H(View, { style: { width: 40, padding: 4, justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#000' } },
    H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' } }, String(data.totalQty))
  ),
) : null,
```
After:
```
isLastPage ? H(View, { style: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#000', borderBottomWidth: 1, borderBottomColor: '#000' } },
  H(View, { style: { flex: 1, padding: 2, justifyContent: 'center' } },
    H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' } }, 'TOTAL ITEM')
  ),
  H(View, { style: { width: 40, padding: 2, justifyContent: 'center' } },
    H(Text, { style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' } }, String(data.totalQty))
  ),
) : null,
```

### 2e. Signature block (lines 202-223)
Before (current — LEFT = RRI, RIGHT = Customer, TERBALIK):
```
const signatureBlock = H(View, { wrap: false },
  H(View, { style: styles.signatureSection },
    H(View, { style: styles.signatureBox },
      H(Text, { style: styles.signatureTitle }, 'Yang Menyerahkan,'),
      H(Text, { style: styles.signatureCompany }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
      H(View, { style: styles.signatureWrap },
        c.tanda_tangan_stempel_url
          ? H(Image, { src: c.tanda_tangan_stempel_url, style: { height: 100, objectFit: 'contain' } })
          : null
      ),
      H(Text, { style: styles.signatureName }, c.penandatangan_nama || 'Mohamad Marzuqi'),
      H(Text, { style: styles.signatureJabatan }, c.penandatangan_jabatan || 'Direktur')
    ),
    H(View, { style: styles.signatureBox },
      H(Text, { style: styles.signatureTitle }, 'Yang Mengetahui,'),
      H(Text, { style: styles.signatureCompany }, data.customerNama),
      H(View, { style: styles.signatureWrap }),
      H(Text, { style: styles.signatureName }, '..................................................'),
      H(Text, { style: styles.signatureJabatan }, '')
    )
  ),
)
```
After:
```
const signatureBlock = H(View, { wrap: false },
  H(View, { style: styles.signatureSection },
    H(View, { style: styles.signatureBox },
      H(Text, { style: styles.signatureTitle }, 'Yang Menyerahkan,'),
      H(Text, { style: styles.signatureCompany }, data.customerNama),
      H(View, { style: styles.signatureWrap }),
      H(Text, { style: styles.signatureName }, '..................................................'),
      H(Text, { style: styles.signatureJabatan }, '')
    ),
    H(View, { style: styles.signatureBox },
      H(Text, { style: styles.signatureTitle }, 'Yang Mengetahui,'),
      H(Text, { style: styles.signatureCompany }, c.company_nama || 'PT. RIZQI RIDHO ILAHI'),
      H(View, { style: styles.signatureWrap },
        c.tanda_tangan_stempel_url
          ? H(Image, { src: c.tanda_tangan_stempel_url, style: { height: 100, objectFit: 'contain' } })
          : null
      ),
      H(Text, { style: styles.signatureName }, c.penandatangan_nama || 'Mohamad Marzuqi'),
      H(Text, { style: styles.signatureJabatan }, c.penandatangan_jabatan || 'Direktur')
    )
  ),
)
```
