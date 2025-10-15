/**
 * Client Controller
 * Управлява всички операции свързани с клиенти (ресторанти)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();
import { 
  CreateClientDto, 
  UpdateClientDto,
  PaginationParams 
} from '../types';

/**
 * GET /api/clients
 * Връща списък с всички клиенти с пагинация
 */
const getAllClients = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query as PaginationParams;

  // Изчисляваме offset за пагинацията
  const offset = (page - 1) * limit;

  // Паралелно извикване за данни и общ брой
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        menu: {
          select: {
            id: true,
            name: true,
            active: true,
            published: true
          }
        }
      }
    }),
    prisma.client.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: clients,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

/**
 * GET /api/clients/:id
 * Връща детайли за конкретен клиент
 */
const getClientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      menu: {
        include: {
          template: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              active: true,
              _count: {
                select: {
                  items: true
                }
              }
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        }
      }
    }
  });

  if (!client) {
    throw createError('Клиентът не е намерен', 404);
  }

  res.json({
    success: true,
    data: client
  });
});

/**
 * POST /api/clients
 * Създава нов клиент
 */
const createClient = asyncHandler(async (req: Request, res: Response) => {
  const clientData: CreateClientDto = req.body;

  // Валидация на задължителни полета
  if (!clientData.name || !clientData.slug) {
    throw createError('Име и slug са задължителни', 400);
  }

  // Проверяваме дали slug-ът вече съществува
  const existingClient = await prisma.client.findUnique({
    where: { slug: clientData.slug }
  });

  if (existingClient) {
    throw createError('Клиент с този slug вече съществува', 400);
  }

  // Създаваме клиента
  const client = await prisma.client.create({
    data: {
      name: clientData.name,
      slug: clientData.slug.toLowerCase(), // Slug винаги в малки букви
      description: clientData.description,
      address: clientData.address,
      phone: clientData.phone,
      logo: clientData.logo,
      slogan: clientData.slogan,
      socialMedia: clientData.socialMedia || {}
    }
  });

  console.log('🏪 Създаден нов клиент:', {
    id: client.id,
    name: client.name,
    slug: client.slug
  });

  res.status(201).json({
    success: true,
    message: 'Клиентът е създаден успешно',
    data: client
  });
});

/**
 * PUT /api/clients/:id
 * Редактира съществуващ клиент
 */
const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateClientDto = req.body;

  // Проверяваме дали клиентът съществува
  const existingClient = await prisma.client.findUnique({
    where: { id: parseInt(id) } as any
  });

  if (!existingClient) {
    throw createError('Клиентът не е намерен', 404);
  }

  // Ако се променя slug, проверяваме дали новият не е зает
  if (updateData.slug && updateData.slug !== existingClient.slug) {
    const slugExists = await prisma.client.findUnique({
      where: { slug: updateData.slug }
    });

    if (slugExists) {
      throw createError('Клиент с този slug вече съществува', 400);
    }
  }

  // Обновяваме клиента
  const updatedClient = await prisma.client.update({
    where: { id: parseInt(id) } as any,
    data: {
      ...updateData,
      slug: updateData.slug ? updateData.slug.toLowerCase() : undefined
    },
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          active: true,
          published: true
        }
      }
    }
  });

  console.log('🔄 Обновен клиент:', {
    id: updatedClient.id,
    name: updatedClient.name,
    changes: Object.keys(updateData)
  });

  res.json({
    success: true,
    message: 'Клиентът е обновен успешно',
    data: updatedClient
  });
});

/**
 * DELETE /api/clients/:id
 * Изтрива клиент и всичките му данни
 */
const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяваме дали клиентът съществува
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      menu: {
        select: { id: true, name: true }
      }
    }
  });

  if (!client) {
    throw createError('Клиентът не е намерен', 404);
  }

  // Изтриваме клиента (каскадно се изтриват и менюто, категориите и items-ите)
  await prisma.client.delete({
    where: { id: parseInt(id) } as any
  });

  console.log('🗑️ Изтрит клиент:', {
    id: client.id,
    name: client.name,
    hadMenu: !!(client as any).menu
  });

  res.json({
    success: true,
    message: 'Клиентът е изтрит успешно'
  });
});

/**
 * GET /api/clients/slug/:slug
 * Намира клиент по slug (за публичен достъп)
 */
const getClientBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const client = await prisma.client.findUnique({
    where: { 
      slug: slug.toLowerCase(),
      active: true // Само активни клиенти
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      phone: true,
      logo: true,
      slogan: true,
      socialMedia: true,
      menu: {
        where: {
          published: true // Само публикувани менюта
        },
        include: {
          template: true,
          categories: {
            where: { active: true },
            include: {
              items: {
                where: { available: true },
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!client) {
    throw createError('Клиентът не е намерен или не е активен', 404);
  }

  if (!client.menu) {
    throw createError('Менюто не е налично или не е публикувано', 404);
  }

  res.json({
    success: true,
    data: client
  });
});

export const clientController = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientBySlug
};