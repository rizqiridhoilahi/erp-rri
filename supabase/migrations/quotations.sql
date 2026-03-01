-- Create quotations table
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_no VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  quotation_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quotation_line_items table
CREATE TABLE quotation_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  line_total NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100)) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to auto-generate quotation_no
CREATE OR REPLACE FUNCTION generate_quotation_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quotation_no := 'QT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                      LPAD(CAST(NEXTVAL('quotation_no_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for quotation_no
CREATE SEQUENCE IF NOT EXISTS quotation_no_seq START WITH 1 INCREMENT BY 1;

-- Create trigger to auto-generate quotation_no
CREATE TRIGGER set_quotation_no
BEFORE INSERT ON quotations
FOR EACH ROW
EXECUTE FUNCTION generate_quotation_no();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_quotations_timestamp
BEFORE UPDATE ON quotations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_quotation_line_items_timestamp
BEFORE UPDATE ON quotation_line_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create indexes for better performance
CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);
CREATE INDEX idx_quotation_line_items_quotation_id ON quotation_line_items(quotation_id);
CREATE INDEX idx_quotation_line_items_product_id ON quotation_line_items(product_id);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_line_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON quotations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON quotations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON quotations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON quotations
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON quotation_line_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON quotation_line_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON quotation_line_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON quotation_line_items
  FOR DELETE USING (auth.role() = 'authenticated');
