import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { url } from 'inspector';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecretKey)
    private readonly logger = new Logger(`PaymentsService`);

    constructor( @Inject(NATS_SERVICE) private readonly client: ClientProxy){}

    async createPaymentSession(paymentSessionDto: PaymentSessionDto){
        const { currency, items, orderId } = paymentSessionDto;

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
                metadata: {
                    orderId: orderId,
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl,
        })

        //return session;
        return {
            cancelUrl: session.cancel_url,
            sessionUrl: session.success_url,
            url: session.url
        }
    }

    async stripeWebhook(req: Request, res: Response){
        //test
        //const endpointSecret = 'whsec_d02bd8bf8b5fc7f7cba67e0288b6210f7ce5803171d14758805dcb9dcfaf421e';
        //real
        const endpointSecret = envs.stripeEndpointSecret;
        
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
                const chargeSucceeded = event.data.object;
                const payload = {
                    stripePaymentId: chargeSucceeded.id,
                    orderId: chargeSucceeded.metadata.orderId,
                    receiptUrl: chargeSucceeded.receipt_url
                }

                this.client.emit('payment.succeeded', payload); // emite un evento sin esperar respuesta
            break;
            default:
                console.log(`Event ${ event.type } not handled`)
        }

        return res.status(200).json({ sig })
    }
}
