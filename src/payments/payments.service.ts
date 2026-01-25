import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecretKey)

    async createPaymentSession(){
        const session = await this.stripe.checkout.sessions.create({
            //colocar el id de mi orden
            payment_intent_data: {
                metadata: {}
            },
            line_items: [
                {
                    price_data: {
                        currency:'usd',
                        product_data: {
                            name: 'T-shirt'
                        },
                        unit_amount: 2000, //20 usd
                    },
                    quantity: 2
                }
            ],
            mode: 'payment',
            success_url: 'http://localhost:3003/payments/success',
            cancel_url: 'http://localhost:3003/payments/cancel'
        })

        return session;
    }
}
