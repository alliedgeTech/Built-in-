// server.js
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install stripe
//   npm install express
//
// 3) Run the server on http://localhost:4242
//   node server.js

// The library needs to be configured with your account's secret key.
// Ensure the key is kept out of any version control system you might be using.
import express from "express";
const SECRET_KEY =
  "sk_test_51O6G0bSI3wpr405xXPdWlWEiumZKEU2OgpPVpwmWgNwZWd4V5Nkkb6RxPuywxOdvKhN4JVIuRoExIyA0OrKaRwMZ00dofT6oqL";
import Stripe from "stripe";

//Confirm the API version from your stripe dashboard
const stripe = Stripe(SECRET_KEY, { apiVersion: "2023-10-16" });

const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_9c8ecfbb9ef680eb01b5c5aff4c25d5e3fea57cbf684b473932ca4cd9e43653a";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(4242, () => console.log("Running on port 4242"));
