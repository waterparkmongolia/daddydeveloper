import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// QPay Config
const QPAY_URL = "https://merchant.qpay.mn/v2";

let qpayToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getQPayToken() {
  if (qpayToken && Date.now() < tokenExpiresAt) {
    return qpayToken;
  }

  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;

  if (!username || !password) {
    throw new Error("QPAY_USERNAME or QPAY_PASSWORD not configured");
  }

  try {
    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const response = await axios.post(
      `${QPAY_URL}/auth/token`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    qpayToken = response.data.access_token;
    // Set expiry (default around 1 hour, we'll set it conservative)
    tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    return qpayToken;
  } catch (error: any) {
    console.error("QPay Token Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with QPay");
  }
}

// API Routes
app.post("/api/qpay/invoice", async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;
    const token = await getQPayToken();

    const invoiceData = {
      invoice_code: process.env.QPAY_INVOICE_CODE || "TEST_INVOICE",
      sender_invoice_no: orderId,
      invoice_receiver_code: "TERMINAL",
      invoice_description: description || "Daddy Developer Website Development",
      amount: amount,
      callback_url: `https://${req.get("host")}/api/qpay/callback?orderId=${orderId}`,
    };

    const response = await axios.post(
      `${QPAY_URL}/invoice`,
      invoiceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error("QPay Invoice Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create QPay invoice" });
  }
});

app.get("/api/qpay/check", async (req, res) => {
  try {
    const { invoiceId } = req.query;
    const token = await getQPayToken();

    const response = await axios.post(
      `${QPAY_URL}/payment/check`,
      {
        object_type: "INVOICE",
        object_id: invoiceId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error("QPay Check Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to check QPay payment" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
