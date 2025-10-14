# Bookly Mobile Optimization Guide

## Overview
This guide provides a comprehensive approach to making Bookly mobile-responsive across all pages and components.

## Mobile Breakpoints (Tailwind CSS)
- **sm**: 640px (small phones in landscape, tablets in portrait)
- **md**: 768px (tablets)
- **lg**: 1024px (small desktops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large desktops)

## Key Principles

### 1. Mobile-First Approach
- Write styles for mobile first, then add breakpoints for larger screens
- Use min-width media queries (default in Tailwind)

### 2. Touch-Friendly Targets
- Minimum touch target: 44x44px (iOS) or 48x48px (Material Design)
- Buttons, links, and interactive elements should be easy to tap

### 3. Readable Text
- Minimum font size: 16px for body text (prevents zoom on iOS)
- Line height: 1.5-1.6 for readability
- Sufficient contrast ratios

### 4. Navigation
- Hamburger menu for mobile
- Bottom tab bar for main actions
- Sticky headers when needed

### 5. Forms
- Large input fields (min-height: 44px)
- Proper input types for mobile keyboards
- Clear labels and error messages

## Component-Specific Optimizations

### Modals
```tsx
// Mobile-optimized modal wrapper
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
  <div className="bg-white dark:bg-gray-800
                  w-full sm:max-w-md sm:rounded-xl
                  max-h-[90vh] sm:max-h-[80vh]
                  overflow-y-auto
                  rounded-t-2xl sm:rounded-xl
                  animate-slide-up sm:animate-fade-in">
    {/* Modal content */}
  </div>
</div>
```

### Cards
```tsx
<div className="p-4 sm:p-6
                rounded-lg sm:rounded-xl
                space-y-3 sm:space-y-4">
  {/* Card content */}
</div>
```

### Grids
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Grid items */}
</div>
```

### Typography
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
<p className="text-sm sm:text-base">
```

### Spacing
```tsx
<div className="px-4 sm:px-6 lg:px-8">
<div className="py-4 sm:py-6 lg:py-8">
```

## Page-Specific Optimizations

### 1. Landing Page
- Hero section: Full viewport height on mobile
- Feature cards: Stack on mobile, grid on desktop
- CTA buttons: Full width on mobile
- Images: Optimized for mobile data

### 2. Search Page
- Filters: Drawer/sheet on mobile, sidebar on desktop
- List/Map toggle: Tabs on mobile
- Business cards: Full width on mobile
- Pagination: Compact on mobile

### 3. Business Details Page
- Image gallery: Swiper/carousel on mobile
- Booking button: Sticky at bottom on mobile
- Branch selector: Bottom sheet on mobile
- Reviews: Collapsed by default on mobile

### 4. Booking Modal
- Full screen on mobile, dialog on desktop
- Step indicator: Compact on mobile
- Form fields: Stacked on mobile
- Submit button: Sticky at bottom

### 5. Profile Page
- Tabs: Scrollable horizontal on mobile
- Forms: Single column on mobile
- Avatar: Centered on mobile

## Testing Checklist

### Functionality
- [ ] All buttons are tappable (min 44x44px)
- [ ] Forms work with mobile keyboards
- [ ] Modals/drawers open and close smoothly
- [ ] Navigation is accessible
- [ ] Images load properly

### Layout
- [ ] No horizontal scroll
- [ ] Content fits within viewport
- [ ] Spacing is comfortable
- [ ] Text is readable without zoom
- [ ] Touch targets don't overlap

### Performance
- [ ] Images are optimized
- [ ] Critical CSS is inlined
- [ ] JavaScript is lazy-loaded
- [ ] Fonts load efficiently

### Devices to Test
- iPhone SE (375px width)
- iPhone 12/13/14 (390px width)
- iPhone 14 Pro Max (428px width)
- Samsung Galaxy S20 (360px width)
- iPad (768px width)
- iPad Pro (1024px width)

## Utilities and Helpers

### Responsive Container
```tsx
className="container mx-auto px-4 sm:px-6 lg:px-8"
```

### Responsive Padding
```tsx
className="p-4 sm:p-6 lg:p-8"
```

### Responsive Grid
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Responsive Text
```tsx
className="text-sm sm:text-base lg:text-lg"
```

### Hide/Show on Mobile
```tsx
className="hidden sm:block" // Hide on mobile
className="block sm:hidden" // Show only on mobile
```

## Common Patterns

### Sticky Header
```tsx
<header className="sticky top-0 z-40 bg-white border-b">
  <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center">
    {/* Header content */}
  </div>
</header>
```

### Bottom Action Bar (Mobile)
```tsx
<div className="fixed bottom-0 left-0 right-0 sm:hidden
                bg-white border-t p-4 safe-area-bottom">
  <button className="w-full h-12 bg-primary rounded-lg">
    Book Now
  </button>
</div>
```

### Responsive Sidebar
```tsx
{/* Mobile: Drawer */}
<div className="lg:hidden">
  <Sheet>
    <SheetContent side="left">
      {/* Sidebar content */}
    </SheetContent>
  </Sheet>
</div>

{/* Desktop: Fixed Sidebar */}
<aside className="hidden lg:block w-64 fixed">
  {/* Sidebar content */}
</aside>
```

## Implementation Steps

1. **Audit** - Check each page on mobile devices
2. **Prioritize** - Start with most-used pages
3. **Implement** - Apply mobile-first responsive classes
4. **Test** - Use browser dev tools + real devices
5. **Optimize** - Improve performance
6. **Document** - Update this guide with learnings
