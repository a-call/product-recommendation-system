import { Suspense } from "react";
import { SearchClient } from "../../components/SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-zinc-500">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
