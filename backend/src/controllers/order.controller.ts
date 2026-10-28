import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest, FileTag, OrderStatus } from '../types';
import { config } from '../config';

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;
    const { serviceId, categoryId, title, requirementsData, targetDeadline, budget } = req.body;

    if (!title || !targetDeadline) {
      res.status(400).json({ error: 'Title and target deadline are required.' });
      return;
    }

    // Generate unique order number: ORD-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${year}-${randomSuffix}`;

    // Handle uploaded files if any
    const files = req.files as Express.Multer.File[];

    let initialPrice: number | null = null;
    let initialPlatformFee = 0;
    let initialWorkerPayout = 0;
    let initialStatus = 'PENDING_REVIEW';
    let initialNotes = 'Order submitted by customer. Awaiting administrator review and quotation.';

    // If an existing fixed-price service was chosen
    if (serviceId) {
      const selectedService = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (selectedService && selectedService.pricingType === 'FIXED' && selectedService.basePrice > 0) {
        initialPrice = selectedService.basePrice;
        initialPlatformFee = initialPrice * config.commissionRate;
        initialWorkerPayout = initialPrice - initialPlatformFee;
        initialStatus = 'AWAITING_PAYMENT';
        initialNotes = `Fixed-price service selected (LKR ${initialPrice.toLocaleString()}). Ready for immediate payment.`;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        serviceId: serviceId || null,
        categoryId: categoryId || null,
        title: title.trim(),
        requirementsData: typeof requirementsData === 'string' ? requirementsData : JSON.stringify(requirementsData || {}),
        targetDeadline: new Date(targetDeadline),
        status: initialStatus,
        quotedPrice: initialPrice,
        platformCommissionRate: config.commissionRate,
        platformFee: initialPlatformFee,
        workerPayout: initialWorkerPayout,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: initialStatus,
            changedById: customerId,
            notes: initialNotes,
          },
        },
        files: files && files.length > 0
          ? {
              create: files.map((f) => ({
                uploaderId: customerId,
                fileTag: 'CUSTOMER_ORIGINAL',
                originalFilename: f.originalname,
                storageFilename: f.filename,
                fileSizeBytes: f.size,
                mimeType: f.mimetype,
                filePath: f.path,
              })),
            }
          : undefined,
      },
      include: {
        service: true,
        category: true,
        files: true,
        statusHistory: true,
      },
    });

    // Notify admins of new order
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((adm) => ({
          userId: adm.id,
          title: `New Order: ${order.orderNumber}`,
          message: `Customer ${req.user!.fullName} submitted order "${order.title}".`,
          link: `/admin/orders/${order.id}`,
        })),
      });
    }

    res.status(201).json({
      message: 'Order created successfully and submitted for review.',
      order,
    });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order: ' + error.message });
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, userId } = req.user!;
    const { status, search } = req.query;

    const whereClause: any = {};

    if (role === 'CUSTOMER') {
      whereClause.customerId = userId;
    } else if (role === 'WORKER') {
      whereClause.assignments = {
        some: {
          workerId: userId,
          status: { in: ['OFFERED', 'ACCEPTED'] },
        },
      };
    }

    if (status) {
      whereClause.status = String(status);
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: String(search) } },
        { title: { contains: String(search) } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        service: true,
        category: true,
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        assignments: {
          include: {
            worker: { select: { id: true, fullName: true, email: true } },
          },
        },
        _count: { select: { files: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        category: true,
        customer: {
          select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
        },
        files: {
          include: {
            uploader: { select: { id: true, fullName: true, role: true } },
          },
        },
        statusHistory: {
          include: {
            changedBy: { select: { id: true, fullName: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        assignments: {
          include: {
            worker: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                workerProfile: {
                  select: { headline: true, ratingAvg: true, totalCompletedJobs: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        submissions: {
          include: {
            worker: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        revisions: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        review: true,
        messages: {
          include: {
            sender: {
              select: { id: true, fullName: true, role: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // Permission check
    const isCustomerOwner = order.customerId === userId;
    const isAssignedWorker = order.assignments.some(
      (a) => a.workerId === userId && ['OFFERED', 'ACCEPTED'].includes(a.status)
    );
    const isAdmin = role === 'ADMIN';

    if (!isCustomerOwner && !isAssignedWorker && !isAdmin) {
      res.status(403).json({ error: 'You do not have access to this order.' });
      return;
    }

    // Filter files based on role permissions
    let visibleFiles = order.files;
    if (role === 'CUSTOMER') {
      // Customer sees original, additional, and approved deliverables
      visibleFiles = order.files.filter((f) =>
        ['CUSTOMER_ORIGINAL', 'CUSTOMER_ADDITIONAL', 'FINAL_DELIVERABLE'].includes(f.fileTag)
      );
    } else if (role === 'WORKER') {
      // Worker sees customer files, worker drafts, and final deliverables
      visibleFiles = order.files.filter((f) =>
        ['CUSTOMER_ORIGINAL', 'CUSTOMER_ADDITIONAL', 'WORKER_DRAFT', 'FINAL_DELIVERABLE'].includes(f.fileTag)
      );
    }

    res.json({
      order: {
        ...order,
        files: visibleFiles,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
};

export const sendQuotation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      quotedPrice,
      quotationNotes,
      turnaroundHours,
      commissionRate,
      platformFee: customPlatformFee,
      workerPayout: customWorkerPayout,
    } = req.body;

    if (!quotedPrice || quotedPrice <= 0) {
      res.status(400).json({ error: 'A valid quoted price is required.' });
      return;
    }

    const price = parseFloat(quotedPrice);
    const commRate = commissionRate !== undefined ? parseFloat(commissionRate) : config.commissionRate;
    const platformFee = customPlatformFee !== undefined ? parseFloat(customPlatformFee) : (price * commRate);
    const workerPayout = customWorkerPayout !== undefined ? parseFloat(customWorkerPayout) : (price - platformFee);

    const deadline = turnaroundHours
      ? new Date(Date.now() + parseInt(turnaroundHours) * 3600 * 1000)
      : undefined;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        quotedPrice: price,
        platformCommissionRate: commRate,
        platformFee,
        workerPayout,
        quotationNotes,
        targetDeadline: deadline,
        status: 'QUOTATION_SENT',
        statusHistory: {
          create: {
            fromStatus: 'PENDING_REVIEW',
            toStatus: 'QUOTATION_SENT',
            changedById: req.user!.userId,
            notes: `Quotation sent: LKR ${price.toFixed(2)} (Platform Commission: LKR ${platformFee.toFixed(2)}, Specialist Payout: LKR ${workerPayout.toFixed(2)}). ${quotationNotes || ''}`,
          },
        },
      },
    });

    // Notify Customer
    await prisma.notification.create({
      data: {
        userId: updatedOrder.customerId,
        title: `Quotation Ready for ${updatedOrder.orderNumber}`,
        message: `Your quotation of LKR ${price.toFixed(2)} is ready for review.`,
        link: `/customer/orders/${updatedOrder.id}`,
      },
    });

    res.json({ message: 'Quotation sent to customer.', order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send quotation: ' + error.message });
  }
};

export const acceptQuotation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.customerId !== customerId) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.status !== 'QUOTATION_SENT') {
      res.status(400).json({ error: `Cannot accept quotation in status ${order.status}.` });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'AWAITING_PAYMENT',
        statusHistory: {
          create: {
            fromStatus: 'QUOTATION_SENT',
            toStatus: 'AWAITING_PAYMENT',
            changedById: customerId,
            notes: 'Customer accepted the quotation. Proceeding to payment.',
          },
        },
      },
    });

    res.json({ message: 'Quotation accepted. Please complete payment.', order: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to accept quotation.' });
  }
};

export const requestRevision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.customerId !== customerId) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.status !== 'READY_FOR_CUSTOMER') {
      res.status(400).json({ error: 'Revisions can only be requested when work is Ready for Customer.' });
      return;
    }

    if (order.revisionsUsed >= order.revisionsAllowed) {
      res.status(400).json({ error: 'Maximum free revisions limit reached.' });
      return;
    }

    const revision = await prisma.orderRevision.create({
      data: {
        orderId: id,
        reason,
        details,
        status: 'REQUESTED',
      },
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'REVISION_REQUESTED',
        revisionsUsed: order.revisionsUsed + 1,
        statusHistory: {
          create: {
            fromStatus: 'READY_FOR_CUSTOMER',
            toStatus: 'REVISION_REQUESTED',
            changedById: customerId,
            notes: `Revision #${order.revisionsUsed + 1} requested: ${reason}`,
          },
        },
      },
    });

    res.json({ message: 'Revision requested successfully.', order: updated, revision });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to request revision.' });
  }
};

export const completeOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACCEPTED' }, take: 1 },
      },
    });

    if (!order || order.customerId !== customerId) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.status !== 'READY_FOR_CUSTOMER') {
      res.status(400).json({ error: 'Order must be Ready for Customer to complete.' });
      return;
    }

    // Release payout to worker wallet
    const assignedWorkerId = order.assignments[0]?.workerId;
    if (assignedWorkerId) {
      const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: assignedWorkerId },
        include: { wallet: true },
      });

      if (workerProfile && workerProfile.wallet) {
        await prisma.$transaction([
          prisma.workerWallet.update({
            where: { id: workerProfile.wallet.id },
            data: {
              currentBalance: { increment: order.workerPayout },
            },
          }),
          prisma.walletTransaction.create({
            data: {
              walletId: workerProfile.wallet.id,
              orderId: order.id,
              type: 'EARNING',
              amount: order.workerPayout,
              description: `Earnings credited for order ${order.orderNumber}`,
            },
          }),
          prisma.workerProfile.update({
            where: { id: workerProfile.id },
            data: { totalCompletedJobs: { increment: 1 } },
          }),
        ]);
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        statusHistory: {
          create: {
            fromStatus: 'READY_FOR_CUSTOMER',
            toStatus: 'COMPLETED',
            changedById: customerId,
            notes: 'Customer accepted the deliverable. Funds released to worker.',
          },
        },
      },
    });

    res.json({ message: 'Order completed! You can now rate and review the service.', order: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to complete order.' });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason = 'Order cancelled by customer.' } = req.body;
    const { userId, role, fullName } = req.user!;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const isCustomer = order.customerId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCustomer && !isAdmin) {
      res.status(403).json({ error: 'You are not authorized to cancel this order.' });
      return;
    }

    if (order.status === 'CANCELLED') {
      res.status(400).json({ error: 'Order is already cancelled.' });
      return;
    }

    if (order.status === 'COMPLETED') {
      res.status(400).json({ error: 'Completed orders cannot be cancelled.' });
      return;
    }

    // Cancellation policy checks
    const allowableInstantStatuses = ['PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT'];
    const isInExecution = ['READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC'].includes(order.status);

    let statusNote = `Order cancelled by ${role.toLowerCase()} (${fullName}). Reason: ${reason}`;
    if (isInExecution) {
      statusNote += ' (Platform refund procedure flagged for review).';
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: 'CANCELLED',
            changedById: userId,
            notes: statusNote,
          },
        },
      },
    });

    // Notify respective parties
    if (isCustomer) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      await prisma.notification.createMany({
        data: admins.map((adm) => ({
          userId: adm.id,
          title: `Order Cancelled: ${order.orderNumber}`,
          message: `Customer cancelled order "${order.title}". Reason: ${reason}`,
          link: `/admin/orders/${order.id}`,
        })),
      });

      await prisma.notification.create({
        data: {
          userId: customerIdOrUserId(userId),
          title: `Order Cancelled: ${order.orderNumber}`,
          message: `Your order "${order.title}" has been successfully cancelled.`,
          link: `/customer/orders/${order.id}`,
        },
      });
    } else if (isAdmin) {
      await prisma.notification.create({
        data: {
          userId: order.customerId,
          title: `Order Cancelled by Admin: ${order.orderNumber}`,
          message: `Your order was cancelled by platform administration. Reason: ${reason}`,
          link: `/customer/orders/${order.id}`,
        },
      });
    }

    res.json({
      message: 'Order has been cancelled according to platform cancellation policy.',
      order: updated,
    });
  } catch (error: any) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ error: 'Failed to cancel order: ' + error.message });
  }
};

function customerIdOrUserId(id: string): string {
  return id;
}

export const getOrderMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACCEPTED' } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const isCustomer = order.customerId === userId;
    const isAssignedWorker = order.assignments.some((a) => a.workerId === userId);
    const isAdmin = role === 'ADMIN';

    if (!isCustomer && !isAssignedWorker && !isAdmin) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const messages = await prisma.orderMessage.findMany({
      where: { orderId: id },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order messages.' });
  }
};

export const sendOrderMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const { userId, role, fullName } = req.user!;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACCEPTED' } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const isCustomer = order.customerId === userId;
    const isAssignedWorker = order.assignments.some((a) => a.workerId === userId);
    const isAdmin = role === 'ADMIN';

    if (!isCustomer && !isAssignedWorker && !isAdmin) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const newMsg = await prisma.orderMessage.create({
      data: {
        orderId: id,
        senderId: userId,
        message: message.trim(),
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true, avatarUrl: true },
        },
      },
    });

    // Notify appropriate counterparty
    if (isCustomer) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((adm) => ({
            userId: adm.id,
            title: `Order Message: ${order.orderNumber}`,
            message: `${fullName}: "${message.trim().slice(0, 75)}"`,
            link: `/admin/orders/${order.id}`,
          })),
        });
      }
    } else if (isAdmin) {
      await prisma.notification.create({
        data: {
          userId: order.customerId,
          title: `Admin Message on ${order.orderNumber}`,
          message: `Admin ${fullName}: "${message.trim().slice(0, 75)}"`,
          link: `/customer/orders/${order.id}`,
        },
      });
    }

    res.status(201).json({ message: 'Message sent successfully.', orderMessage: newMsg });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
};
