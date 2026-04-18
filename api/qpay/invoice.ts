import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const QPAY_URL = 'https://merchant.qpay.mn/v2';

async function getQPayToken() {
  const username = process.env.QPAY_USERNAME?.trim();
  const password = process.env.QPAY_PASSWORD?.trim();
  if (!username || !password) throw new Error('QPAY credentials not configured');

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const response = await axios.post(`${QPAY_URL}/auth/token`, {}, {
    headers: { Authorization: `Basic ${auth}` },
  });

  return response.data.access_token as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, description, orderId } = req.body;
    const token = await getQPayToken();

    const invoicePayload = {
      invoice_code: process.env.QPAY_INVOICE_CODE?.trim() || 'XPLUS_INVOICE',
      sender_invoice_no: String(orderId),
      invoice_receiver_code: 'terminal',
      invoice_description: description || 'Daddy Developer захиалга',
      amount: Number(amount),
      callback_url: `https://${req.headers.host}/api/qpay/callback?orderId=${orderId}`,
    };

    const response = await axios.post(`${QPAY_URL}/invoice`, invoicePayload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (error: any) {
    const errData = error.response?.data || error.message;
    console.error('QPay Invoice Error:', JSON.stringify(errData));
    res.status(500).json({ error: 'Failed to create QPay invoice', detail: errData });
  }
}
