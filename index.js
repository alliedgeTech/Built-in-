import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";
import env from "dotenv";
env.config({ path: "./.env" });
const app = express();

const port = 3000; //add your port here
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
const SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

const stripe = new Stripe(SECRET_KEY, {
  apiVersion: "2023-10-16",
});
app.listen(port, () => {
  console.log(`Server Started`);
});
app.use((req, res, next) => {
  bodyParser.json()(req, res, next);
});

app.get("/stripe-key", (_, res) => {
  return res.send({ publishableKey: PUBLISHABLE_KEY });
});

app.post("/create-payment-intent", async (req, res) => {
  const {
    email,
    currency,
    request_three_d_secure,
    payment_method_types = [],
    amount,
  } = req.body;
  console.log("running create-payment-intent");
  const customer = await stripe.customers.create({ email });

  const params = {
    amount: amount,
    currency,
    customer: customer.id,
    payment_method_options: {
      card: {
        request_three_d_secure: request_three_d_secure || "automatic",
      },
    },
    payment_method_types: payment_method_types,
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(params);
    return res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.send({
      error: error.raw.message,
    });
  }
});

app.post("/payment-sheet-setup-intent", async (req, res) => {
  const { email, payment_method_types = [] } = req.body;

  const customer = await stripe.customers.create({ email });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-10-16" }
  );
  const setupIntent = await stripe.setupIntents.create({
    ...{ customer: customer.id, payment_method_types },
  });

  return res.json({
    setupIntent: setupIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});

app.post("/payment-sheet", async (req, res) => {
  const { email, currency, amount } = req.body;
  console.log("running payment-sheet");

  const customer = await stripe.customers.create({ email });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-10-16" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency,
    payment_method_types: ["card"],
    customer: customer.id,
  });
  return res.json({
    paymentIntent: paymentIntent,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});
