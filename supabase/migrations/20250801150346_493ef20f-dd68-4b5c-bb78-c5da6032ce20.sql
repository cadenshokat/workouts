-- Create table for configurable sections (Bizdev, Brand, Product)
CREATE TABLE public.configurable_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL UNIQUE CHECK (section_type IN ('bizdev', 'brand', 'product')),
  column_headers JSONB NOT NULL DEFAULT '["Column 1"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for rows within each configurable section
CREATE TABLE public.configurable_section_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.configurable_sections(id) ON DELETE CASCADE,
  row_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.configurable_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurable_section_rows ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public access to configurable_sections" 
ON public.configurable_sections 
FOR ALL 
USING (true);

CREATE POLICY "Public access to configurable_section_rows" 
ON public.configurable_section_rows 
FOR ALL 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_configurable_sections_updated_at
BEFORE UPDATE ON public.configurable_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configurable_section_rows_updated_at
BEFORE UPDATE ON public.configurable_section_rows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections
INSERT INTO public.configurable_sections (section_type, column_headers) VALUES
('bizdev', '["Ideas", "Notes", "Status"]'::jsonb),
('brand', '["Campaign", "Description", "Timeline"]'::jsonb),
('product', '["Feature", "Priority", "Status"]'::jsonb);