import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { AuthenticatedRequest, AuthUserPayload } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, role, city, country, headline, bio, experienceYears, categoryIds, skills } = req.body;

    if (!email || !password || !fullName || !role) {
      res.status(400).json({ error: 'Email, password, full name, and role are required.' });
      return;
    }

    if (!['CUSTOMER', 'WORKER'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be CUSTOMER or WORKER.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userStatus = role === 'WORKER' ? 'PENDING_APPROVAL' : 'ACTIVE';

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        role,
        status: userStatus,
        customerProfile:
          role === 'CUSTOMER'
            ? {
                create: {
                  city: city || null,
                  country: country || 'Sri Lanka',
                },
              }
            : undefined,
        workerProfile:
          role === 'WORKER'
            ? {
                create: {
                  headline: headline || 'Freelance Specialist',
                  bio: bio || null,
                  experienceYears: experienceYears ? parseInt(experienceYears) : 0,
                  verificationStatus: 'PENDING',
                  wallet: {
                    create: {
                      currentBalance: 0,
                      pendingClearance: 0,
                      totalWithdrawn: 0,
                    },
                  },
                  categories: Array.isArray(categoryIds) && categoryIds.length > 0
                    ? {
                        create: categoryIds.map((catId: string) => ({
                          categoryId: catId,
                        })),
                      }
                    : undefined,
                  skills: Array.isArray(skills) && skills.length > 0
                    ? {
                        create: skills.map((s: string) => ({
                          skillName: s,
                        })),
                      }
                    : undefined,
                },
              }
            : undefined,
      },
      include: {
        customerProfile: true,
        workerProfile: {
          include: {
            wallet: true,
            skills: true,
            categories: { include: { category: true } },
          },
        },
      },
    });

    const tokenPayload: AuthUserPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
      fullName: newUser.fullName,
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.status(201).json({
      message: role === 'WORKER'
        ? 'Worker registration submitted! Your account is pending admin approval.'
        : 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        avatarUrl: newUser.avatarUrl,
        customerProfile: newUser.customerProfile,
        workerProfile: newUser.workerProfile,
      },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed. ' + error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        customerProfile: true,
        workerProfile: {
          include: {
            wallet: true,
            skills: true,
            categories: { include: { category: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const tokenPayload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      fullName: user.fullName,
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        customerProfile: user.customerProfile,
        workerProfile: user.workerProfile,
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed. ' + error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        customerProfile: true,
        workerProfile: {
          include: {
            wallet: true,
            skills: true,
            categories: { include: { category: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

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
        workerProfile: user.workerProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
};
