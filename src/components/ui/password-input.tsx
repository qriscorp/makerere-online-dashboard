import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  variant?: "default" | "auth";
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const inputClassName =
      variant === "auth"
        ? cn(
            "w-full rounded-md border border-input bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring",
            className,
          )
        : cn("pr-10", className);

    const toggle = (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    );

    return (
      <div className={cn("relative w-full", variant === "auth" && "mt-1.5")}>
        {variant === "auth" ? (
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            className={inputClassName}
            {...props}
          />
        ) : (
          <Input
            ref={ref}
            type={visible ? "text" : "password"}
            className={inputClassName}
            {...props}
          />
        )}
        {toggle}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
