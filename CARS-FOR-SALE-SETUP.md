# Cars for Sale - Inventory System Setup

Add a "Cars for Sale" section to your website where you can sell cars from your inventory.

## Step 1: Create Supabase Table

Go to Supabase SQL Editor and run this:

```sql
-- Create cars_for_sale table
CREATE TABLE IF NOT EXISTS public.cars_for_sale (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    mileage INTEGER,
    vin TEXT,
    color TEXT,
    transmission TEXT,
    fuel_type TEXT,
    description TEXT,
    features TEXT[], -- Array of features
    image_url TEXT,
    image_urls TEXT[], -- Multiple images
    status TEXT DEFAULT 'available', -- available, sold, pending
    condition TEXT, -- excellent, good, fair
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.cars_for_sale ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so website can show cars)
CREATE POLICY "Allow public read access" ON public.cars_for_sale
    FOR SELECT USING (true);

-- Allow public insert/update/delete (you can restrict this later with auth)
CREATE POLICY "Allow public insert" ON public.cars_for_sale
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.cars_for_sale
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.cars_for_sale
    FOR DELETE USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_cars_status ON public.cars_for_sale(status);
CREATE INDEX idx_cars_make_model ON public.cars_for_sale(make, model);
CREATE INDEX idx_cars_price ON public.cars_for_sale(price);
```

## Step 2: That's It!

Once you run that SQL:
1. Go to Admin Panel → Cars for Sale
2. Click "Add Car"
3. Fill in details and upload image
4. Click Save
5. Car appears on website immediately at `/cars-for-sale/`

## Features

✅ **Admin Panel:**
- Add new cars with photos
- Edit existing cars
- Mark as sold
- Delete cars
- Upload multiple images

✅ **Public Website:**
- Beautiful car listings page
- Filter by make, price, year
- Click to view details
- Contact form for each car
- Automatic updates (no deployment needed)

✅ **Live Updates:**
- Changes in admin panel appear instantly on website
- No need to redeploy
- All data stored in Supabase database

## Security Note

Currently allows public write access for testing. For production:
1. Add authentication to admin panel
2. Update RLS policies to require authentication
3. Only authenticated admins can add/edit/delete cars
