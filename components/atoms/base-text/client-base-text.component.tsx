"use client";

import React from "react";
import { BaseTextProps, TextVariant } from "./base-text.props";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { extractStringFromStringProps } from "./utils";
import { cn } from "@/lib/utils";

/**
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 *
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 *
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 *
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 *
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 *
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 *
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 */
const ClientBaseText = <V extends TextVariant = "p">({
  variant = "p" as V,
  children,
  className,
  stringProps,
  i18nTFn: _i18nTFn, // ignore this prop since we use useTranslation
  textClass,
  ...restProps
}: BaseTextProps<V>) => {
  const Component = variant;
  const { t } = useTranslation();

  // const elementProps = {
  //   className: cn("base-text", className, textClassName),
  //   ...restProps,
  // };
  const elementProps = {
    className: clsx("base-text", textClass, className),
    ...restProps,
  };

  const content = stringProps
    ? extractStringFromStringProps(stringProps, t)
    : children;

  return React.createElement(Component, elementProps, content);
};

export { ClientBaseText };
