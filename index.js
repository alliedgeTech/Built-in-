import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000; //add your port here
const PUBLISHABLE_KEY =
  "pk_test_51O6G0bSI3wpr405x09oJAqo23NfOoJmKxKyNaaUnj7aVCxZ0DYALGLS5ypx43B1XwUOXELKzY8K8gNPkUrs3wmf400RfMgCCSn";
const SECRET_KEY =
  "sk_test_51O6G0bSI3wpr405xXPdWlWEiumZKEU2OgpPVpwmWgNwZWd4V5Nkkb6RxPuywxOdvKhN4JVIuRoExIyA0OrKaRwMZ00dofT6oqL";
import Stripe from "stripe";
// app.use((req, res, next) => {
//   bodyParser.json()(req, res, next);
// });
//Confirm the API version from your stripe dashboard
const stripe = new Stripe(SECRET_KEY, {
  apiVersion: "2023-10-16",
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
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
  console.log("req.body", req.body, req.body.email);
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
  const {
    email = `test${Math.floor(Math.random() * 9999) + 1}@domain.com`,
    payment_method_types = [],
  } = req.body;

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
