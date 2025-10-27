/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';
import type * as jestGlobals from '@jest/globals';

declare module '@jest/globals' {
  interface Matchers<R = void> extends jestGlobals.Matchers<R> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeEmpty(): R;
    toBeEmptyDOMElement(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toContainElement(element: HTMLElement | SVGElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R;
    toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R;
    toHaveAttribute(attr: string, value?: unknown): R;
    toHaveClass(...classNames: string[]): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: Record<string, unknown>): R;
    toHaveStyle(css: string | Record<string, unknown>): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
    toHaveValue(value?: string | string[] | number | null): R;
    toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveErrorMessage(text: string | RegExp): R;
  }
}
