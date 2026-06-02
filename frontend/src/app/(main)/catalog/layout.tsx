import { Suspense } from "react";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 animate-pulse"><div className="h-8 bg-card rounded w-1/4 mb-6" /></div>}>{children}</Suspense>;
}
