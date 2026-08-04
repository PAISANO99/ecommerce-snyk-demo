import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed completa...");

  const adminEmail = "admin@vibepulse.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "AdminPassword123!";
  const clientEmail = "cliente@vibepulse.com";
  const clientPassword = process.env.CLIENT_SEED_PASSWORD || "Cliente123!";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const clientHash = await bcrypt.hash(clientPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin Principal",
      password: adminHash,
      role: "ADMIN",
    },
    create: {
      name: "Admin Principal",
      email: adminEmail,
      password: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {
      name: "Cliente Demo",
      password: clientHash,
      role: "CLIENT",
    },
    create: {
      name: "Cliente Demo",
      email: clientEmail,
      password: clientHash,
      role: "CLIENT",
    },
  });

  const categoriesSeed = [
    {
      name: "Moda",
      slug: "moda",
      imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80",
      description: "Tendencias juveniles para todos los días",
    },
    {
      name: "Accesorios",
      slug: "accesorios",
      imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80",
      description: "Complementos para elevar tu outfit",
    },
    {
      name: "Calzado",
      slug: "calzado",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
      description: "Sneakers y botas para estilo urbano",
    },
    {
      name: "Deporte",
      slug: "deporte",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
      description: "Prendas activas para tu rutina",
    },
  ];

  const categories = [];
  for (const category of categoriesSeed) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categories.push(record);
  }

  const [moda, accesorios, calzado, deporte] = categories;

  const productsSeed = [
    // Moda
    {
      name: "Chaqueta Oversize Vibe",
      description: "Chaqueta estilo urbano con ajuste oversize.",
      price: 219900,
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80",
      stock: 14,
      featured: true,
      categoryId: moda.id,
    },
    {
      name: "Hoodie Street Pulse",
      description: "Hoodie unisex de algodón pesado.",
      price: 169900,
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=80",
      stock: 30,
      featured: true,
      categoryId: moda.id,
    },
    {
      name: "Camisa Oxford Urbana",
      description: "Camisa casual moderna.",
      price: 119900,
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&q=80",
      stock: 28,
      featured: true,
      categoryId: moda.id,
    },
    {
      name: "Camisa Denim Retro",
      description: "Camisa en denim liviano.",
      price: 134900,
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&q=80",
      stock: 22,
      categoryId: moda.id,
    },
    {
      name: "Camiseta Basic Core",
      description: "Camiseta básica diaria.",
      price: 64900,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80",
      stock: 60,
      featured: true,
      categoryId: moda.id,
    },
    {
      name: "Camiseta Oversize",
      description: "Camiseta oversize urbana.",
      price: 89900,
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&q=80",
      stock: 38,
      categoryId: moda.id,
    },
    {
      name: "Saco Knit Minimal",
      description: "Saco tejido minimalista.",
      price: 159900,
      imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80",
      stock: 20,
      categoryId: moda.id,
    },
    {
      name: "Chaqueta Bomber",
      description: "Chaqueta bomber ligera.",
      price: 199900,
      imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=700&q=80",
      stock: 18,
      categoryId: moda.id,
    },
    {
      name: "Blazer Urban Noir",
      description: "Blazer casual para looks elegantes de calle.",
      price: 189900,
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&q=80",
      stock: 16,
      categoryId: moda.id,
    },
    {
      name: "Jean Relaxed Blue",
      description: "Jean relaxed fit de lavado medio.",
      price: 149900,
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&q=80",
      stock: 34,
      categoryId: moda.id,
    },
    {
      name: "Pantalon Cargo District",
      description: "Cargo urbano con bolsillos amplios y corte recto.",
      price: 154900,
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&q=80",
      stock: 26,
      categoryId: moda.id,
    },
    {
      name: "Vestido Rib Soft",
      description: "Vestido tejido de ajuste cómodo para uso diario.",
      price: 124900,
      imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=700&q=80",
      stock: 19,
      categoryId: moda.id,
    },

    // Accesorios
    {
      name: "Gorra Classic",
      description: "Gorra urbana.",
      price: 59900,
      imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=700&q=80",
      stock: 50,
      categoryId: accesorios.id,
    },
    {
      name: "Gorra Snapback",
      description: "Gorra snapback moderna.",
      price: 69900,
      imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=700&q=80",
      stock: 45,
      categoryId: accesorios.id,
    },
    {
      name: "Medias Pack",
      description: "Pack de medias.",
      price: 39900,
      imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=700&q=80",
      stock: 80,
      categoryId: accesorios.id,
    },
    {
      name: "Bolso Crossbody Metro",
      description: "Bolso compacto para llevar esenciales con estilo.",
      price: 89900,
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80",
      stock: 29,
      categoryId: accesorios.id,
    },
    {
      name: "Mochila Campus Flex",
      description: "Mochila versátil con compartimento acolchado.",
      price: 139900,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80",
      stock: 21,
      categoryId: accesorios.id,
    },
    {
      name: "Cinturon Leather Edge",
      description: "Cinturón minimalista de acabado mate.",
      price: 54900,
      imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=700&q=80",
      stock: 40,
      categoryId: accesorios.id,
    },
    {
      name: "Lentes Solar Frame",
      description: "Lentes de sol con montura liviana y look moderno.",
      price: 79900,
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&q=80",
      stock: 27,
      categoryId: accesorios.id,
    },

    // Calzado
    {
      name: "Sneakers Aero",
      description: "Zapatillas urbanas.",
      price: 289900,
      imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700&q=80",
      stock: 18,
      categoryId: calzado.id,
    },
    {
      name: "Zapatos Casual",
      description: "Zapatos cómodos.",
      price: 229900,
      imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=700&q=80",
      stock: 24,
      categoryId: calzado.id,
    },
    {
      name: "Botas Urban",
      description: "Botas resistentes.",
      price: 319900,
      imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=700&q=80",
      stock: 15,
      categoryId: calzado.id,
    },
    {
      name: "Tenis Runner Flow",
      description: "Tenis livianos para caminatas y uso diario.",
      price: 209900,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80",
      stock: 23,
      categoryId: calzado.id,
    },
    {
      name: "Mocasines Ease",
      description: "Mocasines casuales con plantilla suave.",
      price: 179900,
      imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=700&q=80",
      stock: 17,
      categoryId: calzado.id,
    },
    {
      name: "High Tops Impact",
      description: "Tenis high top con silueta urbana marcada.",
      price: 259900,
      imageUrl: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=700&q=80",
      stock: 20,
      categoryId: calzado.id,
    },
    {
      name: "Sandalias Urban Slide",
      description: "Sandalias tipo slide para confort diario.",
      price: 99900,
      imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=700&q=80",
      stock: 31,
      categoryId: calzado.id,
    },

    // Deporte
    {
      name: "Jogger Motion",
      description: "Jogger deportivo.",
      price: 129900,
      imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=700&q=80",
      stock: 24,
      categoryId: deporte.id,
    },
    {
      name: "Camiseta Training",
      description: "Camiseta deportiva.",
      price: 74900,
      imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=700&q=80",
      stock: 48,
      categoryId: deporte.id,
    },
    {
      name: "Top Active Breeze",
      description: "Top deportivo de secado rápido para entrenamientos intensos.",
      price: 68900,
      imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=700&q=80",
      stock: 32,
      categoryId: deporte.id,
    },
    {
      name: "Short Flex Run",
      description: "Short transpirable con cintura elástica.",
      price: 84900,
      imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=700&q=80",
      stock: 36,
      categoryId: deporte.id,
    },
    {
      name: "Chaqueta Wind Sport",
      description: "Rompevientos liviano para exteriores.",
      price: 144900,
      imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=700&q=80",
      stock: 18,
      categoryId: deporte.id,
    },
  ];

  for (const product of productsSeed) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: product,
      });
    } else {
      await prisma.product.create({ data: product });
    }
  }

  console.log("✅ Seed lista con productos nuevos.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
