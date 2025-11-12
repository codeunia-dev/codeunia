# CodeUnia Documentation

This directory contains comprehensive documentation and help content for the CodeUnia platform.

## Available Guides

### For Companies

1. **[Company Registration Guide](./company-registration-guide.md)**
   - Step-by-step registration process
   - Document requirements
   - Verification process
   - Subscription tiers
   - Troubleshooting common issues

2. **[Event Creation Guide](./event-creation-guide.md)**
   - Creating and managing events
   - Event approval workflow
   - Best practices for event content
   - Analytics and tracking
   - Event types (hackathons, workshops, webinars)

3. **[Team Management Guide](./team-management-guide.md)**
   - Team roles and permissions
   - Inviting and managing team members
   - Collaboration workflows
   - Security best practices

### For Administrators

4. **[Moderation Guidelines](./moderation-guidelines.md)**
   - Company verification process
   - Event moderation standards
   - Content policy enforcement
   - Decision-making frameworks
   - Communication guidelines

## Help Components

### HelpTooltip Component

Located at `components/help/HelpTooltip.tsx`, this component provides inline help throughout the platform.

**Usage:**
```tsx
import { HelpTooltip, CompanyHelpTooltips } from '@/components/help/HelpTooltip'

// Simple tooltip
<HelpTooltip content="This is helpful information" />

// With title and description
<HelpText 
  title="Field Name"
  description="Detailed explanation of this field"
/>

// Using predefined tooltips
<HelpTooltip content={CompanyHelpTooltips.companyName.description} />
```

**Predefined Tooltip Categories:**
- `CompanyHelpTooltips` - Company registration fields
- `EventHelpTooltips` - Event creation fields
- `TeamHelpTooltips` - Team management fields
- `AnalyticsHelpTooltips` - Analytics dashboard fields

### FAQ Component

Located at `components/help/CompanyFAQ.tsx`, this component provides a searchable FAQ interface.

**Features:**
- Search functionality
- Category filtering
- Expandable/collapsible answers
- 40+ common questions covered

**Usage:**
```tsx
import { CompanyFAQ } from '@/components/help/CompanyFAQ'

<CompanyFAQ />
```

## Help Pages

### Company Help Center
**URL:** `/help/companies`

Central hub for all company-related documentation with:
- Quick links to all guides
- Common topics by category
- Video tutorials (coming soon)
- Contact support information

### FAQ Page
**URL:** `/companies/faq`

Dedicated FAQ page with:
- Searchable questions
- Category filters
- Links to detailed guides
- Support contact information

### Documentation Pages
**URL Pattern:** `/docs/[slug]`

Renders markdown documentation files with:
- Clean, readable formatting
- Navigation back to help center
- Feedback mechanism
- Related resources

**Available slugs:**
- `company-registration-guide`
- `event-creation-guide`
- `team-management-guide`
- `moderation-guidelines`

## Adding New Documentation

### Adding a New Guide

1. Create a markdown file in the `docs/` directory:
   ```bash
   touch docs/new-guide-name.md
   ```

2. Write your content using standard markdown

3. Add the slug to `app/docs/[slug]/page.tsx`:
   ```typescript
   const validDocs = [
     'company-registration-guide',
     'event-creation-guide',
     'team-management-guide',
     'moderation-guidelines',
     'new-guide-name', // Add here
   ]
   ```

4. Add metadata for the new guide:
   ```typescript
   const titles: Record<string, string> = {
     // ... existing titles
     'new-guide-name': 'New Guide Title',
   }
   ```

5. Link to it from the help center (`app/help/companies/page.tsx`)

### Adding New FAQ Items

Edit `components/help/CompanyFAQ.tsx` and add to the `faqData` array:

```typescript
{
  category: 'Category Name',
  question: 'Your question here?',
  answer: 'Detailed answer here...',
}
```

**Available categories:**
- Company Registration
- Event Creation
- Team Management
- Subscription & Billing
- Analytics
- Troubleshooting

### Adding New Help Tooltips

Edit `components/help/HelpTooltip.tsx` and add to the appropriate category:

```typescript
export const YourCategoryHelpTooltips = {
  fieldName: {
    title: 'Field Title',
    description: 'Helpful description of what this field does.',
  },
}
```

## Documentation Standards

### Writing Style

- **Clear and Concise**: Use simple language
- **Action-Oriented**: Start with verbs (Create, Update, Delete)
- **Structured**: Use headings, lists, and tables
- **Examples**: Include code examples and screenshots where helpful
- **Searchable**: Use keywords users might search for

### Markdown Formatting

- Use `#` for main title (only one per document)
- Use `##` for major sections
- Use `###` for subsections
- Use `####` for minor subsections
- Use bullet points for lists
- Use numbered lists for sequential steps
- Use code blocks for commands and code
- Use blockquotes for important notes

### Content Organization

Each guide should include:

1. **Overview** - Brief introduction
2. **Prerequisites** - What users need before starting
3. **Step-by-Step Instructions** - Detailed walkthrough
4. **Best Practices** - Recommendations
5. **Troubleshooting** - Common issues and solutions
6. **FAQ** - Quick answers to common questions
7. **Next Steps** - Where to go from here

## Maintenance

### Regular Updates

- Review documentation quarterly
- Update screenshots when UI changes
- Add new FAQ items based on support tickets
- Keep troubleshooting sections current
- Update "Last updated" dates

### User Feedback

Monitor and incorporate feedback from:
- Support tickets
- User surveys
- Help page analytics
- Direct user feedback

## Support Resources

### Internal

- **Support Email**: support@codeunia.com
- **Admin Dashboard**: `/admin`
- **Analytics**: Track help page usage

### External

- **Help Center**: `/help/companies`
- **FAQ**: `/companies/faq`
- **Documentation**: `/docs/[slug]`

## Contributing

When adding or updating documentation:

1. Follow the writing style guide
2. Test all links and code examples
3. Proofread for grammar and spelling
4. Update the table of contents if needed
5. Add to relevant navigation menus
6. Update this README if adding new sections

---

*Last updated: November 2025*
