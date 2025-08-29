"use client";

import { BaseCard, H2 } from "@/components/atoms";
import { CategoryCard, BusinessCard } from "@/components/molecules";
import { categories, mockBusinesses } from "@/data/mock-data";
import { useRouter } from "next/navigation";

export const ExploreSection = () => {
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`);
  };

  const handleBusinessClick = (id: string) => {
    router.push(`/business/${id}`);
  };

  return (
    <>
      {/* Categories Section */}
      <section className="w-full max-w-7xl px-4 py-8">
        <H2 
          className="mb-6"
          stringProps={{ plainText: "Explore by category" }}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category.slug)}
            />
          ))}
        </div>
      </section>
      

      {/* Featured Businesses Section */}
      <section className="w-full max-w-7xl px-4 py-8">
        <H2 
          className="mb-6"
          stringProps={{ plainText: "Featured businesses" }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onClick={() => handleBusinessClick(business.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
};
