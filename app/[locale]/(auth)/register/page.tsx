import { AuthForm } from "@/components/molecules";
import { PageProps } from "@/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = params;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <Link href="/demo" className="text-primary hover:underline">← Back to Demo</Link>
      </div>
      <AuthForm
        type="register"
        onSubmit={async (values) => {
          'use server';
          // Handle registration submission here
          console.log('Registration values:', values);
          // For demo purposes, redirect to demo page after registration
          redirect('/demo');
        }}
      />
    </main>
  );
}
