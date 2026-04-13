export interface Product {
  handle: string;
  title: string;
  body: string;
  vendor: string;
  type: string;
  tags: string;
  price: string;
  compare_price: string;
  sku: string;
  image: string;
  images: string[];
  option_name?: string;
  variants: Variant[];
}

export interface Variant {
  option: string;
  price: string;
  compare_price: string;
  sku: string;
}

export interface CartItem {
  key: string;
  handle: string;
  title: string;
  image: string;
  vendor: string;
  option: string;
  price: string;
  qty: number;
}
