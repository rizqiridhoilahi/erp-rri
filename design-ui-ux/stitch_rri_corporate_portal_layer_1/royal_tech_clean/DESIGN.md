---
name: Royal Tech & Clean
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#454558'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757589'
  outline-variant: '#c5c4db'
  surface-tint: '#343dff'
  primary: '#0001bb'
  on-primary: '#ffffff'
  primary-container: '#0000ff'
  on-primary-container: '#b3b7ff'
  inverse-primary: '#bec2ff'
  secondary: '#555e75'
  on-secondary: '#ffffff'
  secondary-container: '#d9e2fd'
  on-secondary-container: '#5b647b'
  tertiary: '#283648'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f4d5f'
  on-tertiary-container: '#afbed3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bec2ff'
  on-primary-fixed: '#00006e'
  on-primary-fixed-variant: '#0000ef'
  secondary-fixed: '#d9e2fd'
  secondary-fixed-dim: '#bdc6e0'
  on-secondary-fixed: '#121b2f'
  on-secondary-fixed-variant: '#3d475c'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 80px
---

## Brand & Style
This design system establishes a high-authority B2B presence for a general supplier, blending "Royal Tech" precision with "Luxury Corporate" cleanliness. The brand personality is dependable, elite, and technologically advanced. 

The aesthetic leverages **Glassmorphism** for a layered, sophisticated feel, combined with a **Corporate Modern** foundation. It uses high-contrast anchor points—Deep Sovereign Navy—against airy, expansive white space to evoke a sense of structural integrity and premium service. The user experience should feel efficient yet luxurious, prioritizing clarity and professional confidence.

## Colors
The palette is rooted in a tri-color hierarchy that balances high-energy tech signals with sovereign stability.

- **Pure Electric Blue (#0000FF):** Used exclusively for actionable items, primary CTAs, and active progress indicators. It serves as the "Tech" heartbeat of the system.
- **Deep Sovereign Navy (#0B1528):** The anchor color. Used for headers, navigation backgrounds, and primary headings to establish authority and a "Royal" corporate tone.
- **Platinum Slate (#94A3B8 / #E2E8F0):** Provides the structural framework. Used for thin borders, subtle dividers, and secondary text.
- **Backgrounds:** The interface breathes through **Pure White (#FFFFFF)** for main content areas and **Light Ice Gray (#F8FAFC)** for subtle section grouping and depth layering.

## Typography
The typography strategy contrasts the geometric, wide-tracking nature of **Lexend** with the utilitarian precision of **Inter**.

**Lexend** is reserved for headings and displays. Its bold weights and wide tracking (0.01em to 0.02em) convey a modern, expansive feel associated with high-end tech firms. 

**Inter** handles all functional and body text. It provides maximum legibility for complex B2B logistics data and supply lists. Letter-spacing is slightly increased for uppercase labels to maintain the premium, "airy" feel across functional UI elements.

## Layout & Spacing
The system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A generous spacing rhythm (8px base unit) is applied to ensure the UI feels uncrowded and "luxury."

- **Desktop:** 1280px max-width container, centered. Use 40px side margins to create a "framed" look.
- **Vertical Rhythm:** Sections are separated by large gaps (80px+) to allow the brand's premium imagery and navy blocks to stand out.
- **Alignment:** Consistent left-alignment for text to maintain a professional, structured corporate appearance.

## Elevation & Depth
Depth is achieved through a combination of **Glassmorphism** and **Ambient Shadows**.

1.  **Glass Layers:** Use `backdrop-blur-md` on navigation bars and floating cards. When placed over white backgrounds, use a 70% white opacity. When placed over Deep Sovereign Navy, use a 40% navy opacity to create a "translucent dark glass" effect.
2.  **Soft Shadows:** Shadows must be highly diffused and low-opacity. Use a subtle blue tint in the shadow color (`#0B1528` at 5-8% opacity) rather than pure black to keep the palette clean and professional.
3.  **Borders:** Use 1px solid `accent_slate_light` for standard containment and `primary_color_hex` for active-state focus rings.

## Shapes
The design system uses a **Rounded (8px)** corner strategy. This provides a modern, approachable feel while maintaining enough "sharpness" to remain professional and corporate. 

- **Cards/Containers:** 8px (`rounded-md`).
- **Interactive Elements:** Buttons and Inputs follow the 8px standard.
- **Large Sections:** Background navy containers can use larger radii (24px) on top corners when transitioning from white sections to create a soft "layering" effect.

## Components
Consistent styling for the core B2B toolkit:

- **Primary Buttons:** Pure Electric Blue background, white Lexend text (Bold). High-gloss finish or subtle 2px bottom-heavy shadow.
- **Secondary Buttons:** Transparent background with 1px Platinum Slate border. Navy text.
- **Glass Cards:** White background at 80% opacity with `backdrop-blur-lg`. 1px border in Light Ice Gray. Used for product features and supply categories.
- **Input Fields:** 1px Platinum Slate border. On focus, the border transitions to Pure Electric Blue with a soft 4px glow.
- **Chips/Badges:** Used for status (e.g., "In Stock", "Verified"). Subtle Light Ice Gray backgrounds with Navy text, or Electric Blue background for high-priority alerts.
- **Navigation:** Top-fixed bar with a Deep Sovereign Navy glass effect. Menu items in Lexend (Medium) with Pure Electric Blue underlines on hover.
- **Lists:** Clean rows with 1px horizontal dividers. Use Inter for list items with increased line height for readability.