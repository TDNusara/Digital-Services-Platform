import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

export const getCustomerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Calculate customer metrics
    const [totalOrders, activeOrders, completedOrders, payments] = await Promise.all([
      prisma.order.count({ where: { customerId: userId } }),
      prisma.order.count({
        where: {
          customerId: userId,
          status: {
            in: [
              'PENDING_REVIEW',
              'QUOTATION_SENT',
              'AWAITING_PAYMENT',
              'READY_FOR_ASSIGNMENT',
              'AWAITING_WORKER_ACCEPTANCE',
              'IN_PROGRESS',
              'SUBMITTED_FOR_QC',
              'READY_FOR_CUSTOMER',
              'REVISION_REQUESTED',
            ],
          },
        },
      }),
      prisma.order.count({
        where: { customerId: userId, status: 'COMPLETED' },
      }),
      prisma.payment.findMany({
        where: { customerId: userId, status: 'COMPLETED' },
        select: { amount: true },
      }),
    ]);

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        customerProfile: user.customerProfile,
        createdAt: user.createdAt,
      },
      stats: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalSpent,
      },
    });
  } catch (error: any) {
    console.error('Get Customer Profile Error:', error);
    res.status(500).json({ error: 'Failed to fetch customer profile: ' + error.message });
  }
};

export const updateCustomerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { fullName, phone, avatarUrl, city, country, preferredLanguage, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updateUserData: any = {};
    if (fullName && fullName.trim()) updateUserData.fullName = fullName.trim();
    if (phone !== undefined) updateUserData.phone = phone ? phone.trim() : null;
    if (avatarUrl !== undefined) updateUserData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;

    // Optional password update
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to set a new password.' });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        return;
      }
      updateUserData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Upsert customer profile
    await prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        city: city || null,
        country: country || 'Sri Lanka',
        preferredLanguage: preferredLanguage || 'en',
      },
      update: {
        city: city !== undefined ? city : undefined,
        country: country !== undefined ? country : undefined,
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateUserData,
      include: {
        customerProfile: true,
      },
    });

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status,
        avatarUrl: updatedUser.avatarUrl,
        customerProfile: updatedUser.customerProfile,
      },
    });
  } catch (error: any) {
    console.error('Update Customer Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
};
