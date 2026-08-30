import { PrismaClient, Prisma, UserEventType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["Computer Peripherals", "computer-peripherals"],
  ["Smartphones", "smartphones"],
  ["Home Office", "home-office"],
  ["Audio", "audio"],
  ["Gaming", "gaming"],
  ["Smart Home", "smart-home"]
] as const;

const brands = [
  ["Logitech", "logitech"],
  ["Apple", "apple"],
  ["Sony", "sony"],
  ["Anker", "anker"],
  ["Keychron", "keychron"],
  ["Samsung", "samsung"],
  ["Dell", "dell"],
  ["Razer", "razer"]
] as const;

const tagPool = [
  "wireless",
  "gaming",
  "office",
  "portable",
  "premium",
  "budget",
  "ergonomic",
  "mechanical",
  "usb-c",
  "noise-cancelling"
];

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length] as T;
}

function money(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

async function main() {
  await prisma.recommendationClick.deleteMany();
  await prisma.recommendationImpression.deleteMany();
  await prisma.userEvent.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.recommendationConfig.deleteMany();

  const [admin, user] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin",
        role: "SUPER_ADMIN",
        passwordHash: await bcrypt.hash("Admin123456!", 12)
      }
    }),
    prisma.user.create({
      data: {
        email: "user@example.com",
        name: "Sample User",
        role: "USER",
        passwordHash: await bcrypt.hash("User123456!", 12)
      }
    })
  ]);

  const createdCategories = await Promise.all(
    categories.map(([name, slug]) =>
      prisma.category.create({
        data: { name, slug, description: `${name} curated products` }
      })
    )
  );

  const createdBrands = await Promise.all(
    brands.map(([name, slug]) =>
      prisma.brand.create({
        data: { name, slug, description: `${name} official catalog` }
      })
    )
  );

  const products = [];
  for (let index = 0; index < 72; index += 1) {
    const category = pick(createdCategories, index);
    const brand = pick(createdBrands, index * 3);
    const price = 39 + ((index * 37) % 900);
    const product = await prisma.product.create({
      data: {
        name: `${brand.name} ${category.name} ${index + 1}`,
        slug: `${brand.slug}-${category.slug}-${index + 1}`,
        description:
          `A production-quality sample product for ${category.name}. ` +
          "It includes enough metadata to exercise search, filtering, and recommendation ranking.",
        shortDescription: `${category.name} by ${brand.name}`,
        categoryId: category.id,
        brandId: brand.id,
        price: money(price),
        originalPrice: money(price * 1.18),
        currency: "USD",
        coverImage: `https://picsum.photos/seed/prs-${index + 1}/640/480`,
        images: [
          `https://picsum.photos/seed/prs-${index + 1}-a/960/720`,
          `https://picsum.photos/seed/prs-${index + 1}-b/960/720`
        ],
        stock: 10 + (index % 30),
        status: "ACTIVE",
        attributes: {
          color: pick(["Black", "White", "Silver", "Blue"], index),
          warrantyMonths: 12 + (index % 3) * 12
        },
        tags: {
          create: [0, 1, 2].map((offset) => {
            const name = pick(tagPool, index + offset);
            return { name, slug: name };
          })
        },
        createdAt: new Date(Date.now() - index * 86_400_000)
      }
    });
    products.push(product);
  }

  const eventTypes: UserEventType[] = [
    "PRODUCT_VIEW",
    "PRODUCT_CLICK",
    "FAVORITE",
    "ADD_TO_CART",
    "PURCHASE"
  ];

  for (let index = 0; index < 48; index += 1) {
    const product = products[index % 24] as (typeof products)[number];
    const eventType = pick(eventTypes, index);
    await prisma.userEvent.create({
      data: {
        userId: user.id,
        visitorId: "visitor-sample-user",
        sessionId: `seed-session-${Math.floor(index / 8)}`,
        eventType,
        productId: product.id,
        categoryId: product.categoryId,
        source: "seed",
        page: index % 2 === 0 ? "product-detail" : "home",
        metadata: { duration: 12 + index, position: index % 8 },
        createdAt: new Date(Date.now() - index * 12 * 60 * 60 * 1000)
      }
    });
  }

  await prisma.searchHistory.createMany({
    data: [
      {
        userId: user.id,
        visitorId: "visitor-sample-user",
        sessionId: "seed-session-search",
        query: "mechanical keyboard",
        resultCount: 14
      },
      {
        userId: user.id,
        visitorId: "visitor-sample-user",
        sessionId: "seed-session-search",
        query: "wireless headset",
        resultCount: 9
      }
    ]
  });

  await prisma.favorite.createMany({
    data: products.slice(2, 7).map((product) => ({ userId: user.id, productId: product.id })),
    skipDuplicates: true
  });

  const cart = await prisma.cart.create({ data: { userId: user.id } });
  await prisma.cartItem.createMany({
    data: products.slice(8, 11).map((product) => ({
      cartId: cart.id,
      productId: product.id,
      quantity: 1 + (Number(product.price) % 2)
    }))
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PAID",
      total: money(499),
      items: {
        create: products.slice(0, 3).map((product) => ({
          productId: product.id,
          quantity: 1,
          price: product.price
        }))
      }
    }
  });

  for (let index = 0; index < 20; index += 1) {
    const product = products[(index * 5) % products.length] as (typeof products)[number];
    const impression = await prisma.recommendationImpression.create({
      data: {
        userId: user.id,
        visitorId: "visitor-sample-user",
        productId: product.id,
        strategy: pick(["for-you", "popular", "home", "similar"], index),
        position: index % 10,
        score: 8 - index * 0.08,
        reason: { category: 2.1, brand: 1.1, tags: 1.7, popularity: 1.2, freshness: 0.5 }
      }
    });
    if (index % 3 === 0) {
      await prisma.recommendationClick.create({
        data: {
          impressionId: impression.id,
          userId: user.id,
          visitorId: "visitor-sample-user",
          productId: product.id,
          strategy: impression.strategy,
          position: impression.position
        }
      });
    }
  }

  await prisma.userProfile.create({
    data: {
      userId: user.id,
      visitorId: "visitor-sample-user",
      categories: { "computer-peripherals": 0.9, gaming: 0.6 },
      brands: { logitech: 0.7, keychron: 0.8 },
      tags: { wireless: 0.8, mechanical: 0.9 },
      priceRange: { min: 80, max: 500 }
    }
  });

  await prisma.recommendationConfig.create({
    data: {
      key: "default",
      description: "Default explainable ranking config",
      value: {
        behaviorWeights: {
          PRODUCT_IMPRESSION: 0.1,
          PRODUCT_VIEW: 1,
          PRODUCT_CLICK: 2,
          SEARCH: 2,
          FAVORITE: 5,
          ADD_TO_CART: 7,
          PURCHASE: 10
        },
        scoreWeights: {
          category: 0.3,
          brand: 0.15,
          tags: 0.2,
          price: 0.1,
          popularity: 0.15,
          freshness: 0.1,
          collaborative: 0
        },
        decay: { halfLifeDays: 30 },
        repeatExposurePenalty: { windowDays: 7, penaltyPerImpression: 0.12, maxPenalty: 0.6 }
      }
    }
  });

  console.log({
    users: [admin.email, user.email],
    products: products.length,
    orderId: order.id
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
