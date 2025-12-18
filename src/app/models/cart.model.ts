export interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
    title: string;
    price: number;
    image: string;
    currency: string;
    availableForSale: boolean;
    vendor: string;
}

export interface Cart {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    currency: string;
}