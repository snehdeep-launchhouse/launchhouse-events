import * as React from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateEmail } from "@/lib/email-validation";

interface EmailInputProps extends React.ComponentProps<"input"> {
  /** External error message from form validation (e.g. zod via react-hook-form) */
  externalError?: string;
}

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, externalError, onBlur, onChange, ...props }, ref) => {
    const [touched, setTouched] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(
      (props.value as string) ?? (props.defaultValue as string) ?? ""
    );

    // Keep in sync with controlled value
    React.useEffect(() => {
      if (props.value !== undefined) setLocalValue(props.value as string);
    }, [props.value]);

    const result = localValue ? validateEmail(localValue) : null;
    const showValid = touched && result?.valid === true && !externalError;
    const showInvalid =
      (touched && result?.valid === false && !!localValue) || !!externalError;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="email"
          className={cn(
            "transition-colors pr-9",
            showValid && "border-green-500 focus-visible:ring-green-500",
            showInvalid && "border-destructive focus-visible:ring-destructive",
            className
          )}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {showValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
        )}
        {showInvalid && !externalError && result?.message && (
          <p className="text-xs text-destructive mt-1">{result.message}</p>
        )}
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";

export default EmailInput;
