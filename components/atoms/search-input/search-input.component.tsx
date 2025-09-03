import { LucideIcon, Search } from "lucide-react";
import { BaseInput } from "../base-input/base-input.component";
import { i18n } from "i18next";
import { StringProps } from "@/bookly/types";

interface SearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "placeholder" | "error"
  > {
  errorProps?: StringProps;
  placeholderProps?: StringProps;
  i18nTFn?: i18n["t"];
  label?: string;
  leadingIcon?: LucideIcon;
}

export const SearchInput = ({
  className,
  placeholderProps,
  leadingIcon,
  ...props
}: SearchInputProps) => {
  return (
    <BaseInput
      LeadingIcon={leadingIcon || Search}
      type="search"
      placeholderProps={placeholderProps || { plainText: "Search..." }}
      className={className}
      {...props}
    />
  );
};
