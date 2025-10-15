/**
 * Category Controller
 * Управлява всички операции свързани с категории в менютата
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto,
  PaginationParams 
} from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/categories
 * Връща всички категории с пагинация
 */
const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, menuId }: PaginationParams & { menuId?: number } = req.query;
  
  const skip = (page - 1) * limit;
  
  // Ако е подаден menuId, филтрираме по него
  const where = menuId ? { menuId: parseInt(menuId as unknown as string) } as any : {};

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
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
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.category.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    success: true,
    data: categories,
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
 * GET /api/categories/:id
 * Връща детайли за конкретна категория
 */
const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
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
      },
      items: {
        where: { available: true },
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
          order: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      _count: {
        select: {
          items: true
        }
      }
    }
  });

  if (!category) {
    throw createError('Категорията не е намерена', 404);
  }

  res.json({
    success: true,
    data: category
  });
});

/**
 * POST /api/categories
 * Създава нова категория в меню
 */
const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryData: CreateCategoryDto = req.body;

  // Проверяваме дали менюто съществува
  const menu = await prisma.menu.findUnique({
    where: { id: categoryData.menuId }
  });

  if (!menu) {
    throw createError('Менюто не е намерено', 404);
  }

  // Ако не е подаден order, слагаме го в края
  let order = categoryData.order;
  if (order === undefined) {
    const lastCategory = await prisma.category.findFirst({
      where: { menuId: categoryData.menuId },
      orderBy: { order: 'desc' }
    });
    order = (lastCategory?.order || 0) + 1;
  }

  // Създаваме категорията
  const category = await prisma.category.create({
    data: {
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image,
      order,
      menuId: categoryData.menuId,
      active: true
    },
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          client: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  console.log('📂 Създадена нова категория:', {
    id: category.id,
    name: category.name,
    menu: category.menu.name,
    order: category.order
  });

  res.status(201).json({
    success: true,
    message: 'Категорията е създадена успешно',
    data: category
  });
});

/**
 * PUT /api/categories/:id
 * Редактира съществуваща категория
 */
const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateCategoryDto = req.body;

  // Проверяваме дали категорията съществува
  const existingCategory = await prisma.category.findUnique({
    where: { id: parseInt(id) } as any
  });

  if (!existingCategory) {
    throw createError('Категорията не е намерена', 404);
  }

  // Ако се променя менюто, проверяваме дали новото съществува
  if (updateData.menuId && updateData.menuId !== existingCategory.menuId) {
    const menu = await prisma.menu.findUnique({
      where: { id: updateData.menuId }
    });

    if (!menu) {
      throw createError('Менюто не е намерено', 404);
    }
  }

  // Обновяваме категорията
  const updatedCategory = await prisma.category.update({
    where: { id: parseInt(id) } as any,
    data: updateData,
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          client: {
            select: {
              id: true,
              name: true
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
  });

  console.log('📝 Обновена категория:', {
    id: updatedCategory.id,
    name: updatedCategory.name,
    changes: Object.keys(updateData)
  });

  res.json({
    success: true,
    message: 'Категорията е обновена успешно',
    data: updatedCategory
  });
});

/**
 * DELETE /api/categories/:id
 * Изтрива категория и всичките ѝ продукти
 */
const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяваме дали категорията съществува
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) } as any,
    include: {
      _count: {
        select: {
          items: true
        }
      }
    }
  });

  if (!category) {
    throw createError('Категорията не е намерена', 404);
  }

  // Изтриваме категорията (каскадно се изтриват и items-ите)
  await prisma.category.delete({
    where: { id: parseInt(id) } as any
  });

  console.log('🗑️ Изтрита категория:', {
    id: category.id,
    name: category.name,
    hadItems: category._count.items
  });

  res.json({
    success: true,
    message: 'Категорията е изтрита успешно'
  });
});

/**
 * PUT /api/categories/:id/reorder
 * Променя позицията на категория (по-проста алтернатива на move)
 */
const reorderCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newOrder }: { newOrder: number } = req.body;

  // Валидация
  if (typeof newOrder !== 'number' || newOrder < 1) {
    throw createError('Новата позиция трябва да бъде положително число', 400);
  }

  // Намираме категорията
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) } as any,
    select: {
      id: true,
      name: true,
      order: true,
      menuId: true
    }
  });

  if (!category) {
    throw createError('Категорията не е намерена', 404);
  }

  // Ако позицията не се променя, връщаме успех
  if (category.order === newOrder) {
    return res.json({
      success: true,
      message: 'Категорията вече е на тази позиция',
      data: category
    });
  }

  // Обновяваме позицията
  const updatedCategory = await prisma.category.update({
    where: { id: parseInt(id) } as any,
    data: { order: newOrder }
  });

  console.log('🔄 Променена позиция на категория:', {
    category: category.name,
    oldOrder: category.order,
    newOrder: updatedCategory.order
  });

  res.json({
    success: true,
    message: `Позицията на категория "${category.name}" е променена на ${newOrder}`,
    data: updatedCategory
  });
});

/**
 * GET /api/categories/reorder/:menuId
 * Връща категориите с пълна информация за подредбата (админ endpoint)
 */
const getCategoriesForReorder = asyncHandler(async (req: Request, res: Response) => {
  const { menuId } = req.params;

  const categories = await prisma.category.findMany({
    where: {
      menuId: parseInt(menuId),
    } as any,
    select: {
      id: true,
      name: true,
      order: true,
      active: true,
      _count: {
        select: {
          items: true
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  });

  res.json({
    success: true,
    data: categories,
    message: `Намерени ${categories.length} категории за меню ${menuId}`
  });
});

/**
 * GET /api/categories/menu/:menuId
 * Връща всички категории за конкретно меню (публичен endpoint)
 */
const getCategoriesByMenu = asyncHandler(async (req: Request, res: Response) => {
  const { menuId } = req.params;

  // Проверяваме дали менюто съществува и е публикувано
  const menu = await prisma.menu.findUnique({
    where: { 
      id: parseInt(menuId) as any,
      published: true,
      active: true
    }
  });

  if (!menu) {
    throw createError('Менюто не е намерено или не е публикувано', 404);
  }

  const categories = await prisma.category.findMany({
    where: {
      menuId: parseInt(menuId),
      active: true
    } as any,
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      order: true,
      _count: {
        select: {
          items: {
            where: { available: true }
          }
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  });

  res.json({
    success: true,
    data: categories
  });
});

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
  getCategoriesForReorder,
  getCategoriesByMenu
};