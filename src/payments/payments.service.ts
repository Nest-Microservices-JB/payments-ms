import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecretKey)

    async createPaymentSession(paymentSessionDto: PaymentSessionDto){
        const { currency, items } = paymentSessionDto;

        const lineItems = items.map( item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round( item.price * 100)
                },
                quantity: item.quantity
            }
        })
        const session = await this.stripe.checkout.sessions.create({
            //colocar el id de mi orden
            payment_intent_data: {
                metadata: {}
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3003/payments/success',
            cancel_url: 'http://localhost:3003/payments/cancel'
        })

        return session;
    }

    async stripeWebhook(req: Request, res: Response){
        const endpointSecret = 'whsec_d02bd8bf8b5fc7f7cba67e0288b6210f7ce5803171d14758805dcb9dcfaf421e';

        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;

        try{
            if (!sig) {
               return res.status(400).send('Webhook Error: Missing stripe-signature header');
            }
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
            console.log({ event })
        }catch(error){
            res.status(400).send(`Webhook Error: ${error.message}`);
        }

        return res.status(200).json({ sig })
    }
}
