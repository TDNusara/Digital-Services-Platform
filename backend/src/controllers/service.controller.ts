import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { services: { where: { isActive: true } } },
        },
      },
    });

    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await prisma.serviceCategory.findUnique({
      where: { slug },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { basePrice: 'asc' },
        },
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    res.json({ category });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch category details.' });
  }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const whereClause: any = { isActive: true };

    if (category) {
      whereClause.category = { slug: String(category) };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search) } },
        { shortSummary: { contains: String(search) } },
      ];
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { title: 'asc' },
    });

    res.json({ services });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }

    let parsedSchema = [];
    try {
      parsedSchema = JSON.parse(service.requirementSchema);
    } catch (e) {
      parsedSchema = [];
    }

    res.json({
      service: {
        ...service,
        parsedRequirementSchema: parsedSchema,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch service.' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, title, slug, shortSummary, description, basePrice, turnaroundHours, requirementSchema } = req.body;

    const newService = await prisma.service.create({
      data: {
        categoryId,
        title,
        slug: slug.toLowerCase().trim(),
        shortSummary,
        description,
        basePrice: parseFloat(basePrice) || 0,
        turnaroundHours: parseInt(turnaroundHours) || 48,
        requirementSchema: typeof requirementSchema === 'string' ? requirementSchema : JSON.stringify(requirementSchema || []),
      },
      include: { category: true },
    });

    res.status(201).json({ service: newService });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create service: ' + error.message });
  }
};
