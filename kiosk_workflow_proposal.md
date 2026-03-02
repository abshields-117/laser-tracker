# Laser Tracker: Production Readiness & Kiosk Workflow

## 1. Wipe Test Data (Safe Reset)
Run this in the Supabase SQL Editor. This will wipe all patients, plans, and treatments, but will **keep all your clinician user accounts intact**.
```sql
-- TRUNCATE will remove all records and cascade down to treatment_plans and treatments automatically.
TRUNCATE TABLE public.patients CASCADE;
```

## 2. Adjust Clinician Workflow (Immediate Treatment)
We need to remove the restriction that a patient must be "approved" before a technician can start a treatment plan.

Run this SQL to update the security policy:
```sql
-- Remove the old strict policy
DROP POLICY IF EXISTS "Authenticated users can create treatment plans for approved patients" ON public.treatment_plans;

-- Create the new flexible policy (allows tech to start immediately)
CREATE POLICY "Authenticated users can create treatment plans" ON public.treatment_plans FOR INSERT WITH CHECK (
  auth.role() IN ('tech', 'md', 'admin')
);
```
*Note: Your `IntakeForm.tsx` already sets new patients to `pending_md_review` by default. This status will remain, flagging them for the MD, but the tech is no longer blocked from starting the laser session today.*

## 3. MD "View Full Chart" Link
To make the "View Full Chart" link on the MD Dashboard work, we need a dedicated Patient History page. 
- **Action:** We need to build `app/patients/[id]/page.tsx`. This page will fetch the Patient details, their active Treatment Plan, and map over all completed Treatments to show a timeline of their laser history.

## 4. Mobile-Friendly Kiosk Mode (iPad Intake)
Building a full patient portal with usernames/passwords is overkill. Instead, we should build a **Kiosk Route**.

**The Workflow:**
1. You navigate to a hidden, public route on the office iPad: `laser-tracker.com/kiosk`
2. The front desk taps "New Intake" and hands the iPad to the patient.
3. The patient fills out their demographic info, Fitzpatrick scale, and medical history.
4. They sign with their finger and hit "Submit".
5. The iPad automatically clears the screen and returns to the "New Intake" button for the next patient.
6. The data is securely pushed directly into Supabase and flagged as `pending_md_review`.

**Security:** This route won't require a login, but we will lock it down so it can *only* insert new rows (it cannot read or edit existing patient data). 
