"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/atoms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            <H1 stringProps={{ plainText: "Welcome to Bookly" }} />
          </CardTitle>
          <CardDescription>
            <P stringProps={{ plainText: "Please login or create a new account to continue" }} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button className="w-full text-lg" variant="default" size="lg">
              Login
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button className="w-full text-lg" variant="outline" size="lg">
              Create Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
