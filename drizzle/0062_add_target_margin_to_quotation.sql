ALTER TABLE quotation
  ADD COLUMN target_margin real DEFAULT 0.15 NOT NULL,
  ADD COLUMN negotiation_buffer real DEFAULT 0.10 NOT NULL;
