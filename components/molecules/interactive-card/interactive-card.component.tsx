'use client';

import { BaseCard, P } from "@/components/atoms";
import { Button } from "@/components/molecules";
import { StringProps } from "@/types";
import { useTranslation } from "react-i18next";

interface InteractiveCardProps {
  titleProps: StringProps;
  descriptionProps: StringProps;
  contentProps: StringProps;
  className?: string;
}

export const InteractiveCard = ({
  titleProps,
  descriptionProps,
  contentProps,
  className,
}: InteractiveCardProps) => {
  const { t } = useTranslation();

  return (
    <BaseCard
      titleProps={titleProps}
      descriptionProps={descriptionProps}
      className={className}
      footerContent={
        <div className="flex justify-end w-full">
          <Button
            buttonText={{ plainText: "Learn More" }}
            prefixIcon={{ icon: "lucide:arrow-right" }}
            suffixIcon={{ icon: "lucide:chevron-right" }}
            onClick={() => console.log("Button clicked")}
          />
        </div>
      }
    >
      <P stringProps={contentProps} />
    </BaseCard>
  );
};
