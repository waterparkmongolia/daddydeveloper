import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const QPAY_URL = 'https://merchant.qpay.mn/v2';

let qpayToken: string | null = null;
let tokenExpiresAt = 0;

async function getQPayToken() {
  if (qpayToken && Date.now() < tokenExpiresAt) return qpayToken;

  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;
  if (!username || !password) throw new Error('QPAY credentials not configured');

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const response = await axios.post(`${QPAY_URL}/auth/token`, {}, {
    headers: { Authorization: `Basic ${auth}` },
  });

  qpayToken = response.data.access_token;
  tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
  return qpayToken;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, description, orderId } = req.body;
    console.log('Invoice request:', { amount, description, orderId });

    const token = await getQPayToken();
    console.log('QPay token obtained');

    const invoicePayload = {
      invoice_code: process.env.QPAY_INVOICE_CODE || 'XPLUS_INVOICE',
      sender_invoice_no: orderId,
      invoice_receiver_code: 'TERMINAL',
      invoice_description: description || 'Daddy Developer Website Development',
      amount: amount,
      callback_url: `https://${req.headers.host}/api/qpay/callback?orderId=${orderId}`,
    };

    console.log('Invoice payload:', invoicePayload);

    const response = await axios.post(`${QPAY_URL}/invoice`, invoicePayload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error: any) {
    const errData = error.response?.data || error.message;
    console.error('QPay Invoice Error:', JSON.stringify(errData));
    res.status(500).json({ error: 'Failed to create QPay invoice', detail: errData });
  }
}
