import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import Razorpay from "razorpay";

env.config({ path: "./.env" });
const app = express();
app.use(bodyParser.json()); // Add this line to parse JSON

const port = 3000; //add your port here
const RAZORPAY_KEY_ID = process.env.RAZORPAY_ID || "";
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_KEY || "";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET_KEY,
});

app.post("/createOrder", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount || "3000", // Amount in paise
      currency: req.body.currency || "INR",
      receipt: req.body.receipt || "order_receipt_" + Date.now(),
      payment_capture: 1, // Automatically capture the payment
    };

    const order = await razorpay.orders.create(options);
    console.log("order", order);
    return res.json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/paymentCallback", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // Verify the payment signature (implement your own verification logic)

    // Capture the payment
    const captureResponse = await razorpay.payments.capture(
      razorpay_payment_id,
      req.body.amount
    );

    console.log("Payment captured:", captureResponse);

    res.json({ success: true });
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(port, () => {
  console.log(`Server Started`);
});
