import * as React from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateEmail, verifyEmailDomain, type VerificationStatus } from "@/lib/email-validation";

interface EmailInputProps extends React.ComponentProps<"input"> {
  /** External error message from form validation (e.g. zod via react-hook-form) */
  externalError?: string;
  /** Callback so parent forms can track domain verification status */
  onVerificationChange?: (status: VerificationStatus) => void;
}

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, externalError, onBlur, onChange, onVerificationChange, ...props }, ref) => {
    const [touched, setTouched] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(
      (props.value as string) ?? (props.defaultValue as string) ?? ""
    );
    const [verifying, setVerifying] = React.useState(false);
    const [domainError, setDomainError] = React.useState<string | null>(null);
    const [domainValid, setDomainValid] = React.useState(false);

    // Keep in sync with controlled value
    React.useEffect(() => {
      if (props.value !== undefined) setLocalValue(props.value as string);
    }, [props.value]);

    const result = localValue ? validateEmail(localValue) : null;
    const regexValid = result?.valid === true;
    
    const showValid = touched && regexValid && domainValid && !externalError && !verifying;
    const showInvalid =
      (touched && result?.valid === false && !!localValue) ||
      !!externalError ||
      !!domainError;

    const updateStatus = React.useCallback((status: VerificationStatus) => {
      onVerificationChange?.(status);
    }, [onVerificationChange]);

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      onBlur?.(e);

      const val = e.target.value;
      const check = validateEmail(val);

      if (!check.valid) {
        setDomainError(null);
        setDomainValid(false);
        updateStatus("idle");
        return;
      }

      // Regex passed — now verify domain
      setVerifying(true);
      setDomainError(null);
      setDomainValid(false);
      updateStatus("verifying");

      const domainResult = await verifyEmailDomain(val);
      
      setVerifying(false);
      if (domainResult.valid) {
        setDomainValid(true);
        setDomainError(null);
        updateStatus("valid");
      } else {
        setDomainValid(false);
        setDomainError(domainResult.message || null);
        updateStatus("invalid");
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      // Reset domain state on change
      setDomainError(null);
      setDomainValid(false);
      if (touched) {
        updateStatus("idle");
      }
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
        {verifying && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin pointer-events-none" />
        )}
        {showValid && !verifying && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
        )}
        {showInvalid && !externalError && (result?.message || domainError) && (
          <p className="text-xs text-destructive mt-1">{domainError || result?.message}</p>
        )}
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";

export default EmailInput;
