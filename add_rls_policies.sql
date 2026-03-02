-- Missing INSERT and UPDATE policies for patients
CREATE POLICY "Authenticated users can insert patients" ON public.patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "MDs and Admins can update patients" ON public.patients FOR UPDATE USING (
  exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'md'))
);

-- Missing INSERT and UPDATE policies for treatment_plans
CREATE POLICY "Authenticated users can insert plans" ON public.treatment_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Techs can update their plans" ON public.treatment_plans FOR UPDATE USING (assigned_tech_id = auth.uid() OR exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'md')));
