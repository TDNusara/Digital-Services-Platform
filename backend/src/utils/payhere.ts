import crypto from 'crypto';
import { config } from '../config';

/**
 * Generates PayHere Checkout MD5 Hash:
 * strtoupper(md5(merchant_id + order_id + amountFormatted + currency + strtoupper(md5(merchant_secret))))
 */
export function generatePayHereHash(
  orderId: string,
  amount: number,
  currency = 'LKR'
): string {
  const merchantId = config.payhere.merchantId;
  const merchantSecret = config.payhere.merchantSecret;
  const amountFormatted = amount.toFixed(2);

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const mainString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;

  return crypto
    .createHash('md5')
    .update(mainString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Validates PayHere Server-to-Server IPN Webhook MD5 Signature:
 * strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
 */
export function verifyPayHereSignature(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  receivedMd5Sig: string
): boolean {
  const merchantSecret = config.payhere.merchantSecret;

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const rawString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;

  const calculatedSig = crypto
    .createHash('md5')
    .update(rawString)
    .digest('hex')
    .toUpperCase();

  return calculatedSig === receivedMd5Sig.toUpperCase();
}
