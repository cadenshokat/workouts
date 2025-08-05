-- Enable RLS on tables that don't have it yet
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master ENABLE ROW LEVEL SECURITY;

-- Create policies for public access on these tables
CREATE POLICY "Public access to managers" 
ON public.managers 
FOR ALL 
USING (true);

CREATE POLICY "Public access to partner_managers" 
ON public.partner_managers 
FOR ALL 
USING (true);

CREATE POLICY "Public access to master" 
ON public.master 
FOR ALL 
USING (true);