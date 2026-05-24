---
name: PingBee
version: 1.0.0
tokens:
  colors:
    brand:
      primary:
        light: "#F5A623" # Honey Gold
        dark: "#FFB833" # Bright Amber
      primaryDark:
        light: "#C4841D" # Deep Amber
        dark: "#D4922A" # Dark Honey
      secondary:
        light: "#3C3C3C" # Warm Charcoal
        dark: "#E5E5EA" # Light Gray
      accent:
        light: "#FFD700" # Bee Stripe Gold
        dark: "#FFD700" # Bee Stripe Gold
    backgrounds:
      default:
        light: "#FFFDF7" # Cream White
        dark: "#1A1A1A" # Deep Black
      elevated:
        light: "#FFFFFF" # Pure White
        dark: "#2C2C2E" # Elevated Surface
    surfaces:
      default:
        light: "#FFF8ED" # Soft Honey
        dark: "#2C2C2E" # Dark Surface
      secondary:
        light: "#FFF1DC" # Warm Honey Tint
        dark: "#3A3A3C" # Lighter Dark Surface
      tertiary:
        light: "#FFE8C2" # Deep Honey Tint
        dark: "#48484A" # Tertiary Dark Surface
    text:
      primary:
        light: "#1C1C1E" # Near Black
        dark: "#F5F5F5" # Off White
      secondary:
        light: "#8E8E93" # Muted Gray
        dark: "#A1A1A6" # Muted Light
      tertiary:
        light: "#C7C7CC" # Light Gray
        dark: "#636366" # Dimmed
      inverse:
        light: "#FFFFFF"
        dark: "#1C1C1E"
      onPrimary:
        light: "#FFFFFF"
        dark: "#1A1A1A"
    borders:
      default:
        light: "#E8D5B5" # Light Honey
        dark: "#48484A" # Dark Border
      light:
        light: "#F0E6D2" # Faint Honey
        dark: "#3A3A3C" # Subtle Dark Border
      separator:
        light: "#E5DFD6" # Subtle separator
        dark: "#38383A" # Dark separator
    absolute:
      midnightNavy: "#0E263D" # Deep logo background
    semantic:
      error:
        light: "#FF3B30"
        dark: "#FF453A"
      success:
        light: "#34C759"
        dark: "#30D158"
      warning:
        light: "#FF9500"
        dark: "#FF9F0A"
      info:
        light: "#007AFF"
        dark: "#0A84FF"
  typography:
    family:
      primary: "System"
    size:
      xs: "12px"
      sm: "14px"
      md: "16px"
      lg: "18px"
      xl: "24px"
      xxl: "32px"
    weight:
      regular: 400
      medium: 500
      semiBold: 600
      bold: 700
  spacing:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    xxl: "48px"
  radii:
    sm: "4px"
    md: "8px"
    lg: "12px"
    xl: "24px"
    pill: "9999px"
  shadows:
    menu: "0 4px 12px rgba(0, 0, 0, 0.12)"
    modal: "0 2px 4px rgba(0, 0, 0, 0.25)"
---

# PingBee Design System

PingBee is a modern communication platform built with a warm, "bee-themed" visual identity. It balances professional utility with a friendly, inviting aesthetic through its unique honey-gold color palette and soft, rounded interfaces.

## Design Intent

The design system is centered around the concept of a **"Digital Hive"** — a place of constant activity, organization, and warmth. This intent is realized through:

- **Warmth & Friendliness**: The primary use of honey golds and cream whites creates a welcoming environment, departing from the clinical "tech-blue" common in messaging apps.
- **Clarity & Focus**: A strong typographic hierarchy and generous spacing ensure that content is always readable and interaction points are obvious.
- **Tactile Surfaces**: Interactive elements use subtle elevations, shadows, and consistent corner radii to feel tangible and responsive.

## Color Palette

### Brand Identity
The brand is defined by **Honey Gold** (#F5A623) and **Deep Amber** (#C4841D). In dark mode, these shift to **Bright Amber** (#FFB833) to maintain high contrast and vibrant energy. The **Bee Stripe Gold** (#FFD700) is used as an accent, while **Midnight Navy** (#0E263D) provides a grounding contrast for branding elements and logos.

### Surfaces & Depth
PingBee avoids flat design in favor of "layered" surfaces.
- **Light Mode**: Uses a soft **Cream White** (#FFFDF7) base with warmer honey tints for secondary and tertiary surfaces, creating a sense of natural depth.
- **Dark Mode**: Uses a deep, near-black charcoal base (#1A1A1A) with elevated surfaces using varying shades of dark gray to represent proximity to the user.

## Typography

The typography system uses the native system font for optimal performance and familiarity.
- **Headings**: Bold and expressive, using `xxl` (32px) and `xl` (24px) for major titles.
- **Body**: Standardized at `md` (16px) with a `regular` (400) weight for readability, and `medium` (500) for emphasis.
- **Semantic Variants**: Predetermined styles like `subheading`, `caption`, and `description` ensure consistency across all screens.

## Layout & Components

### Spacing & Grid
A strict 4px/8px incremental spacing system (`xs` to `xxl`) ensures rhythmic alignment. This consistency helps users build a mental map of the interface.

### Corner Radii
Rounded corners are a signature of the PingBee aesthetic.
- **Buttons & Cards**: Use `lg` (12px) or `xl` (24px) for a soft, friendly look.
- **Pills**: Used for indicators and tags to create a distinct visual shape.

### Interactive Elements
- **Buttons**: Full-width primary buttons with large touch targets (56px height) provide a confident primary action.
- **Menus & Modals**: These "float" above the background using distinct shadows and borders, anchoring the user's attention during focused interactions.
- **Transitions**: Subtle fades and shared element transitions (like profile images) create a fluid, continuous experience through the app.

## Iconography
Icons are sized systematically (`xs` to `xxl`) and usually rendered in the primary brand color or a high-contrast text color to ensure they are both decorative and functional.
