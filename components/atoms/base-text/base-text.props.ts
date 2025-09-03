import { FontSize, StringProps } from "@/bookly/types";
import { i18n } from "i18next";
import { ReactNode, HTMLAttributes } from "react";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "small"
  | "span"
  | "label"
  | "strong";

type VariantMap = {
  h1: HTMLAttributes<HTMLHeadingElement>;
  h2: HTMLAttributes<HTMLHeadingElement>;
  h3: HTMLAttributes<HTMLHeadingElement>;
  h4: HTMLAttributes<HTMLHeadingElement>;
  h5: HTMLAttributes<HTMLHeadingElement>;
  h6: HTMLAttributes<HTMLHeadingElement>;
  p: HTMLAttributes<HTMLParagraphElement>;
  small: HTMLAttributes<HTMLElement>;
  span: HTMLAttributes<HTMLSpanElement>;
  label: HTMLAttributes<HTMLLabelElement>;
  strong: HTMLAttributes<HTMLElement>;
};

export type BaseTextProps<V extends TextVariant = "p"> = {
  variant?: V;
  children?: ReactNode;
  stringProps: StringProps;
  i18nTFn?: i18n["t"];
  fontSize?: FontSize;
  testId?: string; // used for debugging purposes.
  className?: string;
  textClass?: string;
} & VariantMap[V];
