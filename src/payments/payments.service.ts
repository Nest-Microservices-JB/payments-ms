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
        //test
        //const endpointSecret = 'whsec_d02bd8bf8b5fc7f7cba67e0288b6210f7ce5803171d14758805dcb9dcfaf421e';
        //real
        const endpointSecret = 'whsec_mZBEw9qdOPzQB2UJC8NeeY2vP9tLYWHo';
        
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            return res.status(400).send('Webhook Error: Missing stripe-signature header');
        }
        let event: Stripe.Event;
        try{            
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
        }catch(error){
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }

        switch(event.type){
            case 'charge.succeeded':
                console.log(event);
            break;
            default:
                console.log(`Event ${ event.type } not handled`)
        }

        return res.status(200).json({ sig })
    }
}
