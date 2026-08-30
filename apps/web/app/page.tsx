import Link from "next/link";
import { ProductList } from "../components/ProductList";
import { RecommendationSection } from "../components/RecommendationSection";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
              Personalized shopping that gets better with every visit.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-zinc-600">
              Browse, search, favorite, and buy products while the explainable recommendation engine builds a live interest profile.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/products" className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
                Browse products
              </Link>
              <Link href="/search" className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium">
                Search catalog
              </Link>
            </div>
          </div>
          <img
            src="https://picsum.photos/seed/prs-hero/900/680"
            alt="Curated product shelf"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        </div>
      </section>
      <RecommendationSection title="猜你喜欢" strategy="for-you" />
      <RecommendationSection title="热门商品" strategy="popular" />
      <RecommendationSection title="最近浏览相关" strategy="recent-related" />
      <ProductList />
    </>
  );
}
