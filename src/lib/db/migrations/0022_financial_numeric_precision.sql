-- Convert financial columns from real/double precision to numeric (exact precision)
-- This ensures accounting accuracy and prevents rounding errors

-- invoice (ppn_rate and pph_rate are rates, use 5,4 precision)
ALTER TABLE invoice ALTER COLUMN ppn_rate TYPE numeric(5,4) USING ppn_rate::numeric(5,4);
ALTER TABLE invoice ALTER COLUMN pph_rate TYPE numeric(5,4) USING pph_rate::numeric(5,4);

-- invoice_item (column name in DB is 'harga' not 'harga_satuan')
ALTER TABLE invoice_item ALTER COLUMN harga TYPE numeric(18,2) USING harga::numeric(18,2);
ALTER TABLE invoice_item ALTER COLUMN diskon TYPE numeric(18,2) USING diskon::numeric(18,2);
ALTER TABLE invoice_item ALTER COLUMN ppn TYPE numeric(18,2) USING ppn::numeric(18,2);
ALTER TABLE invoice_item ALTER COLUMN pph TYPE numeric(18,2) USING pph::numeric(18,2);

-- kwitansi_item
ALTER TABLE kwitansi_item ALTER COLUMN jumlah TYPE numeric(18,2) USING jumlah::numeric(18,2);

-- faktur_pajak
ALTER TABLE faktur_pajak ALTER COLUMN dpp TYPE numeric(18,2) USING dpp::numeric(18,2);
ALTER TABLE faktur_pajak ALTER COLUMN ppn TYPE numeric(18,2) USING ppn::numeric(18,2);
ALTER TABLE faktur_pajak ALTER COLUMN pph TYPE numeric(18,2) USING pph::numeric(18,2);

-- faktur_pajak_item
ALTER TABLE faktur_pajak_item ALTER COLUMN harga TYPE numeric(18,2) USING harga::numeric(18,2);
ALTER TABLE faktur_pajak_item ALTER COLUMN dpp TYPE numeric(18,2) USING dpp::numeric(18,2);
ALTER TABLE faktur_pajak_item ALTER COLUMN ppn TYPE numeric(18,2) USING ppn::numeric(18,2);
ALTER TABLE faktur_pajak_item ALTER COLUMN pph TYPE numeric(18,2) USING pph::numeric(18,2);

-- jurnal_item
ALTER TABLE jurnal_item ALTER COLUMN debit TYPE numeric(18,2) USING debit::numeric(18,2);
ALTER TABLE jurnal_item ALTER COLUMN credit TYPE numeric(18,2) USING credit::numeric(18,2);

-- supplier_payment
ALTER TABLE supplier_payment ALTER COLUMN nominal TYPE numeric(18,2) USING nominal::numeric(18,2);
