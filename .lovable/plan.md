

## Update Same-Day Delivery Price and Add T&C Tooltip

### Changes Overview

Update the price from $899 to $1,199 across all mentions, and add a "T&C Apply" text styled as a link that shows a tooltip on hover with the terms and conditions.

### Files to Modify

#### 1. `src/components/HeroSection.tsx`
- Change `$899` to `$1,199`
- Add "T&C Apply" with a hover tooltip after the same-day delivery text

#### 2. `src/components/PricingSection.tsx`
- Change `$899` in the subtitle to `$1,199`
- Add "T&C Apply" tooltip next to the same-day delivery mention in the subtitle
- Add "T&C Apply" tooltip inside the Simple package card's "Same-day turnaround" feature line

#### 3. `src/components/WhyUsSection.tsx`
- Change `$899` to `$1,199` in the Same-Day Delivery card description
- Add "T&C Apply" with hover tooltip

### Tooltip Content (all locations use the same text)

- Applies to all Simple and eligible Medium Builds
- Advance and Complex Builds do not qualify for Same Day Deliveries
- Pre-Requisites for same day delivery -- Creative Assets Like Event Banner, Headers, Fonts, Branding Guidelines, Text Copies should be readily available. Also event logistics like number of registration types, sessions, Event Ticket types should be available from the onset.
- Delays in handing the information will lead to delivery deadline being pushed

### Technical Approach

- Use the existing Radix `Tooltip` component (`src/components/ui/tooltip.tsx`) already installed in the project
- The "T&C Apply" text will be styled with an underline and primary color to look like a clickable link
- The tooltip will display the bullet-pointed terms on hover
- The `TooltipProvider` is already rendered in `App.tsx`, so tooltips will work globally

