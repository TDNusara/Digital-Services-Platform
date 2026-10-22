import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

export const uploadOrderFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { fileTag = 'CUSTOMER_ADDITIONAL' } = req.body;
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const orderFile = await prisma.orderFile.create({
      data: {
        orderId,
        uploaderId: userId,
        fileTag,
        originalFilename: file.originalname,
        storageFilename: file.filename,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        filePath: file.path,
      },
    });

    res.status(201).json({ message: 'File uploaded successfully.', file: orderFile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload file: ' + error.message });
  }
};

export const downloadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const { userId, role } = req.user!;

    const orderFile = await prisma.orderFile.findUnique({
      where: { id: fileId },
      include: {
        order: {
          include: {
            assignments: { where: { workerId: userId, status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (!orderFile) {
      res.status(404).json({ error: 'File record not found.' });
      return;
    }

    // Permission check
    const isCustomer = orderFile.order.customerId === userId;
    const isAssignedWorker = orderFile.order.assignments.length > 0;
    const isAdmin = role === 'ADMIN';

    if (!isCustomer && !isAssignedWorker && !isAdmin) {
      res.status(403).json({ error: 'You are not authorized to download this file.' });
      return;
    }

    if (!fs.existsSync(orderFile.filePath)) {
      res.status(404).json({ error: 'File data not found on server disk.' });
      return;
    }

    res.setHeader('Content-Type', orderFile.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(orderFile.originalFilename)}"`
    );

    const fileStream = fs.createReadStream(orderFile.filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to download file.' });
  }
};
