# IREXA - Spatial Intelligence Interface

A Next.js web application featuring an advanced spatial intelligence interface with 3D visualizations, scroll-driven animations, and a technical UI design.

## Features

- **Three.js 3D Scene**: Interactive WebGL terrain and building visualizations
- **Scroll-Driven Animations**: Camera movement and 3D extrusion based on scroll progress
- **Smooth Scrolling**: Lenis-powered smooth scroll experience
- **Technical UI**: Coordinate indicators, scan animations, and system labels
- **Responsive Design**: Optimized for desktop and mobile devices
- **Performance Optimized**: Instanced meshes and lightweight shaders

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Fonts**: Sora (headlines), Space Grotesk (labels)
- **Smooth Scroll**: Lenis

## Project Structure

```
app/
├── globals.css
├── layout.tsx
├── page.tsx

components/
├── hero/
│   └── HeroSection.tsx
├── map/
│   └── MapScene.tsx
├── sections/
│   └── NarrativeSections.tsx
├── three/
│   ├── objects/
│   │   ├── Buildings.tsx
│   │   ├── ScanBeam.tsx
│   │   └── Terrain.tsx
│   └── scenes/
├── ui/
│   ├── CoordinateIndicator.tsx
│   └── ScanAnimation.tsx

lib/
├── hooks/
│   └── useScrollProgress.ts
├── utils/
│   └── SmoothScroll.tsx
```

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Build

```bash
pnpm build
```

## Color Scheme

- Background: Black (#000000)
- Text: White (#FFFFFF)
- Accent: Green (#00FF9C) - used for detections, AI indicators, highlights

## Typography

- Headlines: Sora
- Technical Labels: Space Grotesk
- Body Text: Sora

## Accessibility

- Semantic HTML structure
- Sufficient color contrast
- Keyboard navigation support
- Screen reader friendly content

## Performance

- Instanced meshes for buildings
- Lightweight shaders
- Transform-based animations
- Minimal geometry usage
