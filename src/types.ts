/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  priceOnRequest?: boolean;
  duration: number; // in minutes
  imageUrl: string;
  views?: number;
}

export interface ClientItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  birthday?: string;
  notes?: string;
  pipelineStage: 'lead' | 'negotiation' | 'active' | 'inactive';
  points: number;
  cashback: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  dateTime: string; // ISO String
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  notes?: string;
}

export interface FinanceEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: 'money' | 'card' | 'pix';
}

export interface PayableItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status: 'paid' | 'pending';
}

export interface ReceivableItem {
  id: string;
  clientName: string;
  serviceName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'received' | 'pending';
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  supplier: string;
  costPrice: number;
  salePrice: number;
}

export interface FidelityConfig {
  type: 'points' | 'cashback';
  rate: number; // standard: 5 ($ spent -> points/cashback)
  rule: string;
}

export interface CampaignItem {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'value';
  title: string;
  isActive: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // YYYY-MM-DD
  approved: boolean;
}

export interface Tenant {
  id: string;
  slug: string; // unique
  name: string;
  ownerName: string;
  ownerEmail: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string; // e.g. "amber", "rose", "emerald", "blue", "zinc"
  themeMode: 'light' | 'dark';
  fontFamily: 'sans' | 'serif' | 'mono';
  template: 'classic' | 'modern' | 'minimal';
  description: string;
  address: string;
  openingHours: string;
  customDomain?: string; // ex: "jkaturismo.com.br" — domínio pago configurado pelo admin
  dueDate?: string;      // ex: "2025-08-31" — data de vencimento da assinatura (YYYY-MM-DD)
  socials: {
    whatsapp: string;
    instagram: string;
    phone: string;
    email: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    kwai?: string;
    twitter?: string;
  };
  mapLocation: string; // iframe or place address
  services: Service[];
  crmClients: ClientItem[];
  bookings: Booking[];
  finance: {
    entries: FinanceEntry[];
    payables: PayableItem[];
    receivables: ReceivableItem[];
  };
  inventory: ProductItem[];
  fidelityProgram: FidelityConfig;
  marketingCampaigns: CampaignItem[];
  reviews: ReviewItem[];
  plan: 'basic' | 'professional' | 'premium';
  status: 'active' | 'suspended' | 'blocked';
  createdAt: string;
  planExpiration: string;
  productsToSell?: SalesProductItem[];
  instagramPhotos?: string[]; // até 6 URLs de fotos da galeria (exclusivo plano Premium)
  customForm?: FormConfig;
  paymentConfig?: PaymentConfig;
  seoAnalyticsConfig?: SeoAnalyticsConfig;
  whatsappWidgetConfig?: WhatsappWidgetConfig;
  formSubmissions?: FormSubmission[];
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'file';
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface FormConfig {
  enabled: boolean;
  title: string;
  fields: FormField[];
  destination: 'dashboard' | 'email' | 'whatsapp';
  destinationEmail?: string;
  destinationWhatsapp?: string;
}

export interface FormSubmission {
  id: string;
  data: Record<string, string>;
  createdAt: string;
}

export interface PaymentConfig {
  enabled: boolean;
  gateway: 'pix_whatsapp' | 'stripe' | 'mercadopago' | 'pagbank';
  pixKey?: string;
  pixHolderName?: string;
  stripePublicKey?: string;
  mercadopagoPublicKey?: string;
  pagbankPublicKey?: string;
}

export interface SeoAnalyticsConfig {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface WhatsappWidgetConfig {
  enabled: boolean;
  phoneNumber?: string;
  defaultMessage?: string;
  position?: 'right' | 'left';
}

export interface SalesProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface PlatformConfig {
  plans: {
    basic: { name: string; price: number; maxClients: number };
    professional: { name: string; price: number; maxClients: number };
    premium: { name: string; price: number; maxClients: number };
  };
  systemBalance: number;
}
