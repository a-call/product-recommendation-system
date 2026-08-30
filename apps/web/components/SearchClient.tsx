"use client";

import { useSearchParams } from "next/navigation";
import { ProductList } from "./ProductList";

export function SearchClient() {
  const params = useSearchParams();
  return <ProductList initialQuery={params.get("q") ?? ""} />;
}
