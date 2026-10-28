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

/**
 * Escrow & Financial Overview for Administrator
 */
export const getEscrowOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        quotedPrice: { not: null },
      },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        service: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
        assignments: {
          where: { status: 'ACCEPTED' },
          include: { worker: { select: { id: true, fullName: true, email: true } } },
          take: 1,
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeStatuses = [
      'READY_FOR_ASSIGNMENT',
      'AWAITING_WORKER_ACCEPTANCE',
      'IN_PROGRESS',
      'SUBMITTED_FOR_QC',
      'READY_FOR_CUSTOMER',
      'REVISION_REQUESTED',
    ];

    let totalEscrowLocked = 0;
    let totalEscrowReleased = 0;
    let totalPlatformRevenue = 0;
    let totalEscrowRefunded = 0;

    orders.forEach((o) => {
      const hasCompletedPayment = o.payments?.some((p) => p.status === 'COMPLETED');
      const hasRefundedPayment = o.payments?.some((p) => p.status === 'REFUNDED');

      if (hasCompletedPayment && activeStatuses.includes(o.status)) {
        totalEscrowLocked += o.quotedPrice || 0;
      }
      if (o.status === 'COMPLETED') {
        totalEscrowReleased += o.workerPayout || 0;
        totalPlatformRevenue += o.platformFee || 0;
      }
      if (hasRefundedPayment || (o.status === 'CANCELLED' && hasCompletedPayment)) {
        totalEscrowRefunded += o.quotedPrice || 0;
      }
    });

    res.json({
      summary: {
        totalEscrowLocked,
        totalEscrowReleased,
        totalPlatformRevenue,
        totalEscrowRefunded,
        totalOrdersCount: orders.length,
      },
      orders,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch escrow financial overview: ' + error.message });
  }
};

/**
 * Update Order Pricing & Escrow Breakdown by Administrator
 */
export const updateOrderPricingBreakdown = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const {
      quotedPrice,
      platformCommissionRate,
      platformFee,
      workerPayout,
      quotationNotes,
      turnaroundHours,
      adminReason = 'Pricing breakdown adjusted by administrator',
    } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const price = quotedPrice !== undefined ? parseFloat(quotedPrice) : order.quotedPrice || 0;
    const commRate = platformCommissionRate !== undefined ? parseFloat(platformCommissionRate) : (order.platformCommissionRate || 0.20);
    const fee = platformFee !== undefined ? parseFloat(platformFee) : (price * commRate);
    const payout = workerPayout !== undefined ? parseFloat(workerPayout) : (price - fee);

    const deadline = turnaroundHours
      ? new Date(Date.now() + parseInt(turnaroundHours) * 3600 * 1000)
      : order.targetDeadline;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        quotedPrice: price,
        platformCommissionRate: commRate,
        platformFee: fee,
        workerPayout: payout,
        quotationNotes: quotationNotes !== undefined ? quotationNotes : order.quotationNotes,
        targetDeadline: deadline,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: order.status,
            changedById: req.user!.userId,
            notes: `Pricing Breakdown Updated: Total LKR ${price.toLocaleString()}, Commission LKR ${fee.toLocaleString()} (${(commRate * 100).toFixed(0)}%), Specialist Payout LKR ${payout.toLocaleString()}. Note: ${adminReason}`,
          },
        },
      },
      include: {
        customer: { select: { id: true, fullName: true, email: true } },
        payments: true,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: `Pricing Breakdown Updated: ${order.orderNumber}`,
        message: `Administrator updated pricing terms for your order: Total LKR ${price.toLocaleString()}.`,
        link: `/customer/orders/${order.id}`,
      },
    });

    res.json({ message: 'Pricing breakdown updated successfully.', order: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update pricing breakdown: ' + error.message });
  }
};

/**
 * Manual Escrow Release by Administrator to Specialist
 */
export const releaseEscrow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const adminId = req.user!.userId;
    const { notes = 'Escrow released manually by Administrator approval' } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        assignments: { where: { status: 'ACCEPTED' }, take: 1 },
        payments: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.status === 'COMPLETED') {
      res.status(400).json({ error: 'Order is already marked as completed and escrow cleared.' });
      return;
    }

    const assignedWorkerId = order.assignments[0]?.workerId;
    if (!assignedWorkerId) {
      res.status(400).json({ error: 'Cannot release escrow: No specialist is currently assigned to this order.' });
      return;
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: assignedWorkerId },
      include: { wallet: true },
    });

    if (!workerProfile) {
      res.status(404).json({ error: 'Specialist profile not found.' });
      return;
    }

    const payoutAmount = order.workerPayout || ((order.quotedPrice || 0) * 0.8);

    await prisma.$transaction([
      ...(workerProfile.wallet
        ? [
            prisma.workerWallet.update({
              where: { id: workerProfile.wallet.id },
              data: { currentBalance: { increment: payoutAmount } },
            }),
            prisma.walletTransaction.create({
              data: {
                walletId: workerProfile.wallet.id,
                orderId: order.id,
                type: 'EARNING',
                amount: payoutAmount,
                description: `Admin Escrow Release: Payment cleared for order ${order.orderNumber}`,
              },
            }),
          ]
        : [
            prisma.workerWallet.create({
              data: {
                workerProfileId: workerProfile.id,
                currentBalance: payoutAmount,
                transactions: {
                  create: {
                    orderId: order.id,
                    type: 'EARNING',
                    amount: payoutAmount,
                    description: `Admin Escrow Release: Payment cleared for order ${order.orderNumber}`,
                  },
                },
              },
            }),
          ]),
      prisma.workerProfile.update({
        where: { id: workerProfile.id },
        data: { totalCompletedJobs: { increment: 1 } },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: 'COMPLETED',
              changedById: adminId,
              notes: `Admin manually released Escrow (LKR ${payoutAmount.toLocaleString()}) to specialist. ${notes}`,
            },
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId: assignedWorkerId,
          title: `Escrow Released: LKR ${payoutAmount.toLocaleString()}`,
          message: `Administrator has released escrow payment for order ${order.orderNumber} to your wallet.`,
          link: `/worker/wallet`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.customerId,
          title: `Order Completed & Escrow Cleared: ${order.orderNumber}`,
          message: `Your order has been officially completed and finalized by administration.`,
          link: `/customer/orders/${order.id}`,
        },
      }),
    ]);

    res.json({ message: `Escrow of LKR ${payoutAmount.toLocaleString()} successfully released to specialist.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to release escrow: ' + error.message });
  }
};

/**
 * Escrow Refund by Administrator to Customer
 */
export const refundEscrow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const adminId = req.user!.userId;
    const { refundAmount, reason = 'Escrow refunded to customer by Administrator' } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: { where: { status: 'COMPLETED' }, take: 1, orderBy: { createdAt: 'desc' } },
        assignments: { where: { status: 'ACCEPTED' }, take: 1 },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const latestPayment = order.payments[0];
    const amount = refundAmount ? parseFloat(refundAmount) : (latestPayment?.amount || order.quotedPrice || 0);

    await prisma.$transaction([
      ...(latestPayment
        ? [
            prisma.payment.update({
              where: { id: latestPayment.id },
              data: { status: 'REFUNDED' },
            }),
          ]
        : []),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: 'CANCELLED',
              changedById: adminId,
              notes: `Escrow refunded to customer: LKR ${amount.toLocaleString()}. Reason: ${reason}`,
            },
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.customerId,
          title: `Escrow Refund Processed: ${order.orderNumber}`,
          message: `Administrator has processed a refund of LKR ${amount.toLocaleString()} for order "${order.title}". Reason: ${reason}`,
          link: `/customer/orders/${order.id}`,
        },
      }),
      ...(order.assignments[0]
        ? [
            prisma.notification.create({
              data: {
                userId: order.assignments[0].workerId,
                title: `Order Cancelled & Refunded: ${order.orderNumber}`,
                message: `Order "${order.title}" has been cancelled and refunded by administration.`,
                link: `/worker/tasks/${order.id}`,
              },
            }),
          ]
        : []),
    ]);

    res.json({ message: `Escrow payment of LKR ${amount.toLocaleString()} refunded to customer.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process escrow refund: ' + error.message });
  }
};

