import { ReactNode } from "react";

export function PageContainer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}