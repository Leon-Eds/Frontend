# Implementation Plan: Fee Clearance, Dashboards, and School Themes

## Goal Description
Implement several backend integration and UI adjustments:
1. Fix Fee Clearance to send accurate `amountPaid` and `amountDue` (sending the correct values instead of zeroes).
2. Refactor Super Admin Dashboard: Relocate "Total Revenue" to the Billings and Plans page, focusing the main dashboard on school-specific metrics.
3. Remove Subscription Plan selection from the School Registration flow, defaulting to "Free" and displaying a dismissible upgrade popup on the admin dashboard post-login.
4. Upgrade the Theme system from browser-specific predefined classes (localStorage) to dynamic, school-specific colors driven by the backend (`schoolTheme.primaryColor`).
5. Fix Payment Checkout initialization by sending the `callbackUrl` (and `planId`) to `/api/payment/subscribe`.
6. Add "Manual Upgrade" functionality for Super Admins to manually upgrade schools.

## Proposed Changes

### 1. Fee Clearance Fix
#### [MODIFY] [finance/page.tsx](file:///c:/Users/USER/Leoned/src/app/dashboard/finance/page.tsx)
- Update `StudentRegistry` interface to include `amountDue?: number` and `amountPaid?: number`.
- In `fetchStudents()`, map these properties from the `feeMap`.
- In `handleAction()` when triggering "Cleared", modify `feeApi.record` to use `amountDue` and `amountPaid` instead of `1000` and `0` respectively.

### 2. Super Admin Dashboards (Revenue & Schools)
#### [MODIFY] [super-admin/page.tsx](file:///c:/Users/USER/Leoned/src/app/super-admin/page.tsx)
- Remove the "Revenue" metric card.
- Keep "Total Schools", "Total Students" and "Active Subscriptions" on the main dashboard.

#### [MODIFY] [super-admin/plans/page.tsx](file:///c:/Users/USER/Leoned/src/app/super-admin/plans/page.tsx)
- Add a new Analytics summary section at the top to display Total Revenue (using the new `/api/subscription-logs/revenue-by-plan` endpoint) and active subscriptions.

### 3. Registration Flow & Upgrade Prompt
#### [MODIFY] [register/page.tsx](file:///c:/Users/USER/Leoned/src/app/register/page.tsx)
- Remove Step 2 (Subscription Plan Selection).
- Hardcode `subscriptionPlan: "Free"` into the registration payload.

#### [MODIFY] [dashboard/page.tsx](file:///c:/Users/USER/Leoned/src/app/dashboard/page.tsx)
- Check `user.subscriptionPlan` upon login. If it is "Free", show a dismissible "Upgrade Plan" modal prompt encouraging the admin to upgrade.

### 4. School Specific Themes
#### [MODIFY] [globals.css](file:///c:/Users/USER/Leoned/src/app/globals.css)
- Implement CSS variables for primary elements (`--theme-primary`).
- Convert static Tailwind overrides (`html.theme-ocean .text-[#053d26]`) to use the global CSS variable.

#### [MODIFY] [layout.tsx](file:///c:/Users/USER/Leoned/src/app/layout.tsx)
- Modify the inline head script to read `schoolTheme.primaryColor` from `localStorage` (`leoned_user` object) instead of `leoned_theme`, and dynamically set `--theme-primary` on `document.documentElement`.

#### [MODIFY] [dashboard/settings/page.tsx](file:///c:/Users/USER/Leoned/src/app/dashboard/settings/page.tsx)
- Remove the local Theme selection UI from the appearance settings.
- Ensure any visual settings reflect the synced School Profile theme colors.

### 5. Payment Checkout callbackUrl
#### [MODIFY] [dashboard/settings/page.tsx](file:///c:/Users/USER/Leoned/src/app/dashboard/settings/page.tsx) (or where payment is initialized)
- Pass `callbackUrl: window.location.origin + "/payment/callback"` inside `paymentApi.subscribe({ planId, callbackUrl })`.

### 6. Super Admin Manual Upgrade
#### [MODIFY] [super-admin/schools/page.tsx](file:///c:/Users/USER/Leoned/src/app/super-admin/schools/page.tsx)
- Add a "Manual Upgrade" action next to each school in the table.
- Create a modal allowing the Super Admin to select a `planId` and `durationMonths`.
- Call the `/api/payment/schools/{id}/upgrade-manual` endpoint.

## Open Questions
> [!IMPORTANT]  
> 1. For the fee clearance `amountPaid`, when an admin clicks the "Tick" to approve/clear, should we assume the `amountPaid` equals the full `amountDue`, or do you want a prompt to let them type in a partial/exact amount?
> 2. For the Payment callbackUrl, is there a specific route you want to redirect back to (e.g. `/dashboard/settings?section=billing`) or just the frontend root `/`?

## Verification Plan
### Automated Tests
- `npm run build` to verify TypeScript compile constraints.
### Manual Verification
- Login as SchoolAdmin, test the clear fee tick box.
- Login as SuperAdmin, check dashboard without Revenue card, and Plans dashboard with Revenue card.
- Navigate the registration process to ensure the plan selection is removed.
- Set a custom primary color to test the dynamic school theme injection.
