import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Get client info by slug (for QR code access)
export const getClientBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { 
        slug: slug,
        active: true 
      },
      include: {
        menu: {
          where: { published: true },
          include: {
            categories: {
              where: { active: true },
              orderBy: { order: 'asc' },
              include: {
                items: {
                  where: { available: true },
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!client || !client.menu) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or menu not available'
      });
    }

    res.json({
      success: true,
      data: {
        client: {
          name: client.name,
          description: client.description,
          address: client.address,
          phone: client.phone,
          logo: client.logo,
          slogan: client.slogan,
          socialMedia: client.socialMedia
        },
        menu: client.menu
      }
    });

  } catch (error) {
    console.error('Error fetching client by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get published menu for client
export const getPublishedMenu = async (req: Request, res: Response) => {
  try {
    const { clientSlug } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { 
        slug: clientSlug,
        active: true 
      },
      include: {
        menu: {
          where: { 
            published: true,
            active: true 
          }
        }
      }
    });

    if (!client || !client.menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not available'
      });
    }

    res.json({
      success: true,
      data: client.menu
    });

  } catch (error) {
    console.error('Error fetching published menu:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get published categories for menu
export const getPublishedCategories = async (req: Request, res: Response) => {
  try {
    const { clientSlug } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { 
        slug: clientSlug,
        active: true 
      },
      include: {
        menu: {
          where: { 
            published: true,
            active: true 
          },
          include: {
            categories: {
              where: { active: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!client || !client.menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not available'
      });
    }

    res.json({
      success: true,
      data: client.menu.categories
    });

  } catch (error) {
    console.error('Error fetching published categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get published menu items by category
export const getPublishedMenuItems = async (req: Request, res: Response) => {
  try {
    const { clientSlug, categoryId } = req.params;
    const { available, tags, search } = req.query;
    
    // Find client and verify menu is published
    const client = await prisma.client.findUnique({
      where: { 
        slug: clientSlug,
        active: true 
      },
      include: {
        menu: {
          where: { 
            published: true,
            active: true 
          }
        }
      }
    });

    if (!client || !client.menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not available'
      });
    }

    // Verify category belongs to this menu
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId as string,
        menuId: client.menu.id,
        active: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build filters
    const whereCondition: any = {
      categoryId: categoryId as string,
      category: {
        active: true,
        menu: {
          published: true,
          active: true
        }
      }
    };

    // Filter by availability
    if (available !== undefined) {
      whereCondition.available = available === 'true';
    } else {
      whereCondition.available = true; // Only show available items by default
    }

    // Filter by tags
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      whereCondition.tags = {
        hasEvery: tagArray
      };
    }

    // Search filter
    if (search) {
      whereCondition.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereCondition,
      orderBy: { order: 'asc' },
      include: {
        category: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: menuItems,
      meta: {
        total: menuItems.length,
        category: category.name
      }
    });

  } catch (error) {
    console.error('Error fetching published menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Generate QR code for client menu
export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    
    // Find client
    const client = await prisma.client.findUnique({
      where: { 
        id: clientId,
        active: true 
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Generate QR code URL (this would be your frontend URL)
    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${client.slug}`;
    
    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(menuUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'qr-codes');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Save QR code file
    const fileName = `qr-${client.slug}-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, qrCodeBuffer);

    // Update client with QR code URL
    const qrCodeUrl = `/uploads/qr-codes/${fileName}`;
    await prisma.menu.updateMany({
      where: { clientId: clientId },
      data: { qrCode: qrCodeUrl }
    });

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCodeUrl: qrCodeUrl,
        menuUrl: menuUrl,
        client: {
          id: client.id,
          name: client.name,
          slug: client.slug
        }
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get QR code for client (if exists)
export const getQRCode = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    
    const menu = await prisma.menu.findFirst({
      where: { 
        clientId: clientId,
        client: { active: true }
      },
      include: {
        client: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    if (!menu || !menu.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    res.json({
      success: true,
      data: {
        qrCodeUrl: menu.qrCode,
        menuUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${menu.client?.slug}`,
        client: menu.client
      }
    });

  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};