import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

export const getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalOrders = await prisma.order.count();
    const pendingReviewCount = await prisma.order.count({ where: { status: 'PENDING_REVIEW' } });
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: { in: ['READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC'] },
      },
    });
    const completedOrdersCount = await prisma.order.count({ where: { status: 'COMPLETED' } });

    // Financial summaries
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { quotedPrice: true, platformFee: true, workerPayout: true },
    });

    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.quotedPrice || 0), 0);
    const platformProfit = completedOrders.reduce((sum, o) => sum + o.platformFee, 0);

    const pendingWorkersCount = await prisma.workerProfile.count({
      where: { verificationStatus: 'PENDING' },
    });
    const approvedWorkersCount = await prisma.workerProfile.count({
      where: { verificationStatus: 'APPROVED' },
    });

    res.json({
      stats: {
        totalOrders,
        pendingReviewCount,
        activeOrdersCount,
        completedOrdersCount,
        totalRevenue,
        platformProfit,
        pendingWorkersCount,
        approvedWorkersCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate platform statistics.' });
  }
};

export const qcApprove = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const adminId = req.user!.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        submissions: { where: { status: 'PENDING_QC' }, take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.status !== 'SUBMITTED_FOR_QC') {
      res.status(400).json({ error: `Cannot run QC on order with status ${order.status}.` });
      return;
    }

    const latestSubmission = order.submissions[0];

    await prisma.$transaction([
      ...(latestSubmission
        ? [
            prisma.workSubmission.update({
              where: { id: latestSubmission.id },
              data: {
                status: 'APPROVED_BY_ADMIN',
                reviewedById: adminId,
                reviewedAt: new Date(),
              },
            }),
          ]
        : []),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'READY_FOR_CUSTOMER',
          statusHistory: {
            create: {
              fromStatus: 'SUBMITTED_FOR_QC',
              toStatus: 'READY_FOR_CUSTOMER',
              changedById: adminId,
              notes: 'Deliverable passed Admin Quality Check. Unlocked for Customer review.',
            },
          },
        },
      }),
      // Customer notification
      prisma.notification.create({
        data: {
          userId: order.customerId,
          title: `Work Ready for Download: ${order.orderNumber}`,
          message: `Your order "${order.title}" has been quality-checked and is ready for download!`,
          link: `/customer/orders/${order.id}`,
        },
      }),
    ]);

    res.json({ message: 'Quality check approved! Order is now ready for customer review.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve QC: ' + error.message });
  }
};

export const qcReturn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { qcFeedback } = req.body;
    const adminId = req.user!.userId;

    if (!qcFeedback) {
      res.status(400).json({ error: 'QC correction feedback is required.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        submissions: { where: { status: 'PENDING_QC' }, take: 1, orderBy: { createdAt: 'desc' } },
        assignments: { where: { status: 'ACCEPTED' }, take: 1 },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const latestSubmission = order.submissions[0];
    const assignedWorkerId = order.assignments[0]?.workerId;

    await prisma.$transaction([
      ...(latestSubmission
        ? [
            prisma.workSubmission.update({
              where: { id: latestSubmission.id },
              data: {
                status: 'REVISION_REQUIRED',
                qcFeedback,
                reviewedById: adminId,
                reviewedAt: new Date(),
              },
            }),
          ]
        : []),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'IN_PROGRESS',
          statusHistory: {
            create: {
              fromStatus: 'SUBMITTED_FOR_QC',
              toStatus: 'IN_PROGRESS',
              changedById: adminId,
              notes: `QC returned for correction: ${qcFeedback}`,
            },
          },
        },
      }),
      ...(assignedWorkerId
        ? [
            prisma.notification.create({
              data: {
                userId: assignedWorkerId,
                title: `Correction Required: ${order.orderNumber}`,
                message: `Admin QC requested changes: "${qcFeedback}". Please update and re-upload.`,
                link: `/worker/tasks/${order.id}`,
              },
            }),
          ]
        : []),
    ]);

    res.json({ message: 'Order returned to worker with QC correction notes.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to return QC: ' + error.message });
  }
};

export const getWorkers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const whereClause: any = { role: 'WORKER' };
    if (status) {
      whereClause.workerProfile = { verificationStatus: String(status) };
    }

    const workers = await prisma.user.findMany({
      where: whereClause,
      include: {
        workerProfile: {
          include: {
            skills: true,
            categories: { include: { category: true } },
            wallet: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ workers });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch workers.' });
  }
};

export const updateWorkerVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const { status } = req.body; // APPROVED, REJECTED, SUSPENDED

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Invalid verification status.' });
      return;
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: workerId },
    });

    if (!workerProfile) {
      res.status(404).json({ error: 'Worker profile not found.' });
      return;
    }

    await prisma.workerProfile.update({
      where: { id: workerProfile.id },
      data: { verificationStatus: status },
    });

    await prisma.user.update({
      where: { id: workerId },
      data: { status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' },
    });

    // Notify worker
    await prisma.notification.create({
      data: {
        userId: workerId,
        title: `Worker Profile ${status}`,
        message: status === 'APPROVED'
          ? 'Congratulations! Your TaskPulse worker profile has been approved. You may now receive client assignments.'
          : `Your worker profile status was updated to ${status}.`,
        link: '/worker/dashboard',
      },
    });

    res.json({ message: `Worker status updated to ${status}.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update worker status.' });
  }
};
