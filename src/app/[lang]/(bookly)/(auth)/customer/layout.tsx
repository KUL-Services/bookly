export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
      {children}
    </div>
  );
}
