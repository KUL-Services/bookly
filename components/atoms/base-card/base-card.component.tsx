import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H2, P as Description } from "../base-text/base-text.component";
import { StringProps } from "@/types";
import { i18n } from "i18next";
import BaseImage from "../base-image/base-image.component";

interface BaseCardProps {
  className?: string;
  titleProps?: StringProps;
  descriptionProps?: StringProps;
  contentClassName?: string;
  footerClassName?: string;
  headerClassName?: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  i18nTFn?: i18n["t"];
}

export const BaseCard = ({
  className,
  titleProps,
  descriptionProps,
  contentClassName,
  footerClassName,
  headerClassName,
  children,
  footerContent,
  imageSrc,
  imageAlt,
  i18nTFn,
}: BaseCardProps) => {
  return (
    <Card className={cn("w-full", className)}>
      {(titleProps || descriptionProps || imageSrc) && (
        <CardHeader className={headerClassName}>
          {imageSrc && (
            <div className="relative w-full h-48">
              <BaseImage
                src={imageSrc}
                alt={imageAlt || ""}
                className="rounded-t-lg"
              />
            </div>
          )}
          {titleProps && (
            <CardTitle>
              <H2 stringProps={titleProps} i18nTFn={i18nTFn} />
            </CardTitle>
          )}
          {descriptionProps && (
            <CardDescription>
              <Description stringProps={descriptionProps} i18nTFn={i18nTFn} />
            </CardDescription>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}
      {footerContent && (
        <CardFooter className={footerClassName}>{footerContent}</CardFooter>
      )}
    </Card>
  );
};
