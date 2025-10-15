import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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

// Get template by ID
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await prisma.template.findUnique({
      where: { 
        id: parseInt(id),
        active: true 
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Create template
export const createTemplate = async (req: Request, res: Response) => {
  try {
      const { name, description } = req.body;

    const template = await prisma.template.create({
      data: {
        name,
        description,
        config: {},
        active: true
      }
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
    const { name, description, active } = req.body;

    const template = await prisma.template.update({
      where: { id: id },
      data: {
        name,
        description,
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
    if ((error as any)?.code === 'P2025') {
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

// Admin: Delete template (soft delete)
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.template.update({
      where: { id: id },
      data: { active: false }
    });

    res.json({
      success: true,
      message: 'Template deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    if ((error as any)?.code === 'P2025') {
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