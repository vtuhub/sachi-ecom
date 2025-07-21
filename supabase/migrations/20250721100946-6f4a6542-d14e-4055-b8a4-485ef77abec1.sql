-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create products table for admin management
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- in paise (INR cents)
    original_price INTEGER,
    category TEXT NOT NULL,
    image_url TEXT,
    is_new BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    colors TEXT[],
    sizes TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create policies for products
CREATE POLICY "Everyone can view active products"
ON public.products
FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger for products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo products
INSERT INTO public.products (name, description, price, original_price, category, is_new, is_on_sale, colors, sizes, stock_quantity) VALUES
('Minimalist Wool Sweater', 'Premium wool sweater with minimalist design', 719900, 1039900, 'Knitwear', true, true, ARRAY['#f5f5f5', '#2c2c2c', '#8b7355'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 25),
('Organic Cotton Tee', 'Soft organic cotton t-shirt', 319900, NULL, 'Basics', false, false, ARRAY['#ffffff', '#000000', '#7c8471'], ARRAY['S', 'M', 'L', 'XL'], 50),
('Tailored Linen Blazer', 'Professional linen blazer', 1199900, NULL, 'Outerwear', true, false, ARRAY['#f4f1e8', '#2c2c2c'], ARRAY['XS', 'S', 'M', 'L'], 15),
('Wide-Leg Trousers', 'Comfortable wide-leg trousers', 639900, 799900, 'Bottoms', false, true, ARRAY['#2c2c2c', '#8b7355', '#4a4a4a'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 30),
('Cashmere Scarf', 'Luxurious cashmere scarf', 479900, NULL, 'Accessories', false, false, ARRAY['#f5f5f5', '#7c8471', '#d4c4a0'], ARRAY['One Size'], 20),
('Silk Midi Dress', 'Elegant silk midi dress', 1359900, NULL, 'Dresses', true, false, ARRAY['#2c2c2c', '#7c8471'], ARRAY['XS', 'S', 'M', 'L'], 12);