-- Create chart_of_accounts table (Daftar Akun)
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(20) NOT NULL UNIQUE,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'other_income', 'other_expense')),
  parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  opening_balance NUMERIC(15, 2) DEFAULT 0,
  balance NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_entries table (Jurnal Umum)
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_no VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'voided')),
  total_debit NUMERIC(15, 2) DEFAULT 0,
  total_credit NUMERIC(15, 2) DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_entry_lines table (Detail Jurnal)
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
  debit NUMERIC(15, 2) DEFAULT 0,
  credit NUMERIC(15, 2) DEFAULT 0,
  description TEXT,
  reference_no VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create general_ledger_view (Virtual, calculated from journal_entry_lines)
-- This is a helper view for querying GL by account
CREATE OR REPLACE VIEW general_ledger AS
SELECT
  jel.id,
  jel.account_id,
  coa.account_code,
  coa.account_name,
  coa.account_type,
  je.entry_no,
  je.entry_date,
  je.description as entry_description,
  jel.description as line_description,
  jel.debit,
  jel.credit,
  jel.reference_no,
  coa.opening_balance,
  CASE
    WHEN coa.account_type IN ('asset', 'expense', 'other_expense') THEN coalesce(coa.opening_balance, 0) + sum(jel.debit - jel.credit) OVER (PARTITION BY jel.account_id ORDER BY je.entry_date, je.created_at)
    ELSE coalesce(coa.opening_balance, 0) + sum(jel.credit - jel.debit) OVER (PARTITION BY jel.account_id ORDER BY je.entry_date, je.created_at)
  END as running_balance,
  je.created_at
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
JOIN chart_of_accounts coa ON jel.account_id = coa.id;

-- Create trial_balance_view (for Trial Balance report)
CREATE OR REPLACE VIEW trial_balance AS
SELECT
  coa.id,
  coa.account_code,
  coa.account_name,
  coa.account_type,
  coa.opening_balance,
  COALESCE(SUM(CASE WHEN coa.account_type IN ('asset', 'expense', 'other_expense') THEN jel.debit - jel.credit ELSE jel.credit - jel.debit END), 0) as balance,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN coa.account_type IN ('asset', 'expense', 'other_expense') THEN jel.debit - jel.credit ELSE jel.credit - jel.debit END), 0) > 0 
    THEN COALESCE(SUM(CASE WHEN coa.account_type IN ('asset', 'expense', 'other_expense') THEN jel.debit - jel.credit ELSE jel.credit - jel.debit END), 0)
    ELSE 0
  END as debit_balance,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN coa.account_type IN ('asset', 'expense', 'other_expense') THEN jel.debit - jel.credit ELSE jel.credit - jel.debit END), 0) < 0 
    THEN ABS(COALESCE(SUM(CASE WHEN coa.account_type IN ('asset', 'expense', 'other_expense') THEN jel.debit - jel.credit ELSE jel.credit - jel.debit END), 0))
    ELSE 0
  END as credit_balance
FROM chart_of_accounts coa
LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
WHERE coa.status = 'active'
GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type, coa.opening_balance;

-- Create function to generate entry numbers (JE-YYYY-0001)
CREATE OR REPLACE FUNCTION generate_entry_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.entry_no := 'JE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                  LPAD(CAST(NEXTVAL('journal_entry_no_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for entry numbers
CREATE SEQUENCE IF NOT EXISTS journal_entry_no_seq START WITH 1 INCREMENT BY 1;

-- Create trigger for entry number generation
CREATE TRIGGER set_entry_no
BEFORE INSERT ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION generate_entry_no();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_coa_timestamp
BEFORE UPDATE ON chart_of_accounts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_journal_entries_timestamp
BEFORE UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_journal_entry_lines_timestamp
BEFORE UPDATE ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create indexes for better performance
CREATE INDEX idx_coa_code ON chart_of_accounts(account_code);
CREATE INDEX idx_coa_type ON chart_of_accounts(account_type);
CREATE INDEX idx_coa_parent ON chart_of_accounts(parent_id);
CREATE INDEX idx_je_date ON journal_entries(entry_date);
CREATE INDEX idx_je_status ON journal_entries(status);
CREATE INDEX idx_jel_account ON journal_entry_lines(account_id);
CREATE INDEX idx_jel_journal ON journal_entry_lines(journal_entry_id);

-- Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON chart_of_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON chart_of_accounts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON chart_of_accounts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON chart_of_accounts
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON journal_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON journal_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON journal_entries
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON journal_entries
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON journal_entry_lines
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON journal_entry_lines
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON journal_entry_lines
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON journal_entry_lines
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default Standard Indonesian Chart of Accounts (SAK ETAP)
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description, status) VALUES
-- ASSETS (Aktiva)
('1000', 'AKTIVA', 'asset', 'Aktiva', 'active'),
('1100', 'Aktiva Lancar', 'asset', 'Current Assets', 'active'),
('1110', 'Kas dan Setara Kas', 'asset', 'Cash and Cash Equivalents', 'active'),
('1111', 'Kas', 'asset', 'Cash', 'active'),
('1112', 'Bank - BCA Rp', 'asset', 'Bank Account', 'active'),
('1113', 'Bank - BRI Rp', 'asset', 'Bank Account', 'active'),
('1120', 'Piutang Usaha', 'asset', 'Accounts Receivable', 'active'),
('1121', 'Piutang Usaha - Jangka Pendek', 'asset', 'AR Short Term', 'active'),
('1130', 'Persediaan', 'asset', 'Inventory', 'active'),
('1131', 'Persediaan Barang Dagang', 'asset', 'Inventory', 'active'),
('1140', 'Beban Dibayar Dimuka', 'asset', 'Prepaid Expenses', 'active'),
('1200', 'Aktiva Tetap', 'asset', 'Fixed Assets', 'active'),
('1210', 'Peralatan', 'asset', 'Equipment', 'active'),
('1211', 'Peralatan - Gross', 'asset', 'Equipment Gross', 'active'),
('1220', 'Kendaraan', 'asset', 'Vehicles', 'active'),
('1221', 'Kendaraan - Gross', 'asset', 'Vehicles Gross', 'active'),

-- LIABILITIES (Kewajiban)
('2000', 'KEWAJIBAN', 'liability', 'Liabilities', 'active'),
('2100', 'Kewajiban Jangka Pendek', 'liability', 'Current Liabilities', 'active'),
('2110', 'Hutang Usaha', 'liability', 'Accounts Payable', 'active'),
('2111', 'Hutang Usaha - Jangka Pendek', 'liability', 'AP Short Term', 'active'),
('2120', 'Hutang Pajak', 'liability', 'Tax Payable', 'active'),
('2121', 'PPN Keluaran', 'liability', 'VAT Payable', 'active'),
('2122', 'PPh 21 Ke atas Gaji/Honor', 'liability', 'Income Tax Payable', 'active'),
('2130', 'Beban Akrual', 'liability', 'Accrued Expenses', 'active'),
('2200', 'Kewajiban Jangka Panjang', 'liability', 'Long Term Liabilities', 'active'),

-- EQUITY (Modal)
('3000', 'MODAL', 'equity', 'Equity', 'active'),
('3100', 'Modal Pemilik', 'equity', 'Owner Equity', 'active'),
('3110', 'Modal Awal', 'equity', 'Capital', 'active'),
('3120', 'Laba Ditahan', 'equity', 'Retained Earnings', 'active'),
('3130', 'Laba/Rugi Tahun Berjalan', 'equity', 'Current Year Income', 'active'),

-- REVENUE (Pendapatan)
('4000', 'PENDAPATAN USAHA', 'revenue', 'Revenue from Operations', 'active'),
('4100', 'Penjualan', 'revenue', 'Sales', 'active'),
('4110', 'Penjualan Barang Dagang', 'revenue', 'Revenue from Sales', 'active'),
('4120', 'Potongan Penjualan', 'revenue', 'Sales Discount', 'active'),
('4130', 'Retur Penjualan', 'revenue', 'Sales Return', 'active'),

-- EXPENSES (Beban)
('5000', 'BEBAN OPERASIONAL', 'expense', 'Operating Expenses', 'active'),
('5100', 'Harga Pokok Penjualan', 'expense', 'Cost of Goods Sold', 'active'),
('5110', 'Pembelian Barang', 'expense', 'Purchases', 'active'),
('5120', 'Beban Gaji dan Upah', 'expense', 'Salary and Wages', 'active'),
('5130', 'Beban Utilitas', 'expense', 'Utilities', 'active'),
('5131', 'Beban Listrik', 'expense', 'Electricity Expense', 'active'),
('5132', 'Beban Air', 'expense', 'Water Expense', 'active'),
('5140', 'Beban Penyusutan', 'expense', 'Depreciation Expense', 'active'),
('5141', 'Penyusutan Peralatan', 'expense', 'Depreciation Equipment', 'active'),
('5150', 'Beban Transportasi', 'expense', 'Transportation Expense', 'active'),
('5160', 'Beban Perawatan', 'expense', 'Maintenance Expense', 'active'),

-- OTHER INCOME (Penghasilan Lain)
('6000', 'PENGHASILAN LAIN', 'other_income', 'Other Income', 'active'),
('6100', 'Bunga Bank', 'other_income', 'Interest Income', 'active'),
('6200', 'Pendapatan Lain', 'other_income', 'Other Income', 'active'),

-- OTHER EXPENSES (Beban Lain)
('7000', 'BEBAN LAIN-LAIN', 'other_expense', 'Other Expenses', 'active'),
('7100', 'Beban Bunga', 'other_expense', 'Interest Expense', 'active'),
('7200', 'Pajak PPh 25', 'other_expense', 'Income Tax', 'active'),
('7300', 'Beban Denda', 'other_expense', 'Penalty Expense', 'active');
