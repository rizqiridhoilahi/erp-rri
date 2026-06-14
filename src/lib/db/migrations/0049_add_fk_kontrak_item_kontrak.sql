ALTER TABLE kontrak_item 
ADD CONSTRAINT fk_kontrak_item_kontrak 
FOREIGN KEY (kontrak_id) REFERENCES kontrak(id);
