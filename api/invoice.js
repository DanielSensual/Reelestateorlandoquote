/**
 * Square Invoice API — Vercel Serverless Function
 * =================================================
 * POST /api/invoice
 *
 * Creates a Square customer (or finds existing), builds an order
 * with the selected line items, creates a draft invoice, and
 * publishes it — Square auto-sends via email.
 *
 * Required env vars:
 *   SQUARE_ACCESS_TOKEN  — Square OAuth access token
 *   SQUARE_LOCATION_ID   — Square location ID
 */

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID } = process.env;
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
        return res.status(500).json({ error: 'Square credentials not configured' });
    }

    const BASE = 'https://connect.squareup.com/v2';
    const headers = {
        'Square-Version': '2024-11-20',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    };

    try {
        const { clientName, clientEmail, items, note } = req.body;

        if (!clientName || !clientEmail || !items?.length) {
            return res.status(400).json({ error: 'Missing clientName, clientEmail, or items' });
        }

        // ─── 1. Find or Create Customer ──────────────────────────
        let customerId;

        // Search for existing customer by email
        const searchRes = await fetch(`${BASE}/customers/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: {
                    filter: {
                        email_address: { exact: clientEmail }
                    }
                }
            })
        });
        const searchData = await searchRes.json();

        if (searchData.customers?.length > 0) {
            customerId = searchData.customers[0].id;
        } else {
            // Create new customer
            const createCustRes = await fetch(`${BASE}/customers`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    idempotency_key: crypto.randomUUID(),
                    given_name: clientName.split(' ')[0],
                    family_name: clientName.split(' ').slice(1).join(' ') || '',
                    email_address: clientEmail,
                })
            });
            const custData = await createCustRes.json();
            if (custData.errors) {
                return res.status(400).json({ error: 'Failed to create customer', details: custData.errors });
            }
            customerId = custData.customer.id;
        }

        // ─── 2. Create Order with Line Items ─────────────────────
        const lineItems = items.map(item => ({
            name: item.name,
            quantity: String(item.qty || 1),
            base_price_money: {
                amount: Math.round(item.price * 100), // cents
                currency: 'USD',
            },
        }));

        const orderRes = await fetch(`${BASE}/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                idempotency_key: crypto.randomUUID(),
                order: {
                    location_id: SQUARE_LOCATION_ID,
                    customer_id: customerId,
                    line_items: lineItems,
                    state: 'OPEN',
                },
            })
        });
        const orderData = await orderRes.json();
        if (orderData.errors) {
            return res.status(400).json({ error: 'Failed to create order', details: orderData.errors });
        }
        const orderId = orderData.order.id;

        // ─── 3. Create Draft Invoice ─────────────────────────────
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days
        const dueDateStr = dueDate.toISOString().split('T')[0];

        const invoiceRes = await fetch(`${BASE}/invoices`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                idempotency_key: crypto.randomUUID(),
                invoice: {
                    order_id: orderId,
                    location_id: SQUARE_LOCATION_ID,
                    primary_recipient: {
                        customer_id: customerId,
                    },
                    payment_requests: [{
                        request_type: 'BALANCE',
                        due_date: dueDateStr,
                        automatic_payment_source: 'NONE',
                    }],
                    delivery_method: 'EMAIL',
                    title: 'ReelEstate Orlando — Video Production',
                    description: note || 'Video production services quote from ReelEstate Orlando.',
                    accepted_payment_methods: {
                        card: true,
                        square_gift_card: false,
                        bank_account: true,
                        buy_now_pay_later: false,
                        cash_app_pay: true,
                    },
                },
            })
        });
        const invoiceData = await invoiceRes.json();
        if (invoiceData.errors) {
            return res.status(400).json({ error: 'Failed to create invoice', details: invoiceData.errors });
        }
        const invoiceId = invoiceData.invoice.id;
        const invoiceVersion = invoiceData.invoice.version;

        // ─── 4. Publish Invoice (auto-sends email) ──────────────
        const publishRes = await fetch(`${BASE}/invoices/${invoiceId}/publish`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                idempotency_key: crypto.randomUUID(),
                version: invoiceVersion,
            })
        });
        const publishData = await publishRes.json();
        if (publishData.errors) {
            return res.status(400).json({ error: 'Failed to publish invoice', details: publishData.errors });
        }

        const invoice = publishData.invoice;
        return res.status(200).json({
            success: true,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoice_number,
            publicUrl: invoice.public_url,
            status: invoice.status,
            total: invoice.payment_requests?.[0]?.computed_amount_money,
        });

    } catch (err) {
        console.error('Square invoice error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
}
