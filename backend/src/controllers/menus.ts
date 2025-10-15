/**
 * Menu Controller
 * Управлява всички операции свързани с менюта
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { 
  CreateMenuDto, 
  UpdateMenuDto,
  PaginationParams 
} from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/menus
 * Връща всички менюта с пагинация
 */
const getAllMenus = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 }: PaginationParams = req.query;
  
  const skip = (page - 1) * limit;

  const [menus, totalCount] = await Promise.all([
    prisma.menu.findMany({
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            categories: true,
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.menu.count()
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    data: menus,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

/**
 * GET /api/menus/:id
 * Връща детайли за конкретно меню
 */
const getMenuById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          address: true,
          phone: true,
          logo: true
        }
      },
      template: {
        select: {
          id: true,
          name: true,
          description: true,


        }
      },
      categories: {
        where: { active: true },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          order: true,
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      },
      _count: {
        select: {
          categories: true,
          items: true
        }
      }
    }
  });

  if (!menu) {
    throw createError('Менюто не е намерено', 404);
  }

  res.json({
    success: true,
    data: menu
  });
});

/**
 * POST /api/menus
 * Създава ново меню за клиент
 */
const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const menuData: CreateMenuDto = {
    ...req.body,
    clientId: parseInt(req.body.clientId),
    templateId: req.body.templateId ? parseInt(req.body.templateId) : undefined
  };

  console.log('🔍 Debug - menuData:', menuData);
  console.log('🔍 Debug - clientId type:', typeof menuData.clientId);
  console.log('🔍 Debug - clientId value:', menuData.clientId);

  // Проверяваме дали клиентът съществува
  const client = await prisma.client.findUnique({
    where: { id: menuData.clientId }
  });

  console.log('🔍 Debug - found client:', client);

  if (!client) {
    throw createError('Клиентът не е намерен', 404);
  }

  // Проверяваме дали клиентът вече има меню
  const existingMenu = await prisma.menu.findUnique({
    where: { clientId: menuData.clientId }
  });

  if (existingMenu) {
    throw createError('Този клиент вече има създадено меню', 400);
  }

  // Проверяваме дали темплейтът съществува (само ако е предоставен)
  let template = null;
  if (menuData.templateId) {
    template = await prisma.template.findUnique({
      where: { id: menuData.templateId }
    });

    if (!template) {
      throw createError('Темплейтът не е намерен', 404);
    }
  }

  // Създаваме менюто
  const menu = await prisma.menu.create({
    data: {
      name: menuData.name,
      clientId: menuData.clientId,
      templateId: menuData.templateId,
      active: true,
      published: false
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      template: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  console.log('🍽️ Създадено ново меню:', {
    id: menu.id,
    name: menu.name,
    client: menu.client.name,
    template: menu.template?.name
  });

  res.status(201).json({
    success: true,
    message: 'Менюто е създадено успешно',
    data: menu
  });
});

/**
 * PUT /api/menus/:id
 * Редактира съществуващо меню
 */
const updateMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateMenuDto = req.body;

  // Проверяваме дали менюто съществува
  const existingMenu = await prisma.menu.findUnique({
    where: { id: parseInt(id) } as any
  });

  if (!existingMenu) {
    throw createError('Менюто не е намерено', 404);
  }

  // Ако се променя темплейтът, проверяваме дали новият съществува
  if (updateData.templateId) {
    const template = await prisma.template.findUnique({
      where: { id: updateData.templateId }
    });

    if (!template) {
      throw createError('Темплейтът не е намерен', 404);
    }
  }

  // Обновяваме менюто
  const updatedMenu = await prisma.menu.update({
    where: { id: parseInt(id) } as any,
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      template: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      _count: {
        select: {
          categories: true,
          items: true
        }
      }
    }
  });

  console.log('📝 Обновено меню:', {
    id: updatedMenu.id,
    name: updatedMenu.name,
    changes: Object.keys(updateData)
  });

  res.json({
    success: true,
    message: 'Менюто е обновено успешно',
    data: updatedMenu
  });
});

/**
 * DELETE /api/menus/:id
 * Изтрива меню и всичките му данни
 */
const deleteMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяваме дали менюто съществува
  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      client: {
        select: { id: true, name: true }
      },
      _count: {
        select: {
          categories: true,
          items: true
        }
      }
    }
  });

  if (!menu) {
    throw createError('Менюто не е намерено', 404);
  }

  // Изтриваме менюто (каскадно се изтриват категориите и items-ите)
  await prisma.menu.delete({
    where: { id: parseInt(id) } as any
  });

  console.log('🗑️ Изтрито меню:', {
    id: menu.id,
    name: menu.name,
    client: menu.client.name,
    hadCategories: menu._count.categories,
    hadItems: menu._count.items
  });

  res.json({
    success: true,
    message: 'Менюто е изтрито успешно'
  });
});

/**
 * POST /api/menus/:id/publish
 * Публикува меню (прави го достъпно за QR код)
 */
const publishMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяваме дали менюто съществува
  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      _count: {
        select: {
          categories: true,
          items: true
        }
      }
    }
  });

  if (!menu) {
    throw createError('Менюто не е намерено', 404);
  }

  // Проверяваме дали менюто има категории и продукти
  if (menu._count.categories === 0) {
    throw createError('Менюто трябва да има поне една категория преди да бъде публикувано', 400);
  }

  if (menu._count.items === 0) {
    throw createError('Менюто трябва да има поне един продукт преди да бъде публикувано', 400);
  }

  // Публикуваме менюто
  const updatedMenu = await prisma.menu.update({
    where: { id: parseInt(id) } as any,
    data: {
      published: true,
      active: true
    }
  });

  console.log('📢 Публикувано меню:', {
    id: updatedMenu.id,
    name: updatedMenu.name
  });

  res.json({
    success: true,
    message: 'Менюто е публикувано успешно',
    data: {
      id: updatedMenu.id,
      published: updatedMenu.published,
      active: updatedMenu.active
    }
  });
});

/**
 * POST /api/menus/:id/unpublish
 * Скрива меню от публичен достъп
 */
const unpublishMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(id) } as any
  });

  if (!menu) {
    throw createError('Менюто не е намерено', 404);
  }

  const updatedMenu = await prisma.menu.update({
    where: { id: parseInt(id) } as any,
    data: {
      published: false
    }
  });

  console.log('🔒 Скрито меню от публичен достъп:', {
    id: updatedMenu.id,
    name: updatedMenu.name
  });

  res.json({
    success: true,
    message: 'Менюто е скрито от публичен достъп',
    data: {
      id: updatedMenu.id,
      published: updatedMenu.published,
      active: updatedMenu.active
    }
  });
});

export {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  publishMenu,
  unpublishMenu
};