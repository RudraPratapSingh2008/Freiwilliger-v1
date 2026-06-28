// Razorpay integration placeholder
// Requires: npm install razorpay (when ready to use)
// ENV: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

const createOrder = async ({ amount, currency = 'INR', eventId, volunteerId }) => {
  // TODO: Implement when Razorpay account is set up
  // const Razorpay = require('razorpay');
  // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // return instance.orders.create({ amount: amount * 100, currency, receipt: `event_${eventId}_${volunteerId}` });

  return {
    id: `order_placeholder_${Date.now()}`,
    amount: amount * 100,
    currency,
    status: 'created',
    notes: { eventId, volunteerId },
  };
};

const verifyPayment = async ({ orderId, paymentId, signature }) => {
  // TODO: Implement signature verification
  // const crypto = require('crypto');
  // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  //   .update(`${orderId}|${paymentId}`).digest('hex');
  // return expectedSignature === signature;
  return true; // Placeholder
};

module.exports = { createOrder, verifyPayment };
