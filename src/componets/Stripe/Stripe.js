const express = require('express')
// const { ResponseSchema } = require('../../helper/HelperFunctions');
// const { GetOrderById } = require('../Orders/OrdersService');
const router = express.Router()

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: "2022-08-01",
//   });

// router.get("/config", (req, res) => {
//     res.send({
//         publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//     });
// });

// router.post("/create-payment-intent", async (req, res) => {
//     const { order_id }=req.body
//     const order = await GetOrderById(order_id)
//     if(!order){
//         return res.status(400).json(ResponseSchema(req.t('Order Id Is Wrong'), false))
//     }
//     if(order?.payment_method=='online_success'){
//         return res.status(200).json(ResponseSchema(req.t('Order Already Paid'), true,{paid:true}))
//     }
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             currency: "AED",
//             amount: order?.total_price*100,
//             automatic_payment_methods: { enabled: true },
//         });
//         // Send publishable key and PaymentIntent details to client
//         let sendedObject={
//             clientSecret: paymentIntent.client_secret,
//             total_amount:order?.total_price
//         }
//         return res.status(200).json(ResponseSchema(req.t('Static Pages'), true, sendedObject));
//     } catch (e) {
//         return res.status(400).send({
//             error: {
//                 message: e.message,
//             },
//         });
//     }
// });

module.exports = router
