import { Input } from "@/components/ui/input";
import { Label, P } from "../base-text/base-text.component";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { StringProps } from "@/types";
import { i18n } from "i18next";

interface BaseInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label?: string;
  errorProps?: StringProps;
  placeholderProps: StringProps;
  i18nTFn?: i18n["t"];
  LeadingIcon?: LucideIcon;
  TrailingIcon?: LucideIcon;
}

export const BaseInput = ({
  label,
  errorProps,
  placeholderProps,
  i18nTFn,
  className,
  LeadingIcon,
  TrailingIcon,
  ...props
}: BaseInputProps) => {
  const translatedPlaceholder =
    "plainText" in placeholderProps
      ? placeholderProps.plainText
      : i18nTFn?.(placeholderProps.localeKey!, placeholderProps.localeProps);

  return (
    <div className="w-full space-y-2">
      {label && <Label stringProps={{ plainText: label }} />}
      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        )}
        <Input
          className={cn(
            LeadingIcon && "pl-10",
            TrailingIcon && "pr-10",
            errorProps && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          placeholder={translatedPlaceholder}
          {...props}
        />
        {TrailingIcon && (
          <TrailingIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        )}
      </div>
      {errorProps && (
        <P
          stringProps={errorProps}
          i18nTFn={i18nTFn}
          className="text-red-500 text-sm"
        />
      )}
    </div>
  );
};
