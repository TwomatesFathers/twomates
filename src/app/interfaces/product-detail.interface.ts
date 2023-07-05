// product.interface.ts
export interface ProductResponse {
    result: Product;
}

export interface Product {
    sync_product: SyncProduct;
    sync_variants: SyncVariant[];
}

export interface SyncProduct {
    id: number;
    external_id: string;
    name: string;
    thumbnail_url: string;
  }

export interface SyncVariant {
    id: number;
    external_id: string;
    variant_id: number;
    name: string;
    retail_price: string;
    currency: string;
    thumbnail_url: string;
    preview_url: string;
    files: VariantFile[];
}

export interface VariantFile {
    id: number;
    type: string;
    size: number;
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
}