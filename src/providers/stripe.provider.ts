import Stripe from 'stripe';

interface PaymentLinkOptions {
    lineItems: Array<{ price: string; quantity: number }>;
    allowPromotionCodes?: boolean;
    afterCompletion?: {
        type: 'redirect' | 'hosted_confirmation';
        redirect?: { url: string };
    };
}

class StripeProvider {
    version = "1.0.0";
    apiKey: string;
    icon: string = "https://cdn.brandfetch.io/idxAg10C0L/w/480/h/480/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1761194563315";
    provider: Stripe;

    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.provider = new Stripe(this.apiKey, {});
    }

    async generatePaymentLink(options: PaymentLinkOptions): Promise<string> {
        // Logic to generate a payment link using Stripe's API
        const paymentLink = await this.provider.paymentLinks.create({
            line_items: options.lineItems,
            allow_promotion_codes: options.allowPromotionCodes,
            after_completion: options.afterCompletion
        });

        return paymentLink.url;
    }
}

export default StripeProvider;