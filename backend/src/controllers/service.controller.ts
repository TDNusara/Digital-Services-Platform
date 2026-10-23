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
    const { category, targetAudience, pricingType, search, includeInactive } = req.query;

    const whereClause: any = {};
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    if (category) {
      whereClause.category = { slug: String(category) };
    }

    if (targetAudience && String(targetAudience) !== 'All') {
      whereClause.targetAudience = String(targetAudience);
    }

    if (pricingType && ['FIXED', 'CUSTOM_QUOTE'].includes(String(pricingType))) {
      whereClause.pricingType = String(pricingType);
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search) } },
        { shortSummary: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: [{ targetAudience: 'asc' }, { title: 'asc' }],
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
    const {
      categoryId,
      title,
      slug,
      shortSummary,
      description,
      pricingType,
      basePrice,
      targetAudience,
      turnaroundHours,
      requirementSchema,
    } = req.body;

    if (!title || !categoryId) {
      res.status(400).json({ error: 'Service title and category are required.' });
      return;
    }

    const effectiveSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      : title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);

    const priceType = pricingType === 'FIXED' ? 'FIXED' : 'CUSTOM_QUOTE';
    const price = priceType === 'FIXED' ? (parseFloat(basePrice) || 0) : 0;

    const newService = await prisma.service.create({
      data: {
        categoryId,
        title: title.trim(),
        slug: effectiveSlug,
        shortSummary: shortSummary || null,
        description: description || null,
        pricingType: priceType,
        basePrice: price,
        targetAudience: targetAudience || 'General Customers',
        turnaroundHours: parseInt(turnaroundHours) || 48,
        requirementSchema: typeof requirementSchema === 'string'
          ? requirementSchema
          : JSON.stringify(requirementSchema || []),
        isActive: true,
      },
      include: { category: true },
    });

    res.status(201).json({ service: newService, message: 'Service created successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create service: ' + error.message });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      title,
      shortSummary,
      description,
      pricingType,
      basePrice,
      targetAudience,
      turnaroundHours,
      requirementSchema,
      isActive,
    } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }

    const priceType = pricingType ? (pricingType === 'FIXED' ? 'FIXED' : 'CUSTOM_QUOTE') : existing.pricingType;
    const price = priceType === 'FIXED' ? (basePrice !== undefined ? parseFloat(basePrice) : existing.basePrice) : 0;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        categoryId: categoryId || existing.categoryId,
        title: title ? title.trim() : existing.title,
        shortSummary: shortSummary !== undefined ? shortSummary : existing.shortSummary,
        description: description !== undefined ? description : existing.description,
        pricingType: priceType,
        basePrice: price,
        targetAudience: targetAudience || existing.targetAudience,
        turnaroundHours: turnaroundHours ? parseInt(turnaroundHours) : existing.turnaroundHours,
        requirementSchema: requirementSchema !== undefined
          ? (typeof requirementSchema === 'string' ? requirementSchema : JSON.stringify(requirementSchema))
          : existing.requirementSchema,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
      include: { category: true },
    });

    res.json({ service: updated, message: 'Service updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update service: ' + error.message });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!existing) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }

    // If service has linked orders, soft delete by setting isActive to false
    if (existing._count.orders > 0) {
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ message: 'Service has existing orders, so it was deactivated from the catalog.' });
      return;
    }

    // Otherwise permanently delete
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted permanently.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete service: ' + error.message });
  }
};
