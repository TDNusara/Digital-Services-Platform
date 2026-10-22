import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user!.userId;

    const ratingNum = parseInt(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        assignments: { where: { status: 'ACCEPTED' }, take: 1 },
        review: true,
      },
    });

    if (!order || order.customerId !== customerId) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Reviews can only be submitted for completed orders.' });
      return;
    }

    if (order.review) {
      res.status(400).json({ error: 'A review has already been submitted for this order.' });
      return;
    }

    const workerId = order.assignments[0]?.workerId;
    if (!workerId) {
      res.status(400).json({ error: 'No assigned worker found to review.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        customerId,
        workerId,
        rating: ratingNum,
        comment,
      },
    });

    // Update worker rating average
    const allWorkerReviews = await prisma.review.findMany({
      where: { workerId },
      select: { rating: true },
    });

    const totalRatings = allWorkerReviews.length;
    const avgRating = allWorkerReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await prisma.workerProfile.update({
      where: { userId: workerId },
      data: {
        ratingAvg: parseFloat(avgRating.toFixed(2)),
        ratingCount: totalRatings,
      },
    });

    res.status(201).json({ message: 'Review submitted successfully!', review });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit review: ' + error.message });
  }
};

export const getWorkerReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { workerId, isPublic: true },
      include: {
        customer: { select: { fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch worker reviews.' });
  }
};
