import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'taskpulse-jwt-super-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || '1211111',
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || 'taskpulse_sandbox_secret_key',
    env: process.env.PAYHERE_ENV || 'sandbox',
    checkoutUrl:
      process.env.PAYHERE_ENV === 'production'
        ? 'https://www.payhere.lk/pay/checkout'
        : 'https://sandbox.payhere.lk/pay/checkout',
  },
  commissionRate: parseFloat(process.env.COMMISSION_RATE || '0.20'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
};
