import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

export const assignWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, workerId, hoursToAccept = 6 } = req.body;
    const adminId = req.user!.userId;

    if (!orderId || !workerId) {
      res.status(400).json({ error: 'Order ID and Worker ID are required.' });
      return;
    }

    const worker = await prisma.user.findFirst({
      where: {
        id: workerId,
        role: 'WORKER',
        workerProfile: { verificationStatus: 'APPROVED' },
      },
    });

    if (!worker) {
      res.status(400).json({ error: 'Selected worker is not approved or not found.' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const deadline = new Date(Date.now() + hoursToAccept * 3600 * 1000);

    const assignment = await prisma.workerAssignment.create({
      data: {
        orderId,
        workerId,
        assignedById: adminId,
        status: 'OFFERED',
        responseDeadline: deadline,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'AWAITING_WORKER_ACCEPTANCE',
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: 'AWAITING_WORKER_ACCEPTANCE',
            changedById: adminId,
            notes: `Assigned to worker ${worker.fullName}. Acceptance required before ${deadline.toISOString()}.`,
          },
        },
      },
    });

    // Notify Worker
    await prisma.notification.create({
      data: {
        userId: workerId,
        title: `New Assignment Offer: ${order.orderNumber}`,
        message: `You have been offered order "${order.title}". Payout: LKR ${order.workerPayout.toFixed(2)}. Please accept within ${hoursToAccept} hours.`,
        link: `/worker/tasks/${order.id}`,
      },
    });

    res.json({ message: 'Order assigned to worker successfully.', assignment });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign worker: ' + error.message });
  }
};

export const acceptAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // assignment ID or order ID
    const workerId = req.user!.userId;

    const assignment = await prisma.workerAssignment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        workerId,
        status: 'OFFERED',
      },
      include: { order: true },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Active assignment offer not found for this worker.' });
      return;
    }

    await prisma.$transaction([
      prisma.workerAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: assignment.orderId },
        data: {
          status: 'IN_PROGRESS',
          statusHistory: {
            create: {
              fromStatus: 'AWAITING_WORKER_ACCEPTANCE',
              toStatus: 'IN_PROGRESS',
              changedById: workerId,
              notes: 'Worker accepted the assignment. Work has commenced.',
            },
          },
        },
      }),
    ]);

    res.json({ message: 'Assignment accepted! You may now begin work.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to accept assignment.' });
  }
};

export const declineAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { declineReason } = req.body;
    const workerId = req.user!.userId;

    const assignment = await prisma.workerAssignment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }],
        workerId,
        status: 'OFFERED',
      },
      include: { order: true },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Active assignment offer not found.' });
      return;
    }

    await prisma.$transaction([
      prisma.workerAssignment.update({
        where: { id: assignment.id },
        data: {
          status: 'DECLINED',
          respondedAt: new Date(),
          declineReason: declineReason || 'Worker declined without specific reason.',
        },
      }),
      prisma.order.update({
        where: { id: assignment.orderId },
        data: {
          status: 'READY_FOR_ASSIGNMENT',
          statusHistory: {
            create: {
              fromStatus: 'AWAITING_WORKER_ACCEPTANCE',
              toStatus: 'READY_FOR_ASSIGNMENT',
              changedById: workerId,
              notes: `Worker declined assignment: ${declineReason || 'No reason specified'}. Returned to pool.`,
            },
          },
        },
      }),
    ]);

    res.json({ message: 'Assignment declined. The order has been returned to the pool.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to decline assignment.' });
  }
};

export const submitWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { submissionNotes } = req.body;
    const workerId = req.user!.userId;
    const files = req.files as Express.Multer.File[];

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        assignments: {
          where: { workerId, status: 'ACCEPTED' },
        },
      },
    });

    if (!order || order.assignments.length === 0) {
      res.status(403).json({ error: 'You are not the assigned worker for this order.' });
      return;
    }

    if (!['IN_PROGRESS', 'REVISION_REQUESTED'].includes(order.status)) {
      res.status(400).json({ error: `Cannot submit work in order status ${order.status}.` });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'At least one deliverable file must be uploaded.' });
      return;
    }

    // Save files
    await prisma.orderFile.createMany({
      data: files.map((f) => ({
        orderId,
        uploaderId: workerId,
        fileTag: 'FINAL_DELIVERABLE',
        originalFilename: f.originalname,
        storageFilename: f.filename,
        fileSizeBytes: f.size,
        mimeType: f.mimetype,
        filePath: f.path,
      })),
    });

    // Record submission
    const submission = await prisma.workSubmission.create({
      data: {
        orderId,
        workerId,
        submissionNotes,
        status: 'PENDING_QC',
      },
    });

    // Update Order Status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SUBMITTED_FOR_QC',
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: 'SUBMITTED_FOR_QC',
            changedById: workerId,
            notes: `Worker submitted deliverables for Admin Quality Check: ${submissionNotes || ''}`,
          },
        },
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((adm) => ({
          userId: adm.id,
          title: `Quality Check Required: ${order.orderNumber}`,
          message: `Worker submitted deliverables for "${order.title}". Review required.`,
          link: `/admin/orders/${order.id}`,
        })),
      });
    }

    res.json({ message: 'Deliverables submitted successfully for Quality Check.', submission });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit work: ' + error.message });
  }
};

export const getMyTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user!.userId;

    const assignments = await prisma.workerAssignment.findMany({
      where: { workerId },
      include: {
        order: {
          include: {
            service: true,
            category: true,
            _count: { select: { files: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ assignments });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};
