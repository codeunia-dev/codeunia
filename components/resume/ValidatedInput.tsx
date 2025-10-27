'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { forwardRef } from 'react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showError?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, icon, showError = true, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm font-medium flex items-center gap-1">
          {icon}
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          ref={ref}
          aria-invalid={!!error}
          className={className}
          {...props}
        />
        {showError && error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
