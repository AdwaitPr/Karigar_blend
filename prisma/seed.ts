import { PrismaClient } from "@prisma/client";
import { artisans, crafts, journal, products, regions } from "../src/data/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Kārigar database seeding...");

  // 1. Clean existing records in safe deletion order
  await prisma.auditLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.sellerOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.artisan.deleteMany();
  await prisma.craft.deleteMany();
  await prisma.region.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users
  const adminUser = await prisma.user.create({
    data: {
      id: "10000000-0000-0000-0000-000000000001",
      email: "curator@karigar.in",
      role: "ADMIN",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      id: "10000000-0000-0000-0000-000000000002",
      email: "buyer@karigar.in",
      role: "CUSTOMER",
    },
  });

  const sellerAUser = await prisma.user.create({
    data: {
      id: "10000000-0000-0000-0000-000000000003",
      email: "ansari.silk@karigar.in",
      role: "ARTISAN_SELLER",
    },
  });

  const sellerBUser = await prisma.user.create({
    data: {
      id: "10000000-0000-0000-0000-000000000004",
      email: "hansaben.kutch@karigar.in",
      role: "ARTISAN_SELLER",
    },
  });

  // 3. Customer Profile & Address
  const customer = await prisma.customer.create({
    data: {
      id: "20000000-0000-0000-0000-000000000001",
      userId: customerUser.id,
      fullName: "Ananya Roy",
    },
  });

  const shippingAddress = await prisma.address.create({
    data: {
      id: "30000000-0000-0000-0000-000000000001",
      customerId: customer.id,
      recipientName: "Ananya Roy",
      addressLine1: "42 Golf Links",
      addressLine2: "New Delhi",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110003",
      country: "IN",
      phone: "+919876543210",
    },
  });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { defaultShippingAddressId: shippingAddress.id },
  });

  // 4. Sellers
  const sellerA = await prisma.seller.create({
    data: {
      id: "40000000-0000-0000-0000-000000000001",
      userId: sellerAUser.id,
      legalName: "Abdul Rahim Ansari Handlooms Pvt Ltd",
      tradeName: "Ansari Silk Weavers",
      gstin: "09AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      bankDetails: {
        bankName: "State Bank of India",
        accountNumber: "30012345678",
        ifscCode: "SBIN0000523",
        accountHolderName: "Abdul Rahim Ansari",
      },
      verificationStatus: "VERIFIED",
      commissionRatePercentage: 15.0,
    },
  });

  const sellerB = await prisma.seller.create({
    data: {
      id: "40000000-0000-0000-0000-000000000002",
      userId: sellerBUser.id,
      legalName: "Kutch Artisan Craft Cooperative",
      tradeName: "Hansaben Ahir Embroidery",
      gstin: "24BBBBB0000B1Z8",
      pan: "BBBBB0000B",
      bankDetails: {
        bankName: "HDFC Bank",
        accountNumber: "50100234567890",
        ifscCode: "HDFC0000123",
        accountHolderName: "Hansaben Ahir",
      },
      verificationStatus: "VERIFIED",
      commissionRatePercentage: 15.0,
    },
  });

  // 5. Regions
  for (const r of regions) {
    await prisma.region.create({
      data: {
        id: r.id,
        place: r.place,
        state: r.state,
        lat: r.lat,
        lng: r.lng,
      },
    });
  }

  // 6. Crafts
  for (const c of crafts) {
    const categoryMap: Record<string, "TEXTILE" | "WOOD" | "PAINTING"> = {
      Textile: "TEXTILE",
      Wood: "WOOD",
      Painting: "PAINTING",
    };

    await prisma.craft.create({
      data: {
        id: c.id,
        source: c.source === "verified" ? "VERIFIED" : "DEMO",
        place: c.place,
        name: c.name,
        medium: c.medium,
        category: categoryMap[c.category] ?? "TEXTILE",
        regionId: c.regionId,
        material: c.material,
        swatch: c.swatch,
        note: c.note,
        image: c.image,
      },
    });
  }

  // 7. Artisans
  for (const a of artisans) {
    const assignedSellerId = a.id.includes("ansari") ? sellerA.id : sellerB.id;
    await prisma.artisan.create({
      data: {
        id: a.id,
        source: a.source === "verified" ? "VERIFIED" : "DEMO",
        numberLabel: a.number,
        name: a.name,
        pronoun: a.pronoun,
        regionId: a.regionId,
        craftId: a.craftId,
        village: a.village,
        practice: a.practice,
        yearsExperience: a.years,
        sinceYear: a.since,
        quote: a.quote,
        bio: a.bio,
        portrait: a.portrait,
        plateCaption: a.plate,
        sellerId: assignedSellerId,
      },
    });
  }

  // 8. Products, ProductVariants, and Inventories
  const availabilityMap: Record<string, "READY" | "MADE_TO_ORDER" | "ONE_OF_ONE"> = {
    ready: "READY",
    "made-to-order": "MADE_TO_ORDER",
    "one-of-one": "ONE_OF_ONE",
  };

  const createdVariantMap = new Map<string, string>();

  for (const p of products) {
    const sellerId = p.artisanId.includes("ansari") ? sellerA.id : sellerB.id;
    const basePricePaise = BigInt(p.price) * 100n; // Convert INR rupees to integer paise

    const createdProduct = await prisma.product.create({
      data: {
        id: p.id,
        source: p.source === "verified" ? "VERIFIED" : "DEMO",
        name: p.name,
        basePricePaise,
        craftId: p.craftId,
        regionId: p.regionId,
        artisanId: p.artisanId,
        sellerId,
        material: p.material,
        technique: p.technique,
        craftingTime: p.time,
        dimensions: p.dimensions,
        description: p.description,
        story: p.story,
        images: p.images,
        detail: p.detail,
        framed: p.framed,
        availabilityStatus: availabilityMap[p.availability.status] ?? "READY",
      },
    });

    // Create default variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: createdProduct.id,
        sku: `SKU-${p.id.toUpperCase()}-DEF`,
        attributes: { size: "Standard" },
        priceAdjustmentPaise: 0n,
      },
    });

    createdVariantMap.set(p.id, variant.id);

    // Create Inventory record
    const isOneOfOne = p.availability.status === "one-of-one";
    const isMadeToOrder = p.availability.status === "made-to-order";

    await prisma.inventory.create({
      data: {
        variantId: variant.id,
        sellerId,
        stockQuantity: isOneOfOne ? 1 : isMadeToOrder ? 0 : 5,
        allocatedQuantity: 0,
        reservedQuantity: 0,
        leadTimeDays: isMadeToOrder ? 30 : null,
        isAvailable: true,
      },
    });
  }

  // 9. Multi-Seller Order Fixture (`K-90210`)
  console.log("📦 Creating multi-seller order fixture (K-90210)...");
  const p1 = products[0]; // Banarasi Silk Stole (Seller A)
  const p2 = products[1]; // Kutch Mirrorwork Panel (Seller B)

  const v1Id = createdVariantMap.get(p1.id)!;
  const v2Id = createdVariantMap.get(p2.id)!;

  const p1PricePaise = BigInt(p1.price) * 100n; // ₹26,900 = 2,690,000 paise
  const p2PricePaise = BigInt(p2.price) * 100n; // ₹11,800 = 1,180,000 paise
  const subtotalPaise = p1PricePaise + p2PricePaise; // 3,870,000 paise (₹38,700)
  const taxPaise = 0n;
  const shippingPaise = 0n;
  const totalPaise = subtotalPaise + taxPaise + shippingPaise;

  const topOrder = await prisma.order.create({
    data: {
      id: "50000000-0000-0000-0000-000000000001",
      orderNumber: "K-90210",
      customerId: customer.id,
      status: "PAID",
      subtotalPaise,
      taxPaise,
      shippingPaise,
      totalPaise,
      shippingAddress: {
        recipientName: shippingAddress.recipientName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      paymentIntentId: "pi_karigar_demo_90210",
      paidAt: new Date(),
    },
  });

  // Seller Order A (Seller A - Ansari Silk)
  const commA = (p1PricePaise * 1500n) / 10000n; // 15.00% commission
  const sellerOrderA = await prisma.sellerOrder.create({
    data: {
      id: "60000000-0000-0000-0000-000000000001",
      orderId: topOrder.id,
      sellerId: sellerA.id,
      sellerOrderNumber: "K-90210-A",
      status: "IN_CRAFTING",
      subtotalPaise: p1PricePaise,
      commissionPaise: commA,
      taxPaise: 0n,
      sellerPayoutPaise: p1PricePaise - commA,
      acceptedAt: new Date(),
      items: {
        create: [
          {
            productId: p1.id,
            variantId: v1Id,
            quantity: 1,
            unitPricePaise: p1PricePaise,
            lineSubtotalPaise: p1PricePaise,
            productNameSnapshot: p1.name,
            variantAttributesSnapshot: { size: "Standard" },
            sellerNameSnapshot: sellerA.tradeName,
          },
        ],
      },
    },
  });

  // Seller Order B (Seller B - Hansaben Kutch)
  const commB = (p2PricePaise * 1500n) / 10000n; // 15.00% commission
  const sellerOrderB = await prisma.sellerOrder.create({
    data: {
      id: "60000000-0000-0000-0000-000000000002",
      orderId: topOrder.id,
      sellerId: sellerB.id,
      sellerOrderNumber: "K-90210-B",
      status: "SHIPPED",
      subtotalPaise: p2PricePaise,
      commissionPaise: commB,
      taxPaise: 0n,
      sellerPayoutPaise: p2PricePaise - commB,
      waybillNumber: "WAYBILL-KUTCH-90210B",
      trackingUrl: "https://tracking.karigar.in/WAYBILL-KUTCH-90210B",
      acceptedAt: new Date(),
      shippedAt: new Date(),
      items: {
        create: [
          {
            productId: p2.id,
            variantId: v2Id,
            quantity: 1,
            unitPricePaise: p2PricePaise,
            lineSubtotalPaise: p2PricePaise,
            productNameSnapshot: p2.name,
            variantAttributesSnapshot: { size: "Standard" },
            sellerNameSnapshot: sellerB.tradeName,
          },
        ],
      },
    },
  });

  // 10. Journal Entries
  for (const j of journal) {
    await prisma.journalEntry.create({
      data: {
        id: j.id,
        source: j.source === "verified" ? "VERIFIED" : "DEMO",
        indexLabel: j.index,
        kind: j.kind,
        minutes: j.minutes,
        title: j.title,
        excerpt: j.excerpt,
        image: j.image,
      },
    });
  }

  console.log("✅ Kārigar seed data successfully created!");
  console.log(`   - Users: 4`);
  console.log(`   - Sellers: 2`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Multi-seller order: ${topOrder.orderNumber} (Seller Orders: ${sellerOrderA.sellerOrderNumber}, ${sellerOrderB.sellerOrderNumber})`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
