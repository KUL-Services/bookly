import { Search } from "lucide-react";
import { BaseInput } from "../base-input/base-input.component";
import { i18n } from "i18next";
import { StringProps } from "@/types";

interface SearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "placeholder" | "error"
  > {
  errorProps?: StringProps;
  placeholderProps?: StringProps;
  i18nTFn?: i18n["t"];
  label?: string;
}

export const SearchInput = ({
  className,
  placeholderProps,
  ...props
}: SearchInputProps) => {
  return (
    <BaseInput
      LeadingIcon={Search}
      type="search"
      placeholderProps={placeholderProps || { plainText: "Search..." }}
      className={className}
      {...props}
    />
  );
};
