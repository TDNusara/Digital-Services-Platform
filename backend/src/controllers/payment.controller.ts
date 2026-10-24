import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { config } from '../config';
import { generatePayHereHash, verifyPayHereSignature } from '../utils/payhere';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order || order.customerId !== customerId) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (!['AWAITING_PAYMENT', 'QUOTATION_SENT'].includes(order.status)) {
      res.status(400).json({ error: `Order is not awaiting payment (current status: ${order.status}).` });
      return;
    }

    const amount = order.quotedPrice || 0;
    if (amount <= 0) {
      res.status(400).json({ error: 'Order has no valid quoted price.' });
      return;
    }

    const currency = 'LKR';
    const hash = generatePayHereHash(order.orderNumber, amount, currency);

    res.json({
      checkoutData: {
        sandbox: config.payhere.env === 'sandbox',
        merchant_id: config.payhere.merchantId,
        return_url: `${config.clientUrl}/customer/orders/${order.id}?payment=success`,
        cancel_url: `${config.clientUrl}/customer/orders/${order.id}?payment=cancelled`,
        notify_url: `http://localhost:${config.port}/api/payments/payhere-webhook`,
        order_id: order.orderNumber,
        items: order.title,
        amount: amount.toFixed(2),
        currency,
        hash,
        first_name: order.customer.fullName.split(' ')[0] || 'Customer',
        last_name: order.customer.fullName.split(' ').slice(1).join(' ') || 'User',
        email: order.customer.email,
        phone: order.customer.phone || '0771234567',
        address: 'Colombo',
        city: 'Colombo',
        country: 'Sri Lanka',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to initiate payment: ' + error.message });
  }
};

export const payhereWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      merchant_id,
      order_id, // e.g. ORD-2026-00101
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body;

    // Verify hash signature
    const isValid = verifyPayHereSignature(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    );

    if (!isValid) {
      console.error('⚠️ PayHere Signature Verification Failed for order:', order_id);
      res.status(400).send('Invalid signature');
      return;
    }

    // status_code 2 means success in PayHere
    if (status_code === '2') {
      const order = await prisma.order.findUnique({
        where: { orderNumber: order_id },
      });

      if (order && order.status === 'AWAITING_PAYMENT') {
        await prisma.$transaction([
          prisma.payment.create({
            data: {
              orderId: order.id,
              customerId: order.customerId,
              amount: parseFloat(payhere_amount),
              currency: payhere_currency,
              paymentMethod: 'PAYHERE',
              gatewayReference: `PH_TXN_${payment_id || Date.now()}`,
              payherePaymentId: payment_id ? String(payment_id) : null,
              status: 'COMPLETED',
            },
          }),
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'READY_FOR_ASSIGNMENT',
              statusHistory: {
                create: {
                  fromStatus: 'AWAITING_PAYMENT',
                  toStatus: 'READY_FOR_ASSIGNMENT',
                  changedById: order.customerId,
                  notes: `PayHere payment verified: ${payhere_currency} ${payhere_amount}. Escrow locked.`,
                },
              },
            },
          }),
        ]);

        console.log(`✅ Order ${order_id} successfully paid and moved to READY_FOR_ASSIGNMENT.`);
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('PayHere Webhook Error:', error);
    res.status(500).send('Webhook processing error');
  }
};

/**
 * Convenience sandbox endpoint to simulate instant payment during testing
 */
export const mockSandboxPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const customerId = req.user!.userId;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.customerId !== customerId) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const amount = order.quotedPrice || 4500;

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          orderId: order.id,
          customerId,
          amount,
          currency: 'LKR',
          paymentMethod: 'PAYHERE_SANDBOX_SIMULATED',
          gatewayReference: `MOCK_TXN_${Date.now()}`,
          payherePaymentId: `SANDBOX_${Math.floor(Math.random() * 900000 + 100000)}`,
          status: 'COMPLETED',
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'READY_FOR_ASSIGNMENT',
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: 'READY_FOR_ASSIGNMENT',
              changedById: customerId,
              notes: `Simulated Sandbox Payment: LKR ${amount.toFixed(2)}. Escrow locked.`,
            },
          },
        },
      }),
    ]);

    // Notify Customer about payment
    await prisma.notification.create({
      data: {
        userId: customerId,
        title: `Payment Confirmed: ${order.orderNumber}`,
        message: `Your payment of LKR ${amount.toLocaleString()} was successfully processed and locked in escrow.`,
        link: `/customer/orders/${order.id}`,
      },
    });

    res.json({ message: 'Sandbox payment completed! Order is now Ready for Assignment.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Mock payment failed: ' + error.message });
  }
};

export const getCustomerTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const payments = await prisma.payment.findMany({
      where: { customerId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch transactions: ' + error.message });
  }
};
