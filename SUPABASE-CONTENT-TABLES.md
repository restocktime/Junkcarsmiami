# Supabase Content Management Tables Setup

To enable content editing from the admin panel, you need to create these tables in Supabase.

## 1. Create `website_content` Table

Go to Supabase SQL Editor and run:

```sql
-- Create website_content table
CREATE TABLE IF NOT EXISTS public.website_content (
    id BIGSERIAL PRIMARY KEY,
    section TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.website_content
    FOR SELECT USING (true);

-- Allow public insert/update (you can restrict this later)
CREATE POLICY "Allow public insert" ON public.website_content
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.website_content
    FOR UPDATE USING (true);

-- Create index for faster lookups
CREATE INDEX idx_website_content_section ON public.website_content(section);
```

## 2. Create `business_info` Table

```sql
-- Create business_info table
CREATE TABLE IF NOT EXISTS public.business_info (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    license TEXT,
    hours TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_info ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.business_info
    FOR SELECT USING (true);

-- Allow public insert/update
CREATE POLICY "Allow public insert" ON public.business_info
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.business_info
    FOR UPDATE USING (true);
```

## 3. Insert Default Data

```sql
-- Insert default business info
INSERT INTO public.business_info (name, phone, email, address, license, hours)
VALUES (
    'Buy Junk Car Miami',
    '(305) 534-5991',
    'buyjunkcarmiami@gmail.com',
    '122 South Miami Avenue, Miami, FL 33130',
    'TI0105',
    'Monday - Sunday: 8:00 AM - 6:00 PM'
)
ON CONFLICT DO NOTHING;

-- Insert default content sections
INSERT INTO public.website_content (section, title, content, meta_description)
VALUES 
    ('hero', 'Buy Junk Car Miami', 'Get instant cash for your junk car today! We buy all makes and models.', 'Miami''s #1 junk car buyer - instant cash offers'),
    ('services', 'Our Services', 'Fast cash offers, free towing, same-day pickup, licensed and insured', 'Professional junk car removal services in Miami'),
    ('about', 'About Us', 'Buy Junk Car Miami is a licensed and trusted junk car buyer serving South Florida', 'Learn about Miami''s premier junk car buying service'),
    ('contact', 'Contact', 'Phone: (305) 534-5991\nEmail: buyjunkcarmiami@gmail.com\nLicense: TI0105', 'Contact information for Buy Junk Car Miami'),
    ('locations', 'Service Areas', 'Miami, Miami Beach, Coral Gables, Homestead, Hialeah and all of South Florida', 'Areas served by Buy Junk Car Miami')
ON CONFLICT (section) DO NOTHING;
```

## 4. Verify Tables

Check that tables were created:

```sql
SELECT * FROM public.website_content;
SELECT * FROM public.business_info;
```

## What This Enables

✅ **Content Editor** - Edit website text from admin panel
✅ **Business Info** - Update phone, email, address, hours
✅ **Meta Descriptions** - Update SEO descriptions
✅ **Database Storage** - All changes saved to Supabase
✅ **Real-time Updates** - Changes reflect immediately

## Security Note

Currently, these tables allow public write access for testing. For production, you should:

1. Add authentication to the admin panel
2. Restrict write access to authenticated users only
3. Update RLS policies to check user authentication

## Next Steps

After creating these tables:
1. Go to admin panel → Website Content
2. Select a section to edit
3. Make changes and click Save
4. Changes are saved to Supabase database
5. Your website can read from these tables to display content

**Note:** You'll need to update your main website (index.html) to read content from Supabase instead of hardcoded HTML.
