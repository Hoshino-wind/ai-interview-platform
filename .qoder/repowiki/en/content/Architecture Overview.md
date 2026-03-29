# Architecture Overview

<cite>
**Referenced Files in This Document**
- [layout.tsx](file://smartview-portal/src/app/layout.tsx)
- [page.tsx](file://smartview-portal/src/app/page.tsx)
- [package.json](file://smartview-portal/package.json)
- [next.config.mjs](file://smartview-portal/next.config.mjs)
- [tailwind.config.ts](file://smartview-portal/tailwind.config.ts)
- [Header.tsx](file://smartview-portal/src/components/layout/Header.tsx)
- [Footer.tsx](file://smartview-portal/src/components/layout/Footer.tsx)
- [Button.tsx](file://smartview-portal/src/components/ui/Button.tsx)
- [constants.ts](file://smartview-portal/src/lib/constants.ts)
- [utils.ts](file://smartview-portal/src/lib/utils.ts)
- [HeroSection.tsx](file://smartview-portal/src/components/home/HeroSection.tsx)
- [FeaturesOverview.tsx](file://smartview-portal/src/components/home/FeaturesOverview.tsx)
- [about/page.tsx](file://smartview-portal/src/app/about/page.tsx)
- [features/page.tsx](file://smartview-portal/src/app/features/page.tsx)
- [pricing/page.tsx](file://smartview-portal/src/app/pricing/page.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the architecture of the SmartView Portal Next.js application. It focuses on the Next.js 14 App Router design, file-based routing, layered architecture (pages, components, utilities, configuration), and the design system built with Tailwind CSS, Radix UI, and TypeScript. It also outlines system boundaries, component interactions, and data flow patterns, along with architectural decisions, constraints, and scalability considerations.

## Project Structure
SmartView Portal follows Next.js 14’s App Router conventions:
- Pages are defined under src/app with route segments (e.g., /, /about, /features, /pricing).
- Shared layouts are defined in src/app/layout.tsx and composed per-route.
- UI primitives and reusable components live under src/components.
- Design system utilities and shared constants live under src/lib.
- Build-time configuration is centralized in next.config.mjs and Tailwind configuration in tailwind.config.ts.

```mermaid
graph TB
subgraph "App Router"
ROOT["src/app/layout.tsx"]
HOME["src/app/page.tsx"]
ABOUT["src/app/about/page.tsx"]
FEATURES["src/app/features/page.tsx"]
PRICING["src/app/pricing/page.tsx"]
end
subgraph "Components"
HEADER["src/components/layout/Header.tsx"]
FOOTER["src/components/layout/Footer.tsx"]
BUTTON["src/components/ui/Button.tsx"]
HSECTION["src/components/home/HeroSection.tsx"]
FOSECTION["src/components/home/FeaturesOverview.tsx"]
end
subgraph "Lib"
CONST["src/lib/constants.ts"]
UTILS["src/lib/utils.ts"]
end
subgraph "Config"
NEXTCFG["next.config.mjs"]
TWC["tailwind.config.ts"]
end
ROOT --> HEADER
ROOT --> HOME
ROOT --> ABOUT
ROOT --> FEATURES
ROOT --> PRICING
ROOT --> FOOTER
HOME --> HSECTION
HOME --> FOSECTION
HEADER --> BUTTON
HEADER --> CONST
BUTTON --> UTILS
HSECTION --> BUTTON
FOSECTION --> BUTTON
NEXTCFG --> TWC
```

**Diagram sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)
- [page.tsx:1-18](file://smartview-portal/src/app/page.tsx#L1-L18)
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)
- [Footer.tsx:1-127](file://smartview-portal/src/components/layout/Footer.tsx#L1-L127)
- [Button.tsx:1-54](file://smartview-portal/src/components/ui/Button.tsx#L1-L54)
- [HeroSection.tsx:1-125](file://smartview-portal/src/components/home/HeroSection.tsx#L1-L125)
- [FeaturesOverview.tsx:1-74](file://smartview-portal/src/components/home/FeaturesOverview.tsx#L1-L74)
- [constants.ts:1-11](file://smartview-portal/src/lib/constants.ts#L1-L11)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)
- [next.config.mjs:1-5](file://smartview-portal/next.config.mjs#L1-L5)
- [tailwind.config.ts:1-20](file://smartview-portal/tailwind.config.ts#L1-L20)

**Section sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)
- [page.tsx:1-18](file://smartview-portal/src/app/page.tsx#L1-L18)
- [package.json:1-32](file://smartview-portal/package.json#L1-L32)
- [next.config.mjs:1-5](file://smartview-portal/next.config.mjs#L1-L5)
- [tailwind.config.ts:1-20](file://smartview-portal/tailwind.config.ts#L1-L20)

## Core Components
- Root layout composes global styles, fonts, and shared header/footer around page content.
- Home page composes marketing sections (hero, features overview, how-it-works, stats, CTA).
- Layout components (Header, Footer) coordinate navigation, branding, and responsive behavior.
- UI primitive (Button) encapsulates variant and size variants with composition via Radix Slot.
- Shared utilities (constants, cn) centralize site metadata, navigation links, and class merging.

Key responsibilities:
- Root layout: global metadata, typography, and page scaffolding.
- Home page: orchestrates marketing sections.
- Header: navigation, scroll-aware styling, mobile menu, and responsive breakpoints.
- Footer: multi-column links and contact info.
- Button: consistent styling and semantic composition.
- Constants: site identity and nav links.
- Utils: cross-cutting class merging and composition helpers.

**Section sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)
- [page.tsx:1-18](file://smartview-portal/src/app/page.tsx#L1-L18)
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)
- [Footer.tsx:1-127](file://smartview-portal/src/components/layout/Footer.tsx#L1-L127)
- [Button.tsx:1-54](file://smartview-portal/src/components/ui/Button.tsx#L1-L54)
- [constants.ts:1-11](file://smartview-portal/src/lib/constants.ts#L1-L11)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)

## Architecture Overview
SmartView Portal uses a layered architecture:
- Pages layer: route handlers under src/app implementing page components.
- Components layer: reusable UI and layout components under src/components.
- Utilities layer: constants and shared utilities under src/lib.
- Configuration layer: Next.js and Tailwind configurations.

System boundaries:
- App Router boundary: route segment resolution and page rendering.
- Component boundary: props contracts and composition patterns.
- Utility boundary: shared logic for styling and constants.
- Config boundary: build-time and design system configuration.

```mermaid
graph TB
subgraph "Pages"
P_HOME["Home Page<br/>src/app/page.tsx"]
P_ABOUT["About Page<br/>src/app/about/page.tsx"]
P_FEATURES["Features Page<br/>src/app/features/page.tsx"]
P_PRICING["Pricing Page<br/>src/app/pricing/page.tsx"]
end
subgraph "Layout"
L_ROOT["Root Layout<br/>src/app/layout.tsx"]
L_HEADER["Header<br/>src/components/layout/Header.tsx"]
L_FOOTER["Footer<br/>src/components/layout/Footer.tsx"]
end
subgraph "UI Primitives"
U_BUTTON["Button<br/>src/components/ui/Button.tsx"]
end
subgraph "Shared"
S_CONST["Constants<br/>src/lib/constants.ts"]
S_UTILS["Utils<br/>src/lib/utils.ts"]
end
L_ROOT --> L_HEADER
L_ROOT --> P_HOME
L_ROOT --> P_ABOUT
L_ROOT --> P_FEATURES
L_ROOT --> P_PRICING
L_ROOT --> L_FOOTER
P_HOME --> U_BUTTON
L_HEADER --> U_BUTTON
L_HEADER --> S_CONST
U_BUTTON --> S_UTILS
```

**Diagram sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)
- [page.tsx:1-18](file://smartview-portal/src/app/page.tsx#L1-L18)
- [about/page.tsx:1-303](file://smartview-portal/src/app/about/page.tsx#L1-L303)
- [features/page.tsx:1-564](file://smartview-portal/src/app/features/page.tsx#L1-L564)
- [pricing/page.tsx:1-246](file://smartview-portal/src/app/pricing/page.tsx#L1-L246)
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)
- [Footer.tsx:1-127](file://smartview-portal/src/components/layout/Footer.tsx#L1-L127)
- [Button.tsx:1-54](file://smartview-portal/src/components/ui/Button.tsx#L1-L54)
- [constants.ts:1-11](file://smartview-portal/src/lib/constants.ts#L1-L11)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)

## Detailed Component Analysis

### Root Layout and Global Composition
Root layout defines metadata, font loading, global CSS, and wraps all pages with a consistent header and footer. It sets up the main content area and ensures consistent typography and spacing.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Next as "Next.js Runtime"
participant Root as "RootLayout<br/>src/app/layout.tsx"
participant Header as "Header<br/>src/components/layout/Header.tsx"
participant Footer as "Footer<br/>src/components/layout/Footer.tsx"
Browser->>Next : Request route
Next->>Root : Render root layout
Root->>Header : Render header
Root->>Footer : Render footer
Root-->>Browser : HTML with global styles and layout
```

**Diagram sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)
- [Footer.tsx:1-127](file://smartview-portal/src/components/layout/Footer.tsx#L1-L127)

**Section sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)

### Home Page Composition
The home page composes multiple marketing sections. Each section is a self-contained component that renders specific UI blocks.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Home as "Home Page<br/>src/app/page.tsx"
participant Hero as "HeroSection<br/>src/components/home/HeroSection.tsx"
participant Features as "FeaturesOverview<br/>src/components/home/FeaturesOverview.tsx"
Browser->>Home : Navigate to "/"
Home->>Hero : Render hero block
Home->>Features : Render features overview
Hero-->>Browser : Rendered hero section
Features-->>Browser : Rendered features section
```

**Diagram sources**
- [page.tsx:1-18](file://smartview-portal/src/app/page.tsx#L1-L18)
- [HeroSection.tsx:1-125](file://smartview-portal/src/components/home/HeroSection.tsx#L1-L125)
- [FeaturesOverview.tsx:1-74](file://smartview-portal/src/components/home/FeaturesOverview.tsx#L1-L74)

**Section sources**
- [page.tsx:1-18](file://smartview-portal/src/app/page.tsx#L1-L18)

### Header Component Interaction
Header manages scroll-aware styling, mobile menu toggling, and navigation highlighting based on current path. It consumes constants for navigation and uses the shared Button primitive.

```mermaid
flowchart TD
Start(["Header mount"]) --> Scroll["Listen to scroll events"]
Scroll --> IsScrolled{"Scrolled > threshold?"}
IsScrolled --> |Yes| ApplyBlur["Apply backdrop blur and shadow"]
IsScrolled --> |No| ResetStyles["Reset to transparent"]
Start --> Pathname["Read current path"]
Pathname --> Highlight["Highlight active nav item"]
Start --> MobileToggle["Toggle mobile menu"]
MobileToggle --> RenderMenu["Render mobile menu panel"]
RenderMenu --> CloseOnSelect["Close on link click"]
```

**Diagram sources**
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)
- [constants.ts:1-11](file://smartview-portal/src/lib/constants.ts#L1-L11)
- [Button.tsx:1-54](file://smartview-portal/src/components/ui/Button.tsx#L1-L54)

**Section sources**
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)

### Button Primitive and Variants
Button implements a variant system using class-variance-authority and composition via Radix Slot. It merges classes using the shared cn utility.

```mermaid
classDiagram
class Button {
+variant : "primary" | "secondary" | "outline" | "ghost"
+size : "sm" | "md" | "lg"
+asChild : boolean
+render()
}
class Utils {
+cn(...inputs) : string
}
Button --> Utils : "uses cn() for class merging"
```

**Diagram sources**
- [Button.tsx:1-54](file://smartview-portal/src/components/ui/Button.tsx#L1-L54)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)

**Section sources**
- [Button.tsx:1-54](file://smartview-portal/src/components/ui/Button.tsx#L1-L54)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)

### Design System and Tailwind Integration
Tailwind is configured to scan pages, components, and app directories. The design system relies on:
- Tailwind utilities for layout and colors.
- CSS variables for theme tokens.
- Utility function cn for safe class merging.

```mermaid
graph LR
TW["Tailwind Config<br/>tailwind.config.ts"] --> Scan["content globs"]
Scan --> Pages["src/app/**/*.{js,ts,jsx,tsx,mdx}"]
Scan --> Components["src/components/**/*.{js,ts,jsx,tsx,mdx}"]
Scan --> AppDir["src/app/**/*.{js,ts,jsx,tsx,mdx}"]
TW --> Theme["theme.extend.colors"]
Theme --> Tokens["CSS variables (--background, --foreground)"]
```

**Diagram sources**
- [tailwind.config.ts:1-20](file://smartview-portal/tailwind.config.ts#L1-L20)

**Section sources**
- [tailwind.config.ts:1-20](file://smartview-portal/tailwind.config.ts#L1-L20)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)

### Additional Pages: About, Features, Pricing
These pages demonstrate consistent composition patterns:
- About page: structured sections for vision, mission, problems solved, team, tech advantages, and CTA.
- Features page: detailed feature showcases with interactive elements and visual mockups.
- Pricing page: plan cards, feature lists, and FAQ sections.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant About as "About Page<br/>src/app/about/page.tsx"
participant Features as "Features Page<br/>src/app/features/page.tsx"
participant Pricing as "Pricing Page<br/>src/app/pricing/page.tsx"
Browser->>About : Navigate to "/about"
About-->>Browser : Rendered about sections
Browser->>Features : Navigate to "/features"
Features-->>Browser : Rendered feature sections
Browser->>Pricing : Navigate to "/pricing"
Pricing-->>Browser : Rendered pricing sections
```

**Diagram sources**
- [about/page.tsx:1-303](file://smartview-portal/src/app/about/page.tsx#L1-L303)
- [features/page.tsx:1-564](file://smartview-portal/src/app/features/page.tsx#L1-L564)
- [pricing/page.tsx:1-246](file://smartview-portal/src/app/pricing/page.tsx#L1-L246)

**Section sources**
- [about/page.tsx:1-303](file://smartview-portal/src/app/about/page.tsx#L1-L303)
- [features/page.tsx:1-564](file://smartview-portal/src/app/features/page.tsx#L1-L564)
- [pricing/page.tsx:1-246](file://smartview-portal/src/app/pricing/page.tsx#L1-L246)

## Dependency Analysis
External dependencies and their roles:
- Next.js runtime and App Router for file-based routing and SSR/SSG.
- React and React DOM for UI rendering.
- Tailwind CSS for utility-first styling.
- Radix UI Slot for component composition.
- class-variance-authority for variant systems.
- lucide-react for icons.
- clsx and tailwind-merge for class merging.

```mermaid
graph TB
APP["SmartView Portal"]
NEXT["next"]
REACT["react + react-dom"]
TAILWIND["tailwindcss"]
RADIX["@radix-ui/react-slot"]
CVA["class-variance-authority"]
ICONS["lucide-react"]
CLSX["clsx"]
TM["tailwind-merge"]
APP --> NEXT
APP --> REACT
APP --> TAILWIND
APP --> RADIX
APP --> CVA
APP --> ICONS
APP --> CLSX
APP --> TM
```

**Diagram sources**
- [package.json:1-32](file://smartview-portal/package.json#L1-L32)

**Section sources**
- [package.json:1-32](file://smartview-portal/package.json#L1-L32)

## Performance Considerations
- File-based routing minimizes dynamic routing overhead and enables static generation where applicable.
- Component composition reduces duplication and improves maintainability.
- Tailwind scanning scope can be optimized to reduce build times; current globs cover pages, components, and app directories.
- Using CSS variables for theme tokens avoids unnecessary re-renders.
- Prefer client components only when necessary (e.g., Header uses client directives for interactivity).

## Troubleshooting Guide
Common areas to check:
- Routing issues: Verify route segment names match file paths under src/app.
- Layout problems: Confirm RootLayout wraps children and includes global styles.
- Styling inconsistencies: Ensure cn is used for class merging and Tailwind content globs include new components.
- Navigation highlights: Confirm usePathname matches NAV_LINKS href values.

**Section sources**
- [layout.tsx:1-33](file://smartview-portal/src/app/layout.tsx#L1-L33)
- [Header.tsx:1-131](file://smartview-portal/src/components/layout/Header.tsx#L1-L131)
- [constants.ts:1-11](file://smartview-portal/src/lib/constants.ts#L1-L11)
- [utils.ts:1-7](file://smartview-portal/src/lib/utils.ts#L1-L7)
- [tailwind.config.ts:1-20](file://smartview-portal/tailwind.config.ts#L1-L20)

## Conclusion
SmartView Portal leverages Next.js 14 App Router to deliver a modular, scalable frontend. The design system centers on Tailwind CSS, a composable Button primitive, and shared constants/utilities. The layered architecture promotes separation of concerns, while file-based routing simplifies navigation and improves performance. The approach supports future growth through consistent component composition and configurable design tokens.