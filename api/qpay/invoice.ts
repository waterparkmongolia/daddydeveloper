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
    const token = await getQPayToken();

    const response = await axios.post(`${QPAY_URL}/invoice`, {
      invoice_code: process.env.QPAY_INVOICE_CODE || 'TEST_INVOICE',
      sender_invoice_no: orderId,
      invoice_receiver_code: 'TERMINAL',
      invoice_description: description || 'Daddy Developer Website Development',
      amount,
      callback_url: `https://${req.headers.host}/api/qpay/callback?orderId=${orderId}`,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('QPay Invoice Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create QPay invoice' });
  }
}
