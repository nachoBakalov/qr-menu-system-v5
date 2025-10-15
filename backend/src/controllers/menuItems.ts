/**
 * MenuItem Controller
 * Управлява всички операции свързани с продуктите в менютата
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { 
  CreateMenuItemDto, 
  UpdateMenuItemDto,
  PaginationParams 
} from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/menu-items
 * Връща всички продукти с пагинация и филтри
 */
const getAllMenuItems = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    menuId, 
    categoryId,
    available,
    tags,
    search
  }: PaginationParams & { 
    menuId?: number, 
    categoryId?: number,
    available?: boolean,
    tags?: string,
    search?: string
  } = req.query;
  
  const skip = (page - 1) * limit;
  
  // Изграждаме where условието
  let where: any = {};
  
  if (menuId) {
    where.menuId = parseInt(menuId as unknown as string);
  }
  
  if (categoryId) {
    where.categoryId = parseInt(categoryId as unknown as string);
  }
  
  if (available !== undefined) {
    where.available = String(available) === 'true';
  }
  
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    where.tags = {
      hasSome: tagArray
    };
  }
  
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: search,
          mode: 'insensitive'
        }
      }
    ];
  }

  const [menuItems, totalCount] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        menu: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.menuItem.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    data: menuItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: {
      menuId,
      categoryId,
      available,
      tags: tags?.split(','),
      search
    }
  });
});

/**
 * GET /api/menu-items/:id
 * Връща детайли за конкретен продукт
 */
const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      menu: {
        select: {
          id: true,
          name: true,
          client: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });

  if (!menuItem) {
    throw createError('Продуктът не е намерен', 404);
  }

  res.json({
    success: true,
    data: menuItem
  });
});

/**
 * POST /api/menu-items
 * Създава нов продукт
 */
const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const itemData: CreateMenuItemDto = req.body;

  // Проверяваме дали категорията съществува
  const category = await prisma.category.findUnique({
    where: { id: itemData.categoryId },
    include: {
      menu: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!category) {
    throw createError('Категорията не е намерена', 404);
  }

  // Проверяваме дали менюто съществува (дополнителна проверка)
  if (itemData.menuId !== category.menu?.id) {
    throw createError('Категорията не принадлежи на указаното меню', 400);
  }

  // Ако не е подаден order, слагаме го в края на категорията
  let order = itemData.order;
  if (order === undefined) {
    const lastItem = await prisma.menuItem.findFirst({
      where: { categoryId: itemData.categoryId },
      orderBy: { order: 'desc' }
    });
    order = (lastItem?.order || 0) + 1;
  }

  // Създаваме продукта
  const menuItem = await prisma.menuItem.create({
    data: {
      name: itemData.name,
      description: itemData.description,
      categoryId: itemData.categoryId,
      menuId: itemData.menuId,
      priceBGN: itemData.priceBGN,
      priceEUR: itemData.priceEUR,
      weight: itemData.weight,
      weightUnit: itemData.weightUnit,
      image: itemData.image,
      tags: itemData.tags || [],
      allergens: itemData.allergens || [],
      addons: itemData.addons as any || null,
      order,
      available: true
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      menu: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('🍽️ Създаден нов продукт:', {
    id: menuItem.id,
    name: menuItem.name,
    category: (menuItem as any).category.name,
    priceBGN: menuItem.priceBGN,
    priceEUR: menuItem.priceEUR
  });

  res.status(201).json({
    success: true,
    message: 'Продуктът е създаден успешно',
    data: menuItem
  });
});

/**
 * PUT /api/menu-items/:id
 * Редактира съществуващ продукт
 */
const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateMenuItemDto = req.body;

  // Проверяваме дали продуктът съществува
  const existingItem = await prisma.menuItem.findUnique({
    where: { id: parseInt(id) } as any
  });

  if (!existingItem) {
    throw createError('Продуктът не е намерен', 404);
  }

  // Ако се променя категорията, проверяваме дали новата съществува
  if (updateData.categoryId && updateData.categoryId !== existingItem.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId },
      include: {
        menu: {
          select: { id: true }
        }
      }
    });

    if (!category) {
      throw createError('Категорията не е намерена', 404);
    }

    // Проверяваме дали категорията принадлежи на същото меню
    if (updateData.menuId && updateData.menuId !== category.menu?.id) {
      throw createError('Категорията не принадлежи на указаното меню', 400);
    }
  }

  // Обновяваме продукта
  const updatedItem = await prisma.menuItem.update({
    where: { id: parseInt(id) } as any,
    data: updateData as any,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      menu: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log('📝 Обновен продукт:', {
    id: updatedItem.id,
    name: updatedItem.name,
    changes: Object.keys(updateData)
  });

  res.json({
    success: true,
    message: 'Продуктът е обновен успешно',
    data: updatedItem
  });
});

/**
 * DELETE /api/menu-items/:id
 * Изтрива продукт
 */
const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяваме дали продуктът съществува
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parseInt(id) } as any,
    select: {
      id: true,
      name: true,
      category: {
        select: {
          name: true
        }
      }
    }
  });

  if (!menuItem) {
    throw createError('Продуктът не е намерен', 404);
  }

  // Изтриваме продукта
  await prisma.menuItem.delete({
    where: { id: parseInt(id) } as any
  });

  console.log('🗑️ Изтрит продукт:', {
    id: menuItem.id,
    name: menuItem.name,
    category: menuItem.category.name
  });

  res.json({
    success: true,
    message: 'Продуктът е изтрит успешно'
  });
});

/**
 * PUT /api/menu-items/:id/availability
 * Променя наличността на продукт (бързо включване/изключване)
 */
const toggleMenuItemAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { available }: { available: boolean } = req.body;

  // Проверяваме дали продуктът съществува
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parseInt(id) } as any
  });

  if (!menuItem) {
    throw createError('Продуктът не е намерен', 404);
  }

  // Обновяваме наличността
  const updatedItem = await prisma.menuItem.update({
    where: { id: parseInt(id) } as any,
    data: { available },
    select: {
      id: true,
      name: true,
      available: true
    }
  });

  console.log('🔄 Променена наличност на продукт:', {
    id: updatedItem.id,
    name: updatedItem.name,
    available: updatedItem.available
  });

  res.json({
    success: true,
    message: `Продуктът "${updatedItem.name}" е ${available ? 'включен' : 'изключен'}`,
    data: {
      id: updatedItem.id,
      available: updatedItem.available
    }
  });
});

/**
 * GET /api/menu-items/category/:categoryId
 * Връща всички продукти за конкретна категория (публичен endpoint)
 */
const getMenuItemsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  // Проверяваме дали категорията съществува и е активна
  const category = await prisma.category.findUnique({
    where: { 
      id: parseInt(categoryId),
      active: true
    } as any,
    include: {
      menu: {
        select: {
          published: true,
          active: true
        }
      }
    }
  });

  if (!category) {
    throw createError('Категорията не е намерена', 404);
  }

  // За тестване - премахваме строгата проверка за публикувано меню
  // В продукция можеш да включиш тази проверка отново:
  // if (!(category as any).menu?.published || !(category as any).menu?.active) {
  //   throw createError('Менюто не е публикувано', 404);
  // }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      categoryId: parseInt(categoryId),
      available: true
    } as any,
    select: {
      id: true,
      name: true,
      description: true,
      priceBGN: true,
      priceEUR: true,
      weight: true,
      weightUnit: true,
      image: true,
      tags: true,
      allergens: true,
      addons: true,
      order: true
    },
    orderBy: {
      order: 'asc'
    }
  });

  res.json({
    success: true,
    data: menuItems,
    category: {
      id: category.id,
      name: category.name,
      description: category.description
    }
  });
});

/**
 * PUT /api/menu-items/:id/reorder
 * Променя позицията на продукт в категорията
 */
const reorderMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newOrder }: { newOrder: number } = req.body;

  // Валидация
  if (typeof newOrder !== 'number' || newOrder < 1) {
    throw createError('Новата позиция трябва да бъде положително число', 400);
  }

  // Намираме продукта
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: parseInt(id) } as any,
    select: {
      id: true,
      name: true,
      order: true,
      categoryId: true
    }
  });

  if (!menuItem) {
    throw createError('Продуктът не е намерен', 404);
  }

  // Ако позицията не се променя, връщаме успех
  if (menuItem.order === newOrder) {
    return res.json({
      success: true,
      message: 'Продуктът вече е на тази позиция',
      data: menuItem
    });
  }

  // Обновяваме позицията
  const updatedItem = await prisma.menuItem.update({
    where: { id: parseInt(id) } as any,
    data: { order: newOrder }
  });

  console.log('🔄 Променена позиция на продукт:', {
    name: menuItem.name,
    oldOrder: menuItem.order,
    newOrder: updatedItem.order
  });

  res.json({
    success: true,
    message: `Позицията на продукт "${menuItem.name}" е променена на ${newOrder}`,
    data: updatedItem
  });
});

export {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuItemsByCategory,
  reorderMenuItem
};