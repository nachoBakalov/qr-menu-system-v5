import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// Get all available templates
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.template.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get template by ID with categories and items
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await prisma.template.findUnique({
      where: { 
        id: id,
        active: true 
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Get template categories
    const categories = await prisma.templateCategory.findMany({
      where: { templateId: id },
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: {
        ...template,
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply template to client menu
export const applyTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId, menuId } = req.body;

    // Verify template exists and is active
    const template = await prisma.template.findUnique({
      where: { 
        id: templateId,
        active: true 
      },
      include: {
        templateCategories: {
          orderBy: { order: 'asc' },
          include: {
            templateItems: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Verify menu exists and belongs to authenticated client
    const menu = await prisma.menu.findUnique({
      where: { id: menuId }
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Begin transaction to apply template
    const result = await prisma.$transaction(async (tx) => {
      // Clear existing categories and items for this menu
      await tx.menuItem.deleteMany({
        where: {
          category: {
            menuId: menuId
          }
        }
      });
      
      await tx.category.deleteMany({
        where: { menuId: menuId }
      });

      // Create categories and items from template
      for (const templateCategory of template.templateCategories) {
        const createdCategory = await tx.category.create({
          data: {
            name: templateCategory.name,
            description: templateCategory.description,
            image: templateCategory.image,
            order: templateCategory.order,
            menuId: menuId
          }
        });

        // Create items for this category
        for (const templateItem of templateCategory.templateItems) {
          await tx.menuItem.create({
            data: {
              name: templateItem.name,
              description: templateItem.description,
              priceBGN: templateItem.priceBGN,
              priceEUR: templateItem.priceEUR,
              weight: templateItem.weight,
              image: templateItem.image,
              tags: templateItem.tags,
              allergens: templateItem.allergens,
              addons: templateItem.addons,
              available: true,
              order: templateItem.order,
              categoryId: createdCategory.id
            }
          });
        }
      }

      return { success: true };
    });

    res.json({
      success: true,
      message: 'Template applied successfully',
      data: { templateId, menuId }
    });

  } catch (error) {
    console.error('Error applying template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Create template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      type, 
      image, 
      categories 
    } = req.body;

    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const newTemplate = await tx.template.create({
        data: {
          name,
          description,
          type,
          image,
          active: true
        }
      });

      // Create template categories and items
      if (categories && categories.length > 0) {
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          
          const createdCategory = await tx.templateCategory.create({
            data: {
              name: category.name,
              description: category.description,
              image: category.image,
              order: category.order || i + 1,
              templateId: newTemplate.id
            }
          });

          // Create template items for this category
          if (category.items && category.items.length > 0) {
            for (let j = 0; j < category.items.length; j++) {
              const item = category.items[j];
              
              await tx.templateItem.create({
                data: {
                  name: item.name,
                  description: item.description,
                  priceBGN: item.priceBGN,
                  priceEUR: item.priceEUR,
                  weight: item.weight,
                  image: item.image,
                  tags: item.tags || [],
                  allergens: item.allergens || [],
                  addons: item.addons || [],
                  order: item.order || j + 1,
                  templateCategoryId: createdCategory.id
                }
              });
            }
          }
        }
      }

      return newTemplate;
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });

  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update template
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, type, image, active } = req.body;

    const template = await prisma.template.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        type,
        image,
        active
      }
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });

  } catch (error) {
    console.error('Error updating template:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Delete template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.template.update({
      where: { id: parseInt(id) },
      data: { active: false }
    });

    res.json({
      success: true,
      message: 'Template deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};