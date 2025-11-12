# Company Components

This directory contains reusable UI components for displaying company information throughout the CodeUnia platform.

## Components

### CompanyBadge

A compact inline component for displaying company logo and name with optional verification badge.

**Props:**
- `company: Company` - The company object
- `size?: 'sm' | 'md' | 'lg'` - Size variant (default: 'md')
- `showName?: boolean` - Whether to show company name (default: true)
- `showVerification?: boolean` - Whether to show verification badge (default: true)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { CompanyBadge } from '@/components/companies'

<CompanyBadge company={company} size="sm" />
```

### CompanyCard

A card component for displaying company information in listing views.

**Props:**
- `company: Company` - The company object
- `showStats?: boolean` - Whether to show event/participant stats (default: true)
- `showVerificationBadge?: boolean` - Whether to show verification badge (default: true)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { CompanyCard } from '@/components/companies'

<CompanyCard company={company} showStats={true} />
```

### CompanyProfile

A comprehensive profile component for displaying full company details.

**Props:**
- `company: Company` - The company object
- `isOwner?: boolean` - Whether the current user owns this company (default: false)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { CompanyProfile } from '@/components/companies'

<CompanyProfile company={company} isOwner={true} />
```

### VerificationBadge

A badge component for displaying company verification status.

**Props:**
- `status: 'pending' | 'verified' | 'rejected'` - Verification status
- `size?: 'sm' | 'md' | 'lg'` - Size variant (default: 'md')
- `showLabel?: boolean` - Whether to show status label text (default: false)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { VerificationBadge } from '@/components/companies'

<VerificationBadge status="verified" size="md" showLabel />
```

## Features

- **Responsive Design**: All components are mobile-friendly and adapt to different screen sizes
- **Accessibility**: Proper ARIA labels, semantic HTML, and keyboard navigation support
- **Theming**: Uses Tailwind CSS and shadcn/ui components for consistent theming
- **Type Safety**: Full TypeScript support with proper type definitions
- **Interactive**: Hover effects, tooltips, and clickable elements for better UX

## Design Patterns

- Uses shadcn/ui components for consistency
- Follows the existing codebase styling patterns
- Implements proper loading states and error handling
- Supports dark mode through Tailwind CSS classes
- Uses Lucide React icons for visual elements

## Requirements Covered

This implementation satisfies the following requirements from the design document:

- **7.1**: Public profile page display
- **7.2**: Company logo, banner, and description display
- **7.3**: Verification badge for verified companies
- **7.4**: List of events hosted by company
- **7.5**: Company statistics display
- **7.6**: "Hosted by [Company]" display on events
