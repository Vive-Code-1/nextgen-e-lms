

# Contact Form Leads, Newsletter Subscribers, and Layout Fix

## Overview
Four changes: (1) fix contact info card layout, (2) save contact form submissions to DB, (3) save newsletter emails to DB, (4) show both in admin dashboard.

## 1. Info Card Layout Fix

**File: `src/pages/Contact.tsx`**

Change each info card from vertical (icon above text) to horizontal (icon on left, text on right):

```text
Current:        Target:
  [icon]        [icon]  Title
  Title                 line1
  line1                 line2
  line2
```

- Change card from `text-center` to `flex items-start gap-4 text-left`
- Remove `mx-auto` from icon container, keep it as a fixed-size circle on the left
- Title and lines go in a div on the right

## 2. Database: Two New Tables

**Migration SQL:**

```sql
-- Contact form leads
CREATE TABLE public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage contact_leads" ON public.contact_leads FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone insert contact_leads" ON public.contact_leads FOR INSERT WITH CHECK (true);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage newsletter" ON public.newsletter_subscribers FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone insert newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
```

## 3. Contact Form Submission

**File: `src/pages/Contact.tsx`**
- Add state for form fields (name, email, phone, subject, message)
- On submit, insert into `contact_leads` table via Supabase client
- Show toast on success/error
- Clear form after successful submission

## 4. Newsletter Subscription

**File: `src/components/Footer.tsx`**
- Add state for newsletter email
- On send button click, insert into `newsletter_subscribers` table
- Show toast on success (or duplicate error message)
- Clear input after success

## 5. Admin Dashboard: Two New Sections

**File: `src/pages/AdminDashboard.tsx`**
- Add two sidebar links: "Contact Leads" (with `MessageSquare` icon) and "Newsletter" (with `Newspaper` icon)
- Render `AdminContactLeads` and `AdminNewsletter` components based on activeTab

**New File: `src/components/admin/AdminContactLeads.tsx`**
- Fetch all rows from `contact_leads` ordered by `created_at` desc
- Display in a table: Name, Email, Phone, Subject, Message (truncated), Date, Read status
- Click to expand/view full message
- Mark as read toggle

**New File: `src/components/admin/AdminNewsletter.tsx`**
- Fetch all rows from `newsletter_subscribers` ordered by `created_at` desc
- Display in a table: Email, Subscribed Date
- Delete button to remove subscribers

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration (new tables) | Create |
| `src/pages/Contact.tsx` | Modify (layout + form logic) |
| `src/components/Footer.tsx` | Modify (newsletter logic) |
| `src/components/admin/AdminContactLeads.tsx` | Create |
| `src/components/admin/AdminNewsletter.tsx` | Create |
| `src/pages/AdminDashboard.tsx` | Modify (add 2 sidebar tabs) |

