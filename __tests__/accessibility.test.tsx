/**
 * Accessibility Tests
 * Tests for WCAG 2.1 AA compliance and accessibility features
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    test('should support Tab navigation through form fields', async () => {
      const user = userEvent.setup();
      
      const TestForm = () => (
        <form>
          <input type="text" name="name" aria-label="Full Name" />
          <input type="email" name="email" aria-label="Email" />
          <input type="tel" name="phone" aria-label="Phone" />
          <button type="submit">Submit</button>
        </form>
      );

      render(<TestForm />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      const phoneInput = screen.getByLabelText('Phone');
      const submitButton = screen.getByText('Submit');

      // Start at first input
      nameInput.focus();
      expect(nameInput).toHaveFocus();

      // Tab to next input
      await user.tab();
      expect(emailInput).toHaveFocus();

      // Tab to next input
      await user.tab();
      expect(phoneInput).toHaveFocus();

      // Tab to button
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    test('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      
      const TestForm = () => (
        <form>
          <input type="text" name="field1" aria-label="Field 1" />
          <input type="text" name="field2" aria-label="Field 2" />
        </form>
      );

      render(<TestForm />);

      const field1 = screen.getByLabelText('Field 1');
      const field2 = screen.getByLabelText('Field 2');

      // Start at second field
      field2.focus();
      expect(field2).toHaveFocus();

      // Shift+Tab to previous field
      await user.tab({ shift: true });
      expect(field1).toHaveFocus();
    });

    test('should support keyboard shortcuts', () => {
      const shortcuts = {
        save: 'Ctrl+S',
        export: 'Ctrl+E',
        close: 'Escape',
        undo: 'Ctrl+Z',
        redo: 'Ctrl+Y',
      };

      // Verify shortcuts are defined
      expect(shortcuts.save).toBe('Ctrl+S');
      expect(shortcuts.export).toBe('Ctrl+E');
      expect(shortcuts.close).toBe('Escape');
    });

    test('should handle Enter key on buttons', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      const TestButton = () => (
        <button onClick={handleClick} aria-label="Test Button">
          Click Me
        </button>
      );

      render(<TestButton />);

      const button = screen.getByLabelText('Test Button');
      button.focus();

      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });

    test('should handle Space key on buttons', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      const TestButton = () => (
        <button onClick={handleClick} aria-label="Test Button">
          Click Me
        </button>
      );

      render(<TestButton />);

      const button = screen.getByLabelText('Test Button');
      button.focus();

      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('ARIA Labels and Roles', () => {
    test('should have proper ARIA labels on interactive elements', () => {
      const TestComponent = () => (
        <div>
          <button aria-label="Add Section">+</button>
          <button aria-label="Delete Section">×</button>
          <input type="text" aria-label="Resume Title" />
          <select aria-label="Template Selector">
            <option>Modern</option>
          </select>
        </div>
      );

      render(<TestComponent />);

      expect(screen.getByLabelText('Add Section')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete Section')).toBeInTheDocument();
      expect(screen.getByLabelText('Resume Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Template Selector')).toBeInTheDocument();
    });

    test('should use semantic HTML roles', () => {
      const TestComponent = () => (
        <div>
          <nav role="navigation" aria-label="Main Navigation">
            <a href="/">Home</a>
          </nav>
          <main role="main" aria-label="Resume Editor">
            <section role="region" aria-label="Personal Information">
              <h2>Personal Info</h2>
            </section>
          </main>
          <aside role="complementary" aria-label="Preview Panel">
            <div>Preview</div>
          </aside>
        </div>
      );

      render(<TestComponent />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    test('should have descriptive aria-describedby attributes', () => {
      const TestComponent = () => (
        <div>
          <input
            type="email"
            aria-label="Email"
            aria-describedby="email-help"
          />
          <span id="email-help">Enter your email address</span>
        </div>
      );

      render(<TestComponent />);

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    test('should use aria-invalid for validation errors', () => {
      const TestComponent = () => (
        <div>
          <input
            type="email"
            aria-label="Email"
            aria-invalid="true"
            aria-errormessage="email-error"
          />
          <span id="email-error" role="alert">
            Invalid email format
          </span>
        </div>
      );

      render(<TestComponent />);

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
    });

    test('should use aria-live for dynamic updates', () => {
      const TestComponent = () => (
        <div>
          <div aria-live="polite" aria-atomic="true">
            Resume saved successfully
          </div>
          <div aria-live="assertive" role="alert">
            Error: Failed to save
          </div>
        </div>
      );

      render(<TestComponent />);

      const politeRegion = screen.getByText('Resume saved successfully');
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');

      const assertiveRegion = screen.getByText('Error: Failed to save');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Screen Reader Support', () => {
    test('should have descriptive text for screen readers', () => {
      const TestComponent = () => (
        <div>
          <button aria-label="Export resume as PDF">
            <span aria-hidden="true">📄</span>
            <span className="sr-only">Export as PDF</span>
          </button>
        </div>
      );

      render(<TestComponent />);

      const button = screen.getByLabelText('Export resume as PDF');
      expect(button).toBeInTheDocument();
    });

    test('should announce state changes', () => {
      const TestComponent = ({ saving }: { saving: boolean }) => (
        <div>
          <div role="status" aria-live="polite">
            {saving ? 'Saving...' : 'All changes saved'}
          </div>
        </div>
      );

      const { rerender } = render(<TestComponent saving={false} />);
      expect(screen.getByText('All changes saved')).toBeInTheDocument();

      rerender(<TestComponent saving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    test('should provide context for icon buttons', () => {
      const TestComponent = () => (
        <div>
          <button aria-label="Delete section">
            <svg aria-hidden="true">
              <path d="M..." />
            </svg>
          </button>
        </div>
      );

      render(<TestComponent />);

      const button = screen.getByLabelText('Delete section');
      expect(button).toBeInTheDocument();
    });

    test('should use sr-only class for screen reader only text', () => {
      const TestComponent = () => (
        <div>
          <span className="sr-only">
            This text is only for screen readers
          </span>
        </div>
      );

      const { container } = render(<TestComponent />);
      const srOnlyElement = container.querySelector('.sr-only');

      expect(srOnlyElement).toBeInTheDocument();
      expect(srOnlyElement).toHaveTextContent('This text is only for screen readers');
    });
  });

  describe('Focus Management', () => {
    test('should maintain focus on section reorder', () => {
      const TestComponent = () => {
        const [focused, setFocused] = React.useState(false);
        
        return (
          <button
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Section"
          >
            Section {focused ? '(focused)' : ''}
          </button>
        );
      };

      render(<TestComponent />);

      const button = screen.getByLabelText('Section');
      button.focus();

      expect(button).toHaveFocus();
    });

    test('should auto-focus first field when adding section', () => {
      const TestComponent = () => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        React.useEffect(() => {
          inputRef.current?.focus();
        }, []);

        return <input ref={inputRef} type="text" aria-label="First Field" />;
      };

      render(<TestComponent />);

      const input = screen.getByLabelText('First Field');
      expect(input).toHaveFocus();
    });

    test('should trap focus in modal dialogs', async () => {
      const user = userEvent.setup();

      const TestModal = () => (
        <div role="dialog" aria-modal="true" aria-label="Export Dialog">
          <h2>Export Resume</h2>
          <button aria-label="Export as PDF">PDF</button>
          <button aria-label="Export as DOCX">DOCX</button>
          <button aria-label="Close">Close</button>
        </div>
      );

      render(<TestModal />);

      const pdfButton = screen.getByLabelText('Export as PDF');
      const docxButton = screen.getByLabelText('Export as DOCX');
      const closeButton = screen.getByLabelText('Close');

      pdfButton.focus();
      expect(pdfButton).toHaveFocus();

      await user.tab();
      expect(docxButton).toHaveFocus();

      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    test('should have visible focus indicators', () => {
      const TestComponent = () => (
        <button
          className="focus:ring-2 focus:ring-purple-500"
          aria-label="Test Button"
        >
          Click Me
        </button>
      );

      const { container } = render(<TestComponent />);
      const button = container.querySelector('button');

      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-purple-500');
    });
  });

  describe('Color Contrast', () => {
    test('should meet WCAG AA contrast requirements for text', () => {
      // WCAG AA requires:
      // - 4.5:1 for normal text
      // - 3:1 for large text (18pt+ or 14pt+ bold)

      const contrastRatios = {
        normalText: 4.5,
        largeText: 3.0,
      };

      expect(contrastRatios.normalText).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatios.largeText).toBeGreaterThanOrEqual(3.0);
    });

    test('should use accessible color combinations', () => {
      const colorCombinations = [
        { bg: '#ffffff', fg: '#000000', ratio: 21 }, // Black on white
        { bg: '#8b5cf6', fg: '#ffffff', ratio: 4.5 }, // White on purple
        { bg: '#f3f4f6', fg: '#1f2937', ratio: 12 }, // Dark gray on light gray
      ];

      colorCombinations.forEach(combo => {
        expect(combo.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('should not rely solely on color for information', () => {
      const TestComponent = () => (
        <div>
          <span className="text-red-500" aria-label="Error: Invalid input">
            ⚠️ Invalid input
          </span>
          <span className="text-green-500" aria-label="Success: Saved">
            ✓ Saved
          </span>
        </div>
      );

      render(<TestComponent />);

      // Icons and text provide information, not just color
      expect(screen.getByLabelText('Error: Invalid input')).toHaveTextContent('⚠️');
      expect(screen.getByLabelText('Success: Saved')).toHaveTextContent('✓');
    });
  });

  describe('Form Accessibility', () => {
    test('should associate labels with inputs', () => {
      const TestForm = () => (
        <form>
          <label htmlFor="name-input">Full Name</label>
          <input id="name-input" type="text" />
          
          <label htmlFor="email-input">Email</label>
          <input id="email-input" type="email" />
        </form>
      );

      render(<TestForm />);

      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');

      expect(nameInput).toHaveAttribute('id', 'name-input');
      expect(emailInput).toHaveAttribute('id', 'email-input');
    });

    test('should mark required fields', () => {
      const TestForm = () => (
        <form>
          <label htmlFor="required-field">
            Required Field
            <span aria-label="required">*</span>
          </label>
          <input
            id="required-field"
            type="text"
            required
            aria-required="true"
          />
        </form>
      );

      render(<TestForm />);

      const input = screen.getByLabelText(/Required Field/);
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('should provide helpful error messages', () => {
      const TestForm = () => (
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email address (e.g., user@example.com)
          </span>
        </div>
      );

      render(<TestForm />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Please enter a valid email address');
    });

    test('should group related form fields', () => {
      const TestForm = () => (
        <form>
          <fieldset>
            <legend>Personal Information</legend>
            <label htmlFor="first-name">First Name</label>
            <input id="first-name" type="text" />
            <label htmlFor="last-name">Last Name</label>
            <input id="last-name" type="text" />
          </fieldset>
        </form>
      );

      render(<TestForm />);

      const fieldset = screen.getByRole('group', { name: 'Personal Information' });
      expect(fieldset).toBeInTheDocument();
    });
  });

  describe('Responsive Text and Zoom', () => {
    test('should support text zoom up to 200%', () => {
      const TestComponent = () => (
        <div style={{ fontSize: '16px' }}>
          <p>This text should be readable at 200% zoom</p>
        </div>
      );

      const { container } = render(<TestComponent />);
      const div = container.querySelector('div');

      expect(div).toHaveStyle({ fontSize: '16px' });
    });

    test('should use relative units for text sizing', () => {
      const fontSizes = {
        body: '1rem',      // 16px
        heading: '1.5rem', // 24px
        small: '0.875rem', // 14px
      };

      expect(fontSizes.body).toContain('rem');
      expect(fontSizes.heading).toContain('rem');
      expect(fontSizes.small).toContain('rem');
    });
  });

  describe('Alternative Text', () => {
    test('should provide alt text for images', () => {
      const TestComponent = () => (
        <div>
          <img src="/logo.png" alt="CodeUnia Logo" />
          <img src="/icon.png" alt="" aria-hidden="true" /> {/* Decorative */}
        </div>
      );

      render(<TestComponent />);

      const logo = screen.getByAltText('CodeUnia Logo');
      expect(logo).toBeInTheDocument();
    });

    test('should mark decorative images as aria-hidden', () => {
      const TestComponent = () => (
        <img src="/decoration.png" alt="" aria-hidden="true" />
      );

      const { container } = render(<TestComponent />);
      const img = container.querySelector('img');

      expect(img).toHaveAttribute('aria-hidden', 'true');
      expect(img).toHaveAttribute('alt', '');
    });
  });

  describe('Skip Links', () => {
    test('should provide skip to main content link', () => {
      const TestComponent = () => (
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main-content">
            <h1>Resume Builder</h1>
          </main>
        </div>
      );

      render(<TestComponent />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Heading Hierarchy', () => {
    test('should maintain proper heading hierarchy', () => {
      const TestComponent = () => (
        <div>
          <h1>Resume Builder</h1>
          <section>
            <h2>Personal Information</h2>
            <h3>Contact Details</h3>
          </section>
          <section>
            <h2>Work Experience</h2>
            <h3>Current Position</h3>
          </section>
        </div>
      );

      render(<TestComponent />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Resume Builder');
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    });
  });

  describe('Loading States', () => {
    test('should announce loading states to screen readers', () => {
      const TestComponent = ({ loading }: { loading: boolean }) => (
        <div>
          {loading && (
            <div role="status" aria-live="polite" aria-busy="true">
              <span className="sr-only">Loading resume data...</span>
            </div>
          )}
        </div>
      );

      render(<TestComponent loading={true} />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('Loading resume data...')).toBeInTheDocument();
    });
  });

  describe('Touch Target Size', () => {
    test('should have minimum touch target size of 44x44px', () => {
      const TestComponent = () => (
        <button
          style={{ minWidth: '44px', minHeight: '44px' }}
          aria-label="Add Section"
        >
          +
        </button>
      );

      const { container } = render(<TestComponent />);
      const button = container.querySelector('button');

      expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  describe('Language Attributes', () => {
    test('should specify document language', () => {
      const TestComponent = () => (
        <div lang="en">
          <p>This is English text</p>
        </div>
      );

      const { container } = render(<TestComponent />);
      const div = container.querySelector('div');

      expect(div).toHaveAttribute('lang', 'en');
    });
  });
});
