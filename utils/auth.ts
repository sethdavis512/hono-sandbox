import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { polar, checkout, portal, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox'
});

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: process.env.POLAR_PRODUCT_ID!,
                            slug: 'pro'
                        }
                    ],
                    successUrl: '/dashboard',
                    authenticatedUsersOnly: true
                }),
                portal({
                    returnUrl: `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/dashboard`
                }),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                    onOrderPaid: async (payload) => {
                        console.log('[Polar] Order paid:', payload);
                    },
                    onSubscriptionCreated: async (payload) => {
                        console.log('[Polar] Subscription created:', payload);
                    },
                    onSubscriptionCanceled: async (payload) => {
                        console.log('[Polar] Subscription canceled:', payload);
                    },
                    onCustomerStateChanged: async (payload) => {
                        console.log('[Polar] Customer state changed:', payload);
                    },
                    onPayload: async (payload) => {
                        console.log('[Polar] Webhook event:', payload.type);
                    }
                })
            ]
        })
    ]
});
