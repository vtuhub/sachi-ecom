-- Update default countries to India
ALTER TABLE profiles 
ALTER COLUMN shipping_country SET DEFAULT 'IN',
ALTER COLUMN billing_country SET DEFAULT 'IN';

ALTER TABLE orders 
ALTER COLUMN shipping_country SET DEFAULT 'IN',
ALTER COLUMN billing_country SET DEFAULT 'IN',
ALTER COLUMN currency SET DEFAULT 'inr';

-- Update existing demo data to Indian context
UPDATE orders SET 
  currency = 'inr',
  total_amount = total_amount * 80, -- Convert USD to INR (approximate)
  shipping_country = 'IN',
  billing_country = 'IN',
  shipping_city = CASE 
    WHEN shipping_city = 'New York' THEN 'Mumbai'
    WHEN shipping_city = 'Los Angeles' THEN 'Bangalore'
    ELSE 'Delhi'
  END,
  shipping_state = CASE 
    WHEN shipping_state = 'NY' THEN 'Maharashtra'
    WHEN shipping_state = 'CA' THEN 'Karnataka'
    ELSE 'Delhi'
  END,
  shipping_postal_code = CASE 
    WHEN shipping_postal_code = '10001' THEN '400001'
    WHEN shipping_postal_code = '90210' THEN '560001'
    ELSE '110001'
  END,
  shipping_carrier = CASE 
    WHEN shipping_carrier = 'FedEx' THEN 'BlueDart'
    WHEN shipping_carrier = 'UPS' THEN 'DTDC'
    ELSE 'India Post'
  END;

UPDATE order_items SET 
  unit_price = unit_price * 80, -- Convert to INR
  total_price = total_price * 80;

UPDATE cart_items SET 
  unit_price = unit_price * 80;

-- Update tracking updates with Indian locations
UPDATE order_tracking_updates SET 
  location = CASE 
    WHEN location = 'Memphis, TN' THEN 'Mumbai, Maharashtra'
    WHEN location = 'Chicago, IL' THEN 'Delhi, Delhi'
    WHEN location = 'Los Angeles, CA' THEN 'Bangalore, Karnataka'
    ELSE 'Mumbai, Maharashtra'
  END;