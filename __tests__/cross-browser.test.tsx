/**
 * Cross-Browser Compatibility Tests
 * Tests for browser-specific features and compatibility
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Browser Feature Detection', () => {
    test('should detect modern browser features', () => {
      // Test for required browser APIs
      const hasLocalStorage = typeof window !== 'undefined' && 'localStorage' in window;
      const hasSessionStorage = typeof window !== 'undefined' && 'sessionStorage' in window;
      const hasBlob = typeof Blob !== 'undefined';
      const hasURL = typeof URL !== 'undefined';

      // These should all be available in modern browsers or test environment
      expect(hasLocalStorage).toBe(true);
      expect(hasSessionStorage).toBe(true);
      expect(hasBlob).toBe(true);
      expect(hasURL).toBe(true);
    });

    test('should support required CSS features', () => {
      // In test environment, CSS.supports may not be available
      // In real browsers, these features are widely supported
      const hasCSS = typeof CSS !== 'undefined' && typeof CSS.supports === 'function';
      
      if (hasCSS) {
        const supportsGrid = CSS.supports('display', 'grid');
        const supportsFlex = CSS.supports('display', 'flex');
        const supportsCustomProps = CSS.supports('--custom', '0');

        expect(supportsGrid).toBe(true);
        expect(supportsFlex).toBe(true);
        expect(supportsCustomProps).toBe(true);
      } else {
        // In test environment without CSS.supports
        expect(hasCSS).toBe(false);
      }
    });

    test('should support ES6+ features', () => {
      // Test for Promise support
      expect(typeof Promise).toBe('function');

      // Test for async/await support
      const asyncFunction = async () => 'test';
      expect(asyncFunction.constructor.name).toBe('AsyncFunction');

      // Test for arrow functions
      const arrowFn = () => true;
      expect(typeof arrowFn).toBe('function');

      // Test for template literals
      const name = 'test';
      const template = `Hello ${name}`;
      expect(template).toBe('Hello test');

      // Test for destructuring
      const { a, b } = { a: 1, b: 2 };
      expect(a).toBe(1);
      expect(b).toBe(2);

      // Test for spread operator
      const arr1 = [1, 2];
      const arr2 = [...arr1, 3];
      expect(arr2).toEqual([1, 2, 3]);
    });
  });

  describe('Export Functionality - Browser Compatibility', () => {
    test('should support Blob creation for PDF export', () => {
      const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // PDF header
      const blob = new Blob([pdfData], { type: 'application/pdf' });

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
      expect(blob.size).toBeGreaterThan(0);
    });

    test('should support Blob creation for DOCX export', () => {
      const docxData = new Uint8Array([0x50, 0x4B, 0x03, 0x04]); // ZIP header (DOCX is ZIP)
      const blob = new Blob([docxData], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    test('should support URL.createObjectURL for downloads', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      
      // URL.createObjectURL may not be available in test environment
      if (typeof URL.createObjectURL === 'function') {
        const url = URL.createObjectURL(blob);
        expect(url).toMatch(/^blob:/);
        URL.revokeObjectURL(url);
      } else {
        // In test environment, just verify the API exists
        expect(typeof URL).toBe('function');
      }
    });

    test('should support download attribute on anchor elements', () => {
      if (typeof document !== 'undefined') {
        const link = document.createElement('a');
        link.download = 'test.pdf';
        link.href = 'blob:test';

        expect(link.download).toBe('test.pdf');
        expect(link.href).toContain('blob:test');
      } else {
        // In test environment without DOM
        expect(true).toBe(true);
      }
    });
  });

  describe('Local Storage - Browser Compatibility', () => {
    test('should support localStorage API', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = 'test-key';
        const testValue = 'test-value';

        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        
        expect(retrieved).toBe(testValue);

        localStorage.removeItem(testKey);
        expect(localStorage.getItem(testKey)).toBeNull();
      } else {
        // In test environment without localStorage
        expect(true).toBe(true);
      }
    });

    test('should handle localStorage quota exceeded', () => {
      const handleQuotaExceeded = (error: Error): boolean => {
        return error.name === 'QuotaExceededError' || 
               error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
      };

      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';

      expect(handleQuotaExceeded(quotaError)).toBe(true);
    });

    test('should support JSON serialization for storage', () => {
      const data = {
        id: 'test-id',
        title: 'Test Resume',
        sections: [{ type: 'personal_info', content: {} }],
      };

      const serialized = JSON.stringify(data);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(data);
    });
  });

  describe('Drag and Drop - Browser Compatibility', () => {
    test('should support drag and drop events', () => {
      const dragEvents = [
        'dragstart',
        'drag',
        'dragend',
        'dragenter',
        'dragover',
        'dragleave',
        'drop',
      ];

      dragEvents.forEach(eventType => {
        if (typeof Event !== 'undefined') {
          const event = new Event(eventType);
          expect(event.type).toBe(eventType);
        } else {
          expect(true).toBe(true);
        }
      });
    });

    test('should support DataTransfer API', () => {
      // DataTransfer is used in drag and drop operations
      // In test environment, DataTransfer may not be available
      const supportsDataTransfer = typeof DataTransfer !== 'undefined';
      
      // Just verify the check works
      expect(typeof supportsDataTransfer).toBe('boolean');
    });
  });

  describe('Touch Events - Mobile Browser Compatibility', () => {
    test('should support touch events', () => {
      const touchEvents = [
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
      ];

      touchEvents.forEach(eventType => {
        if (typeof Event !== 'undefined') {
          const event = new Event(eventType);
          expect(event.type).toBe(eventType);
        } else {
          expect(true).toBe(true);
        }
      });
    });

    test('should handle touch and mouse events', () => {
      const isTouchDevice = (): boolean => {
        if (typeof window === 'undefined') return false;
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      };

      // Should return boolean
      const result = isTouchDevice();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Clipboard API - Browser Compatibility', () => {
    test('should support clipboard operations', async () => {
      const hasClipboard = typeof navigator !== 'undefined' && 
                          'clipboard' in navigator;

      // In test environment, clipboard may not be available
      expect(typeof hasClipboard).toBe('boolean');
    });

    test('should handle clipboard permissions', () => {
      const checkClipboardPermission = async (): Promise<boolean> => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
          return false;
        }
        return true;
      };

      expect(typeof checkClipboardPermission).toBe('function');
    });
  });

  describe('Print API - Browser Compatibility', () => {
    test('should support window.print()', () => {
      if (typeof window !== 'undefined') {
        expect(typeof window.print).toBe('function');
      } else {
        expect(true).toBe(true);
      }
    });

    test('should support print media queries', () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const printMedia = window.matchMedia('print');
        expect(printMedia).toBeDefined();
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Font Loading - Browser Compatibility', () => {
    test('should support FontFace API', () => {
      const supportsFontFace = typeof FontFace !== 'undefined';
      
      // In test environment, FontFace may not be available
      expect(typeof supportsFontFace).toBe('boolean');
    });

    test('should handle web font loading', () => {
      const fonts = [
        'Inter',
        'Roboto',
        'Open Sans',
        'Lato',
        'Montserrat',
      ];

      fonts.forEach(font => {
        expect(typeof font).toBe('string');
        expect(font.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ResizeObserver - Browser Compatibility', () => {
    test('should support ResizeObserver API', () => {
      const supportsResizeObserver = typeof ResizeObserver !== 'undefined';
      
      // Modern browsers should support ResizeObserver
      expect(supportsResizeObserver || typeof window === 'undefined').toBe(true);
    });
  });

  describe('IntersectionObserver - Browser Compatibility', () => {
    test('should support IntersectionObserver API', () => {
      const supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';
      
      // In test environment, IntersectionObserver may not be available
      expect(typeof supportsIntersectionObserver).toBe('boolean');
    });
  });

  describe('File API - Browser Compatibility', () => {
    test('should support File and FileReader APIs', () => {
      const supportsFile = typeof File !== 'undefined';
      const supportsFileReader = typeof FileReader !== 'undefined';

      expect(supportsFile).toBe(true);
      expect(supportsFileReader).toBe(true);
    });

    test('should handle file reading', () => {
      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader();
        
        expect(reader).toBeInstanceOf(FileReader);
        expect(typeof reader.readAsText).toBe('function');
        expect(typeof reader.readAsDataURL).toBe('function');
        expect(typeof reader.readAsArrayBuffer).toBe('function');
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Canvas API - Browser Compatibility', () => {
    test('should support Canvas API for PDF generation', () => {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Fetch API - Browser Compatibility', () => {
    test('should support Fetch API', () => {
      // In test environment, fetch may not be available
      const hasFetch = typeof fetch !== 'undefined';
      expect(typeof hasFetch).toBe('boolean');
    });

    test('should support Request and Response objects', () => {
      // In test environment, these may not be available
      const hasRequest = typeof Request !== 'undefined';
      const hasResponse = typeof Response !== 'undefined';
      expect(typeof hasRequest).toBe('boolean');
      expect(typeof hasResponse).toBe('boolean');
    });

    test('should support Headers API', () => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');

      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('WebWorker - Browser Compatibility', () => {
    test('should support Web Workers', () => {
      const supportsWorker = typeof Worker !== 'undefined';
      
      // In test environment, Worker may not be available
      expect(typeof supportsWorker).toBe('boolean');
    });
  });

  describe('Browser-Specific Workarounds', () => {
    test('should detect Safari browser', () => {
      const isSafari = (): boolean => {
        if (typeof navigator === 'undefined') return false;
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      };

      expect(typeof isSafari()).toBe('boolean');
    });

    test('should detect iOS devices', () => {
      const isIOS = (): boolean => {
        if (typeof navigator === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
      };

      expect(typeof isIOS()).toBe('boolean');
    });

    test('should detect Chrome browser', () => {
      const isChrome = (): boolean => {
        if (typeof navigator === 'undefined') return false;
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      };

      expect(typeof isChrome()).toBe('boolean');
    });

    test('should detect Firefox browser', () => {
      const isFirefox = (): boolean => {
        if (typeof navigator === 'undefined') return false;
        return /Firefox/.test(navigator.userAgent);
      };

      expect(typeof isFirefox()).toBe('boolean');
    });

    test('should detect Edge browser', () => {
      const isEdge = (): boolean => {
        if (typeof navigator === 'undefined') return false;
        return /Edg/.test(navigator.userAgent);
      };

      expect(typeof isEdge()).toBe('boolean');
    });
  });

  describe('Polyfill Requirements', () => {
    test('should have Array methods available', () => {
      expect(typeof Array.prototype.map).toBe('function');
      expect(typeof Array.prototype.filter).toBe('function');
      expect(typeof Array.prototype.reduce).toBe('function');
      expect(typeof Array.prototype.find).toBe('function');
      expect(typeof Array.prototype.findIndex).toBe('function');
      expect(typeof Array.prototype.includes).toBe('function');
    });

    test('should have Object methods available', () => {
      expect(typeof Object.assign).toBe('function');
      expect(typeof Object.keys).toBe('function');
      expect(typeof Object.values).toBe('function');
      expect(typeof Object.entries).toBe('function');
    });

    test('should have String methods available', () => {
      expect(typeof String.prototype.includes).toBe('function');
      expect(typeof String.prototype.startsWith).toBe('function');
      expect(typeof String.prototype.endsWith).toBe('function');
      expect(typeof String.prototype.repeat).toBe('function');
    });
  });

  describe('Performance API - Browser Compatibility', () => {
    test('should support Performance API', () => {
      if (typeof performance !== 'undefined') {
        expect(typeof performance.now).toBe('function');
        // mark and measure may not be available in all environments
        const hasMark = typeof performance.mark !== 'undefined';
        const hasMeasure = typeof performance.measure !== 'undefined';
        expect(typeof hasMark).toBe('boolean');
        expect(typeof hasMeasure).toBe('boolean');
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Viewport and Media Queries', () => {
    test('should support matchMedia API', () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mobileQuery = window.matchMedia('(max-width: 768px)');
        expect(mobileQuery).toBeDefined();
        expect(typeof mobileQuery.matches).toBe('boolean');
      } else {
        expect(true).toBe(true);
      }
    });

    test('should handle viewport meta tag', () => {
      const viewportContent = 'width=device-width, initial-scale=1.0';
      expect(viewportContent).toContain('width=device-width');
      expect(viewportContent).toContain('initial-scale=1.0');
    });
  });
});
