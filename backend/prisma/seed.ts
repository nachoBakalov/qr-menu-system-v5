/**
 * Database Seeder
 * Създава първоначални данни за тестване
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Започвам seeding на базата...');

  // Създаваме admin потребител
  const adminEmail = 'admin@burgasdigitalstudio.bg';
  const adminPassword = 'admin123';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Главен Администратор',
      role: 'ADMIN'
    }
  });

  console.log('👤 Създаден admin потребител:', {
    email: admin.email,
    name: admin.name,
    role: admin.role
  });

  // Създаваме основни темплейти
  const templates = [
    {
      name: 'Modern',
      description: 'Модерен и чист дизайн',
      config: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          background: '#ffffff',
          text: '#1e293b'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        },
        layout: 'grid' as const
      }
    },
    {
      name: 'Classic',
      description: 'Класически елегантен дизайн',
      config: {
        colors: {
          primary: '#dc2626',
          secondary: '#991b1b',
          background: '#fefefe',
          text: '#374151'
        },
        fonts: {
          heading: 'Playfair Display',
          body: 'Source Sans Pro'
        },
        layout: 'list' as const
      }
    },
    {
      name: 'Dark',
      description: 'Тъмен стилен дизайн',
      config: {
        colors: {
          primary: '#f59e0b',
          secondary: '#d97706',
          background: '#111827',
          text: '#f9fafb'
        },
        fonts: {
          heading: 'Roboto',
          body: 'Roboto'
        },
        layout: 'cards' as const
      }
    }
  ];

  for (const templateData of templates) {
    const template = await prisma.template.upsert({
      where: { name: templateData.name },
      update: {},
      create: templateData
    });
    console.log('🎨 Създаден темплейт:', template.name);
  }

  // Създаваме тестов клиент
  const testClient = await prisma.client.upsert({
    where: { slug: 'test-restaurant' },
    update: {},
    create: {
      name: 'Тест Ресторант',
      slug: 'test-restaurant',
      description: 'Тестов ресторант за демонстрация',
      address: 'ул. Тестова 123, София',
      phone: '+359 88 888 8888',
      slogan: 'Най-добрата храна в града',
      socialMedia: {
        facebook: 'https://facebook.com/test-restaurant',
        instagram: 'https://instagram.com/test-restaurant',
        website: 'https://test-restaurant.com'
      }
    }
  });

  console.log('🏪 Създаден тестов клиент:', testClient.name);

  console.log('✅ Seeding завършен успешно!');
  console.log('\n📝 Данни за вход:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Парола: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Грешка при seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });