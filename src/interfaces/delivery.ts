export interface Delivery {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string | null;
}
