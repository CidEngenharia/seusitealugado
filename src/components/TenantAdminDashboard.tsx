/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Megaphone,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Sliders,
  TrendingUp,
  Check,
  AlertTriangle,
  X,
  ShieldAlert,
  Zap,
  ArrowRightLeft,
  Settings,
  Save,
} from "lucide-react";
import {
  Tenant,
  Service,
  Booking,
  ClientItem,
  FinanceEntry,
  ProductItem,
  PayableItem,
  ReceivableItem,
  ReviewItem,
  CampaignItem,
} from "../types";
import LogoSeusiteAlugado from "./LogoSeusiteAlugado";

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string); // Fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface TenantAdminDashboardProps {
  tenant: Tenant;
  onRefreshTenant: () => void;
  onTenantUpdated: (tenant: Tenant) => void;
  onBackToPublicSite: () => void;
  userRole?: 'superadmin' | 'tenantadmin' | null;
}

export default function TenantAdminDashboard({
  tenant,
  onRefreshTenant,
  onTenantUpdated,
  onBackToPublicSite,
  userRole,
}: TenantAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "agenda"
    | "crm"
    | "finance"
    | "stock"
    | "marketing"
    | "reviews"
    | "settings"
    | "salesProducts"
  >("overview");

  // Upgrade state simulation
  const [upgrading, setUpgrading] = useState(false);

  // IA State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTaskType, setAiTaskType] = useState<string>("summary");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Add Item States inside workspace
  const [showAddService, setShowAddService] = useState(false);
  const [newSvcName, setNewSvcName] = useState("");
  const [newSvcPrice, setNewSvcPrice] = useState(30);
  const [newSvcDuration, setNewSvcDuration] = useState(30);
  const [newSvcDesc, setNewSvcDesc] = useState("");
  const [newSvcImg, setNewSvcImg] = useState("");

  const [showAddClient, setShowAddClient] = useState(false);
  const [newCliName, setNewCliName] = useState("");
  const [newCliPhone, setNewCliPhone] = useState("");
  const [newCliEmail, setNewCliEmail] = useState("");
  const [newCliNotes, setNewCliNotes] = useState("");

  const [showAddFinance, setShowAddFinance] = useState(false);
  const [newFinType, setNewFinType] = useState<"income" | "expense">("income");
  const [newFinCategory, setNewFinCategory] = useState("Serviço");
  const [newFinAmount, setNewFinAmount] = useState(50);
  const [newFinDesc, setNewFinDesc] = useState("");
  const [newFinMethod, setNewFinMethod] = useState<"money" | "card" | "pix">(
    "pix",
  );

  const [editingProduct, setEditingProduct] = useState<any>(null); // Added for edit functionality
  const [editingService, setEditingService] = useState<any>(null); // Added for edit functionality
  const [editingInventoryProduct, setEditingInventoryProduct] = useState<ProductItem | null>(null);

  const [showAddPayable, setShowAddPayable] = useState(false);
  const [editingPayable, setEditingPayable] = useState<PayableItem | null>(null);
  const [payableTitle, setPayableTitle] = useState("");
  const [payableDueDate, setPayableDueDate] = useState("");
  const [payableAmount, setPayableAmount] = useState(0);

  const [showAddReceivable, setShowAddReceivable] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<ReceivableItem | null>(null);
  const [receivableClient, setReceivableClient] = useState("");
  const [receivableService, setReceivableService] = useState("");
  const [receivableDueDate, setReceivableDueDate] = useState("");
  const [receivableAmount, setReceivableAmount] = useState(0);

  const startEditingInventoryProduct = (prod: ProductItem) => {
    setEditingInventoryProduct(prod);
    setNewProdName(prod.name);
    setNewProdCode(prod.code);
    setNewProdCategory(prod.category);
    setNewProdSupplier(prod.supplier);
    setNewProdQty(prod.quantity);
    setNewProdMin(prod.minQuantity);
    setNewProdCost(prod.costPrice);
    setNewProdSale(prod.salePrice);
    setShowAddProduct(true);
  };

  const handleDeleteInventoryProduct = (id: string) => {
    if (!window.confirm("Deseja realmente excluir este produto do estoque?")) return;
    const updated = {
      ...tenant,
      inventory: tenant.inventory.filter((p) => p.id !== id),
    };
    saveTenantChanges(updated);
  };

  const startEditingPayable = (pay: PayableItem) => {
    setEditingPayable(pay);
    setPayableTitle(pay.title);
    setPayableDueDate(pay.dueDate);
    setPayableAmount(pay.amount);
    setShowAddPayable(true);
  };

  const handleDeletePayable = (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta conta a pagar?")) return;
    saveTenantChanges({
      ...tenant,
      finance: {
        ...tenant.finance,
        payables: (tenant.finance.payables || []).filter((p) => p.id !== id),
      },
    });
  };

  const handleAddPayableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payableTitle || !payableAmount || !payableDueDate) return;
    
    let updatedPayables = [];
    if (editingPayable) {
      updatedPayables = (tenant.finance.payables || []).map((p) =>
        p.id === editingPayable.id
          ? { ...p, title: payableTitle, dueDate: payableDueDate, amount: Number(payableAmount) }
          : p
      );
    } else {
      const newPayable: PayableItem = {
        id: "pay-" + Date.now(),
        title: payableTitle,
        dueDate: payableDueDate,
        amount: Number(payableAmount),
        status: "pending",
      };
      updatedPayables = [...(tenant.finance.payables || []), newPayable];
    }

    saveTenantChanges({
      ...tenant,
      finance: {
        ...tenant.finance,
        payables: updatedPayables,
      },
    });
    setShowAddPayable(false);
    setEditingPayable(null);
    setPayableTitle("");
    setPayableDueDate("");
    setPayableAmount(0);
  };

  const startEditingReceivable = (rec: ReceivableItem) => {
    setEditingReceivable(rec);
    setReceivableClient(rec.clientName);
    setReceivableService(rec.serviceName);
    setReceivableDueDate(rec.dueDate);
    setReceivableAmount(rec.amount);
    setShowAddReceivable(true);
  };

  const handleDeleteReceivable = (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta conta a receber?")) return;
    saveTenantChanges({
      ...tenant,
      finance: {
        ...tenant.finance,
        receivables: (tenant.finance.receivables || []).filter((r) => r.id !== id),
      },
    });
  };

  const handleAddReceivableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivableClient || !receivableAmount || !receivableDueDate) return;

    let updatedReceivables = [];
    if (editingReceivable) {
      updatedReceivables = (tenant.finance.receivables || []).map((r) =>
        r.id === editingReceivable.id
          ? { ...r, clientName: receivableClient, serviceName: receivableService, dueDate: receivableDueDate, amount: Number(receivableAmount) }
          : r
      );
    } else {
      const newReceivable: ReceivableItem = {
        id: "rec-" + Date.now(),
        clientName: receivableClient,
        serviceName: receivableService || "Serviço",
        dueDate: receivableDueDate,
        amount: Number(receivableAmount),
        status: "pending",
      };
      updatedReceivables = [...(tenant.finance.receivables || []), newReceivable];
    }

    saveTenantChanges({
      ...tenant,
      finance: {
        ...tenant.finance,
        receivables: updatedReceivables,
      },
    });
    setShowAddReceivable(false);
    setEditingReceivable(null);
    setReceivableClient("");
    setReceivableService("");
    setReceivableDueDate("");
    setReceivableAmount(0);
  };

  const startEditingProduct = (product: any) => {
    setEditingProduct(product);
    setNewSalesProdName(product.name);
    setNewSalesProdDesc(product.description);
    setNewSalesProdPrice(product.price);
    setNewSalesProdImg(product.imageUrl);
    setShowAddSalesProduct(true);
  };
  const startEditingService = (service: any) => {
    setEditingService(service);
    setNewSvcName(service.name);
    setNewSvcPrice(service.price);
    setNewSvcDuration(service.duration);
    setNewSvcDesc(service.description);
    setNewSvcImg(service.imageUrl);
    setShowAddService(true);
  };
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Cremes");
  const [newProdCode, setNewProdCode] = useState("");
  const [newProdQty, setNewProdQty] = useState(10);
  const [newProdMin, setNewProdMin] = useState(3);
  const [newProdSupplier, setNewProdSupplier] = useState("");
  const [newProdCost, setNewProdCost] = useState(12);
  const [newProdSale, setNewProdSale] = useState(35);

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [newCoupCode, setNewCoupCode] = useState("");
  const [newCoupTitle, setNewCoupTitle] = useState("");
  const [newCoupDiscount, setNewCoupDiscount] = useState(15);
  const [newCoupType, setNewCoupType] = useState<"percent" | "value">(
    "percent",
  );

  const [selectedCrmClient, setSelectedCrmClient] = useState<ClientItem | null>(
    null,
  );

  // Venda de Produtos states
  const [showAddSalesProduct, setShowAddSalesProduct] = useState(false);
  const [newSalesProdName, setNewSalesProdName] = useState("");
  const [newSalesProdDesc, setNewSalesProdDesc] = useState("");
  const [newSalesProdPrice, setNewSalesProdPrice] = useState(0);
  const [newSalesProdImg, setNewSalesProdImg] = useState("");
  const [isCompressingSalesImg, setIsCompressingSalesImg] = useState(false);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [isCompressingBanner, setIsCompressingBanner] = useState(false);
  const [isSavingSiteSettings, setIsSavingSiteSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Tenant>(tenant);

  useEffect(() => {
    setSettingsDraft(tenant);
  }, [tenant.id]);

  const handleSalesProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingSalesImg(true);
      const compressedBase64 = await compressImage(file);
      setNewSalesProdImg(compressedBase64);
    } catch (err) {
      console.error("Erro ao comprimir imagem do produto:", err);
      alert("Erro ao processar imagem. Tente outro formato.");
    } finally {
      setIsCompressingSalesImg(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingLogo(true);
      const compressedBase64 = await compressImage(file);
      saveIdentitySettings({ logoUrl: compressedBase64 });
    } catch (err) {
      console.error("Erro ao comprimir logotipo:", err);
      alert("Erro ao processar logotipo.");
    } finally {
      setIsCompressingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingBanner(true);
      const compressedBase64 = await compressImage(file);
      saveIdentitySettings({ bannerUrl: compressedBase64 });
    } catch (err) {
      console.error("Erro ao comprimir banner:", err);
      alert("Erro ao processar banner.");
    } finally {
      setIsCompressingBanner(false);
    }
  };

  // Social media platform dynamic states
  const [socialPlatform, setSocialPlatform] = useState<string>("instagram");
  const [socialLink, setSocialLink] = useState<string>("instagram.com/");

  // Save Tenant helper
  const saveTenantChanges = async (updated: Tenant) => {
    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (response.ok) {
        onTenantUpdated(updated);
        onRefreshTenant();
      } else {
        onTenantUpdated(updated);
        console.warn("API não confirmou a atualização do tenant. Alteração aplicada apenas na sessão atual.");
      }
    } catch (e) {
      console.error(e);
      onTenantUpdated(updated);
    }
  };

  // Perform immediate upgrade
  const handleUpgradeToPlan = async (
    targetPlan: "professional" | "premium",
  ) => {
    setUpgrading(true);
    const updated: Tenant = {
      ...tenant,
      plan: targetPlan,
      planExpiration: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
    await saveTenantChanges(updated);
    setUpgrading(false);
  };

  // Check feature permission per tier
  const isFeatureLocked = (tab: string): boolean => {
    if (userRole === "superadmin") return false; // Super admin has full access to all tabs
    if (tab === "salesProducts") {
      return tenant.plan !== "premium";
    }
    if (tenant.plan === "basic") {
      return (
        ["crm", "agenda", "finance", "stock", "marketing", "reviews"].includes(
          tab,
        ) || tab === "ai"
      );
    }
    if (tenant.plan === "professional") {
      return ["marketing"].includes(tab) || tab === "ai";
    }
    return false; // Premium plan unlocks everything
  };

  // Trigger Gemini Assist proxy
  const triggerAiAssist = async (task: string) => {
    setAiLoading(true);
    setAiResponse("");
    setAiTaskType(task);
    try {
      const response = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          tenantState: tenant,
          taskType: task,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setAiResponse(result.text || "Sem resposta do assistente.");
      } else {
        setAiResponse("Erro ao invocar o assistente. Verifique os logs.");
      }
    } catch (e: any) {
      setAiResponse(`Erro: ${e.message}`);
    } finally {
      setAiLoading(false);
      setAiPrompt("");
    }
  };

  // Add a custom service
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName || !newSvcPrice) return;
    const newSvc: Service = {
      id: "srv-" + Date.now(),
      name: newSvcName,
      price: Number(newSvcPrice),
      duration: Number(newSvcDuration),
      description: newSvcDesc,
      imageUrl:
        newSvcImg ||
        "https://images.unsplash.com/photo-1541599540903-216a46ca1bf0?w=150",
    };

    const updated = {
      ...tenant,
      services: [...tenant.services, newSvc],
    };
    saveTenantChanges(updated);
    setShowAddService(false);
    setNewSvcName("");
    setNewSvcDesc("");
  };

  // Delete a service
  const handleDeleteService = (id: string) => {
    const updated = {
      ...tenant,
      services: tenant.services.filter((s) => s.id !== id),
    };
    saveTenantChanges(updated);
  };

  // Add a product to sell
  const handleAddSalesProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalesProdName) return;
    const currentProds = tenant.productsToSell || [];
    
    let updatedProds = [];
    if (editingProduct) {
      updatedProds = currentProds.map(p => 
        p.id === editingProduct.id ? {
          ...p,
          name: newSalesProdName,
          description: newSalesProdDesc,
          price: Number(newSalesProdPrice),
          imageUrl: newSalesProdImg.trim() || p.imageUrl
        } : p
      );
    } else {
      const newProd = {
        id: "prod-" + Date.now(),
        name: newSalesProdName,
        description: newSalesProdDesc,
        price: Number(newSalesProdPrice),
        imageUrl:
          newSalesProdImg.trim() ||
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=60",
      };
      updatedProds = [...currentProds, newProd];
    }

    const updated = {
      ...tenant,
      productsToSell: updatedProds,
    };

    saveTenantChanges(updated);
    setShowAddSalesProduct(false);
    setEditingProduct(null);
    setNewSalesProdName("");
    setNewSalesProdDesc("");
    setNewSalesProdPrice(0);
    setNewSalesProdImg("");
  };

  // Delete a product to sell
  const handleDeleteSalesProduct = (id: string) => {
    const currentProds = tenant.productsToSell || [];
    const updated = {
      ...tenant,
      productsToSell: currentProds.filter((p) => p.id !== id),
    };
    saveTenantChanges(updated);
  };

  // Add CRM Client
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliName || !newCliPhone) return;
    const newCli: ClientItem = {
      id: "cli-" + Date.now(),
      name: newCliName,
      phone: newCliPhone,
      email: newCliEmail,
      notes: newCliNotes,
      pipelineStage: "lead",
      points: 0,
      cashback: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...tenant,
      crmClients: [...(tenant.crmClients || []), newCli],
    };
    saveTenantChanges(updated);
    setShowAddClient(false);
    setNewCliName("");
    setNewCliPhone("");
    setNewCliEmail("");
    setNewCliNotes("");
  };

  // Move CRM stage
  const updateClientStage = (
    id: string,
    stage: "lead" | "negotiation" | "active" | "inactive",
  ) => {
    const updatedClients = tenant.crmClients.map((c) => {
      if (c.id === id) {
        return { ...c, pipelineStage: stage };
      }
      return c;
    });
    saveTenantChanges({ ...tenant, crmClients: updatedClients });
  };

  // Approve a review
  const toggleApproveReview = (id: string) => {
    const updatedReviews = tenant.reviews.map((r) => {
      if (r.id === id) {
        return { ...r, approved: !r.approved };
      }
      return r;
    });
    saveTenantChanges({ ...tenant, reviews: updatedReviews });
  };

  // Delete booking
  const handleCancelBooking = (id: string) => {
    const updatedBookings = tenant.bookings.map((b) => {
      if (b.id === id) {
        return { ...b, status: "cancelled" as const };
      }
      return b;
    });
    saveTenantChanges({ ...tenant, bookings: updatedBookings });
  };

  // Move booking to attended
  const handleCompleteBooking = (booking: Booking) => {
    const updatedBookings = tenant.bookings.map((b) => {
      if (b.id === booking.id) {
        return { ...b, status: "attended" as const };
      }
      return b;
    });

    // Add income automatic based on service price!
    const servicePrice =
      tenant.services.find((s) => s.id === booking.serviceId)?.price || 50;
    const serviceName =
      tenant.services.find((s) => s.id === booking.serviceId)?.name ||
      "Serviço";

    const newEntry: FinanceEntry = {
      id: "f-" + Date.now(),
      type: "income",
      category: "Serviço",
      amount: servicePrice,
      date: new Date().toISOString().split("T")[0],
      description: `Agendamento Pago de ${booking.clientName} - ${serviceName}`,
      paymentMethod: "pix",
    };

    // Update client loyalty cashback or points
    const updatedClients = tenant.crmClients.map((c) => {
      if (c.phone === booking.clientPhone || c.name === booking.clientName) {
        const rate = tenant.fidelityProgram.rate || 5;
        if (tenant.fidelityProgram.type === "cashback") {
          return { ...c, cashback: c.cashback + servicePrice * (rate / 100) };
        } else {
          return { ...c, points: c.points + Math.floor(servicePrice * rate) };
        }
      }
      return c;
    });

    const updated = {
      ...tenant,
      bookings: updatedBookings,
      crmClients: updatedClients,
      finance: {
        ...tenant.finance,
        entries: [...tenant.finance.entries, newEntry],
      },
    };
    saveTenantChanges(updated);
  };

  // Add finance entries
  const handleAddFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinAmount || !newFinDesc) return;
    const newEntry: FinanceEntry = {
      id: "fin-" + Date.now(),
      type: newFinType,
      category: newFinCategory,
      amount: Number(newFinAmount),
      date: new Date().toISOString().split("T")[0],
      description: newFinDesc,
      paymentMethod: newFinMethod,
    };

    const updated = {
      ...tenant,
      finance: {
        ...tenant.finance,
        entries: [...tenant.finance.entries, newEntry],
      },
    };
    saveTenantChanges(updated);
    setShowAddFinance(false);
    setNewFinDesc("");
  };

  // Add product to stock
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSale) return;
    
    let updatedInv = [];
    if (editingInventoryProduct) {
      updatedInv = tenant.inventory.map((p) =>
        p.id === editingInventoryProduct.id
          ? {
              ...p,
              code: newProdCode || p.code,
              name: newProdName,
              category: newProdCategory,
              quantity: Number(newProdQty),
              minQuantity: Number(newProdMin),
              supplier: newProdSupplier,
              costPrice: Number(newProdCost),
              salePrice: Number(newProdSale),
            }
          : p
      );
    } else {
      const newProduct: ProductItem = {
        id: "p-" + Date.now(),
        code: newProdCode || "PROD-" + Math.floor(Math.random() * 1000),
        name: newProdName,
        category: newProdCategory,
        quantity: Number(newProdQty),
        minQuantity: Number(newProdMin),
        supplier: newProdSupplier,
        costPrice: Number(newProdCost),
        salePrice: Number(newProdSale),
      };
      updatedInv = [...(tenant.inventory || []), newProduct];
    }

    const updated = {
      ...tenant,
      inventory: updatedInv,
    };
    saveTenantChanges(updated);
    setShowAddProduct(false);
    setEditingInventoryProduct(null);
    setNewProdName("");
    setNewProdCode("");
    setNewProdCategory("Cremes");
    setNewProdSupplier("");
    setNewProdQty(10);
    setNewProdMin(3);
    setNewProdCost(12);
    setNewProdSale(35);
  };

  // Adjust product quantity (Inputs/Outputs)
  const adjustProductQuantity = (id: string, amount: number) => {
    const updatedInv = tenant.inventory.map((p) => {
      if (p.id === id) {
        return { ...p, quantity: Math.max(0, p.quantity + amount) };
      }
      return p;
    });
    saveTenantChanges({ ...tenant, inventory: updatedInv });
  };

  // Add discount coupon
  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupCode || !newCoupTitle) return;
    const newCoupon: CampaignItem = {
      id: "camp-" + Date.now(),
      code: newCoupCode.toUpperCase(),
      discount: Number(newCoupDiscount),
      type: newCoupType,
      title: newCoupTitle,
      isActive: true,
    };
    const updated = {
      ...tenant,
      marketingCampaigns: [...(tenant.marketingCampaigns || []), newCoupon],
    };
    saveTenantChanges(updated);
    setShowAddCoupon(false);
    setNewCoupCode("");
    setNewCoupTitle("");
  };

  // Delete coupon
  const handleDeleteCoupon = (id: string) => {
    const updated = {
      ...tenant,
      marketingCampaigns: tenant.marketingCampaigns.filter((c) => c.id !== id),
    };
    saveTenantChanges(updated);
  };

  // Toggle Coupon Status
  const toggleCouponStatus = (id: string) => {
    const updatedCoupons = tenant.marketingCampaigns.map((c) => {
      if (c.id === id) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    });
    saveTenantChanges({ ...tenant, marketingCampaigns: updatedCoupons });
  };

  // Save Identity Setting changes
  const saveIdentitySettings = (updates: Partial<Tenant>) => {
    setSettingsDraft((current) => ({ ...current, ...updates }));
  };

  const handleSaveSiteSettings = async () => {
    setIsSavingSiteSettings(true);
    await saveTenantChanges(settingsDraft);
    setIsSavingSiteSettings(false);
    alert("Configurações do site salvas com sucesso!");
  };

  // Calc quick stats for current business
  const clientCount = tenant.crmClients?.length || 0;
  const activeBookings =
    tenant.bookings?.filter(
      (b) => b.status === "confirmed" || b.status === "pending",
    ) || [];
  const entriesList = tenant.finance?.entries || [];
  const totalIncomes = entriesList
    .filter((e) => e.type === "income")
    .reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = entriesList
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncomes - totalExpenses;

  // Products below minimum alert count
  const lowStockCount =
    tenant.inventory?.filter((p) => p.quantity <= p.minQuantity).length || 0;

  // Chart data formatting for faturamento versus dev
  const payByMethodData = [
    {
      name: "Pix",
      value: entriesList
        .filter((e) => e.paymentMethod === "pix")
        .reduce((acc, cur) => acc + cur.amount, 0),
    },
    {
      name: "Cartão",
      value: entriesList
        .filter((e) => e.paymentMethod === "card")
        .reduce((acc, cur) => acc + cur.amount, 0),
    },
    {
      name: "Dinheiro",
      value: entriesList
        .filter((e) => e.paymentMethod === "money")
        .reduce((acc, cur) => acc + cur.amount, 0),
    },
  ].filter((item) => item.value > 0);

  const colors = ["#f59e0b", "#ec4899", "#3b82f6", "#10b981", "#6366f1"];

  return (
    <div
      id="tenant-admin-system"
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white"
    >
      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm z-40">
        <div className="flex items-center gap-3">
          <LogoSeusiteAlugado size="sm" theme="light" showSubtitle={false} />
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight flex items-center gap-1.5 text-slate-800">
              <span>{tenant.name}</span>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                PANEL
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium font-outfit">
              Assinatura mensal:{" "}
              <strong className="text-indigo-650 font-bold">
                Plano {tenant.plan.toUpperCase()}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onBackToPublicSite}
            className="text-xs font-bold px-4.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-205 rounded-full transition-all cursor-pointer shadow-sm"
          >
            ← Voltar para Meu Site Público
          </button>
        </div>
      </header>

      {/* BODY WITH SIDEBAR AND MAIN AREA */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* LEFTHAND NAVIGATION BAR */}
        <aside className="w-full md:w-64 bg-white md:border-r border-slate-200 p-5 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shadow-sm z-30">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "overview" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard Principal</span>
          </button>

          <button
            onClick={() => setActiveTab("agenda")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "agenda" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <Calendar size={14} />
              <span>Agenda Online</span>
            </div>
            {isFeatureLocked("agenda") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("crm")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "crm" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <Users size={14} />
              <span>Mini CRM Clientes</span>
            </div>
            {isFeatureLocked("crm") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("finance")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "finance" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <DollarSign size={14} />
              <span>Finanças e Fluxo</span>
            </div>
            {isFeatureLocked("finance") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "stock" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <Package size={14} />
              <span>Estoque de Produtos</span>
            </div>
            {isFeatureLocked("stock") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("marketing")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "marketing" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <Megaphone size={14} />
              <span>Marketing & Fidelidade</span>
            </div>
            {isFeatureLocked("marketing") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "reviews" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={14} />
              <span>Depoimentos Reais</span>
            </div>
            {isFeatureLocked("reviews") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("salesProducts")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "salesProducts" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={14} />
              <span>Venda de Produtos</span>
            </div>
            {isFeatureLocked("salesProducts") && (
              <Lock size={12} className="text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeTab === "settings" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50 font-bold shadow-inner" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <div className="flex items-center gap-3">
              <Settings size={14} />
              <span>Configuração do Site</span>
            </div>
          </button>
        </aside>

        {/* WORKSPACE CONTENT AREA WITH TIER INTEGRITY */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 relative">
          {/* TIER LOCK GENTLE BLOC OPERATOR */}
          {activeTab !== "overview" &&
            activeTab !== "settings" &&
            isFeatureLocked(activeTab) && (
              <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-md z-40 flex items-center justify-center p-6 transition-all">
                <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-205 p-8 rounded-2xl shadow-2xl text-slate-800 shadow-slate-200">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    <ShieldAlert size={26} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-800">
                      Recurso Bloqueado
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      A aba **{activeTab.toUpperCase()}** só está disponível
                      para parceiros cadastrados nos planos **Profissional** ou
                      **Premium** do SeusiteAlugado.
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                      Plano Lojista: {tenant.plan.toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <span className="text-slate-500 text-[11px] block text-left font-bold mb-2">
                      Selecione uma categoria para destravar agora em segundos:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleUpgradeToPlan("professional")}
                        disabled={upgrading}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Plano Profissional
                        <span className="block text-[9px] text-slate-400 font-normal">
                          CRM + Finanças + Estoque
                        </span>
                      </button>
                      <button
                        onClick={() => handleUpgradeToPlan("premium")}
                        disabled={upgrading}
                        className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-extrabold cursor-pointer shadow flex flex-col items-center justify-center gap-0.5"
                      >
                        <span className="flex items-center gap-1">
                          <Zap size={11} /> Plano Premium
                        </span>
                        <span className="text-[8px] font-normal text-indigo-200">
                          Assistente IA + Cashback
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* STAGE METRICS ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 text-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Clientes Cadastrados
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900">
                      {clientCount}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold">
                      +100%
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 text-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Agendamentos Ativos
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900">
                      {activeBookings.length}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      horários reservados
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 text-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Lucro Líquido Real
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                        ▲ R$ {totalIncomes.toFixed(2)}
                      </span>
                      <span className="text-xs font-black text-red-500 flex items-center gap-0.5">
                        ▼ R$ {totalExpenses.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                        Líq: <span className={`font-black ${netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>R$ {netProfit.toFixed(2)}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      entrada/saída
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 text-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Estoque Alerta
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-xl font-black ${lowStockCount > 0 ? "text-amber-500 animate-pulse" : "text-slate-700"}`}
                    >
                      {lowStockCount}
                    </span>
                    <span className="text-xs text-slate-555 font-semibold">
                      itens pendentes
                    </span>
                  </div>
                </div>
              </div>

              {/* INTEGRATED INTELLIGENT AI PARTNER ASSISTANT BOX */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-sm">
                {/* Visual glow bg */}
                <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-500/5 rounded-full filter blur-2xl"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="text-indigo-650 animate-pulse"
                      size={18}
                    />
                    <h3 className="font-extrabold text-sm text-slate-800">
                      Assistente e Parceiro de IA Comercial
                    </h3>
                    <span className="bg-indigo-50 text-indigo-750 text-[9px] px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase font-black">
                      AI Active
                    </span>
                  </div>

                  {tenant.plan !== "premium" && userRole !== "superadmin" && (
                    <span className="text-amber-600 text-[10px] font-bold">
                      ⚠️ Disponível integralmente no plano Premium
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                  Faça diagnósticos instantâneos, crie mensagens de marketing
                  persuasivas para WhatsApp/Instagram ou preveja metas
                  financeiras de faturamento com base nos seus dados do mini
                  CRM.
                </p>

                {/* Block for basic/professional plan */}
                {tenant.plan !== "premium" && userRole !== "superadmin" ? (
                  <div className="p-5 bg-slate-50 border border-slate-200/85 rounded-xl text-center space-y-3 shadow-inner">
                    <p className="text-xs text-slate-600 font-medium">
                      Sua assinatura atual **Plano {tenant.plan.toUpperCase()}**
                      não inclui operações cognitivas de Inteligência
                      Artificial.
                    </p>
                    <button
                      onClick={() => handleUpgradeToPlan("premium")}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow shadow-indigo-100 cursor-pointer transition-colors"
                    >
                      Fazer Upgrade para Premium (Destravar IA) ⚡
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* One-click fast choices panel */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => triggerAiAssist("summary")}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        📊 Fazer Resumo Diagnóstico
                      </button>
                      <button
                        onClick={() => triggerAiAssist("promo")}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        🏷️ Sugerir Cupons e Promoções
                      </button>
                      <button
                        onClick={() => triggerAiAssist("reactivate")}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        💬 Criar Mensagens Reativação WhatsApp
                      </button>
                      <button
                        onClick={() => triggerAiAssist("instagram")}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        📸 Post Criativos Instagram
                      </button>
                      <button
                        onClick={() => triggerAiAssist("forecast")}
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        📈 Prever Faturamento & Metas
                      </button>
                    </div>

                    {/* Manual Custom prompt */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ex: Como posso atrair mais clientes nas terças-feiras?"
                        className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 font-medium"
                        onKeyDown={(e) =>
                          e.key === "Enter" && triggerAiAssist("general")
                        }
                      />
                      <button
                        disabled={aiLoading}
                        onClick={() => triggerAiAssist("general")}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {aiLoading ? "Pensando..." : "Perguntar"}
                      </button>
                    </div>

                    {/* Output report from Gemini API */}
                    {aiLoading && (
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-center animate-pulse">
                        <span className="text-xs text-indigo-700 font-bold">
                          Processando com Inteligência Artificial (Gemini
                          3.5)...
                        </span>
                      </div>
                    )}

                    {aiResponse && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed space-y-3 max-h-96 overflow-y-auto shadow-inner text-slate-700">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-extrabold text-indigo-600 uppercase tracking-wider text-[9px]">
                            Assistente Cognitivo Real
                          </span>
                          <button
                            onClick={() => setAiResponse("")}
                            className="text-slate-400 hover:text-slate-700 font-bold"
                          >
                            limpar relatório
                          </button>
                        </div>
                        {/* Render simple markdown with style */}
                        <div className="space-y-3 prose prose-xs text-slate-600 max-w-none">
                          {aiResponse.split("\n\n").map((para, i) => {
                            if (para.startsWith("###")) {
                              return (
                                <h3
                                  key={i}
                                  className="text-sm font-extrabold text-slate-800 pt-2"
                                >
                                  {para.replace("###", "")}
                                </h3>
                              );
                            }
                            if (para.startsWith("####")) {
                              return (
                                <h4
                                  key={i}
                                  className="text-xs font-bold text-slate-800 pt-1"
                                >
                                  {para.replace("####", "")}
                                </h4>
                              );
                            }
                            if (para.startsWith("*")) {
                              const items = para
                                .split("\n")
                                .map((item) => item.replace("*", "").trim());
                              return (
                                <ul
                                  key={i}
                                  className="list-disc list-inside pl-2 space-y-1 my-1"
                                >
                                  {items.map((it, idx) => (
                                    <li key={idx} className="font-medium">
                                      {it}
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            return (
                              <p key={i} className="font-medium">
                                {para}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DUAL DATA CHARTING */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income/Expense Balance BarChart */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3 lg:col-span-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Fluxo de Caixa Operacional Recente
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Entradas",
                            valor: totalIncomes,
                            fill: "#10b981",
                          },
                          {
                            name: "Saídas",
                            valor: totalExpenses,
                            fill: "#ef4444",
                          },
                          {
                            name: "Saldo Liq.",
                            valor: netProfit,
                            fill: "#3b82f6",
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          fontWeight={600}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "12px",
                            fontSize: "11px",
                            color: "#1e293b",
                          }}
                        />
                        <Bar dataKey="valor">
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                          <Cell fill="#3b82f6" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie chart method */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Faturamento por Tipo
                  </h4>
                  {payByMethodData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-medium">
                      Nenhum pagamento registrado.
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col justify-between">
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={payByMethodData}
                              cx="50%"
                              cy="50%"
                              innerRadius={41}
                              outerRadius={65}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {payByMethodData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "8px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        {payByMethodData.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] text-slate-500 font-bold"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  backgroundColor: colors[idx % colors.length],
                                }}
                              ></span>
                              <span>{item.name}</span>
                            </div>
                            <span className="font-extrabold text-slate-800">
                              R$ {item.value.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LIST OF SERVICES MANAGEMENT */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Serviços Oferecidos no Mini-site
                  </h3>
                  <button
                    onClick={() => setShowAddService(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Cadastrar Novo Serviço</span>
                  </button>
                </div>

                {showAddService && (
                  <form
                    onSubmit={handleAddServiceSubmit}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1 col-span-1">
                          Nome do Serviço *
                        </label>
                        <input
                          type="text"
                          required
                          value={newSvcName}
                          onChange={(e) => setNewSvcName(e.target.value)}
                          placeholder="Ex: Corte Artístico"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1 col-span-1">
                          Preço Cobrado (R$) *
                        </label>
                        <input
                          type="number"
                          required
                          value={newSvcPrice}
                          onChange={(e) =>
                            setNewSvcPrice(Number(e.target.value))
                          }
                          placeholder="Ex: 45"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1 col-span-1">
                          Duração Estimada (Minutos)
                        </label>
                        <input
                          type="number"
                          value={newSvcDuration}
                          onChange={(e) =>
                            setNewSvcDuration(Number(e.target.value))
                          }
                          placeholder="Ex: 30"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        Descrição Curta *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSvcDesc}
                        onChange={(e) => setNewSvcDesc(e.target.value)}
                        placeholder="Quais detalhes o cliente verá ao fechar o agendamento?"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        Imagem Temática URL (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newSvcImg}
                        onChange={(e) => setNewSvcImg(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4.5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow"
                      >
                        Gravar Serviço
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddService(false)}
                        className="px-4.5 py-2.5 bg-slate-205 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenant.services.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-4 bg-white rounded-xl flex items-center justify-between border border-slate-200 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={svc.imageUrl}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                          alt=""
                        />
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800">
                            {svc.name}
                          </h4>
                          <span className="text-[11px] text-indigo-600 block font-black">
                            R$ {svc.price.toFixed(2)} • {svc.duration} mins
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditingService(svc)}
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          title="Editar serviço"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Deletar serviço"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AGENDA */}
          {activeTab === "agenda" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">
                  Listagem e Gestão de Agendamentos
                </h2>
                <div className="text-xs text-zinc-400">
                  Total: {tenant.bookings?.length || 0} consultório/cadeira
                  reservas
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs shadow-sm">
                <div className="grid grid-cols-5 bg-slate-50 p-3 font-semibold text-slate-500 border-b border-slate-200">
                  <span>Cliente</span>
                  <span>Serviço Reservado</span>
                  <span>Data e Hora</span>
                  <span>Estado</span>
                  <span className="text-right">Ação</span>
                </div>

                {tenant.bookings?.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">
                    Nenhum agendamento cadastrado no sitealugado da empresa.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {tenant.bookings.map((booking) => {
                      const service = tenant.services.find(
                        (s) => s.id === booking.serviceId,
                      );
                      return (
                        <div
                          key={booking.id}
                          className="grid grid-cols-5 p-3 items-center hover:bg-slate-50"
                        >
                          <div className="space-y-0.5">
                            <strong className="block text-slate-800">
                              {booking.clientName}
                            </strong>
                            <span className="block text-[10px] text-slate-500">
                              {booking.clientPhone}
                            </span>
                          </div>

                          <div>
                            <span className="font-medium text-slate-700">
                              {service?.name || "Serviço Simulado"}
                            </span>
                            <span className="block text-[10px] text-emerald-600">
                              R$ {(service?.price || 50).toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-800">
                              {new Date(booking.dateTime).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                            <span className="block font-bold text-amber-600">
                              {new Date(booking.dateTime).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                booking.status === "attended"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : booking.status === "confirmed"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : booking.status === "cancelled"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {booking.status === "attended"
                                ? "ATENDIDO"
                                : booking.status === "confirmed"
                                  ? "CONFIRMADO"
                                  : booking.status === "pending"
                                    ? "PENDENTE"
                                    : booking.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex justify-end gap-1">
                            {booking.status === "pending" && (
                              <button
                                onClick={() => handleCompleteBooking(booking)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                                title="Confirmar Atendido"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {booking.status !== "cancelled" &&
                              booking.status !== "attended" && (
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                  className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CRM */}
          {activeTab === "crm" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Funil e CRM de Negociação do Cliente
                  </h2>
                  <p className="text-xs text-slate-500">
                    Acompanhe novos prospects, ajuste fidelidade, cashback e
                    lance anotações do histórico.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cadastrar Cliente Manual
                </button>
              </div>

              {showAddClient && (
                <form
                  onSubmit={handleAddClientSubmit}
                  className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 text-xs shadow-md"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do Cliente"
                      required
                      value={newCliName}
                      onChange={(e) => setNewCliName(e.target.value)}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp / Telefone"
                      required
                      value={newCliPhone}
                      onChange={(e) => setNewCliPhone(e.target.value)}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={newCliEmail}
                    onChange={(e) => setNewCliEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-250 rounded text-slate-800 text-xs placeholder-slate-455 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <textarea
                    rows={2}
                    placeholder="Notas especiais (Ex: prefere esmalte neutro)"
                    value={newCliNotes}
                    onChange={(e) => setNewCliNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-250 rounded text-slate-800 text-xs placeholder-slate-455 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  ></textarea>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded cursor-pointer transition-all hover:bg-amber-400"
                    >
                      Adicionar Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddClient(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer transition-all border border-slate-205"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* CRM PIPELINE STAGES BLOCKS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* STAGE: LEADS */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-sm">
                  <span className="font-bold text-amber-600 block pb-1 border-b border-slate-200">
                    Leads (
                    {tenant.crmClients?.filter(
                      (c) => c.pipelineStage === "lead",
                    ).length || 0}
                    )
                  </span>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tenant.crmClients
                      ?.filter((c) => c.pipelineStage === "lead")
                      .map((cli) => (
                        <div
                          key={cli.id}
                          className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-2 shadow-sm"
                        >
                          <strong className="block text-slate-800 font-bold">
                            {cli.name}
                          </strong>
                          <span className="block text-[10px] text-slate-500">
                            {cli.phone}
                          </span>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <button
                              onClick={() => setSelectedCrmClient(cli)}
                              className="text-slate-500 hover:underline"
                            >
                              Ver Notas
                            </button>
                            <button
                              onClick={() =>
                                updateClientStage(cli.id, "negotiation")
                              }
                              className="text-amber-700 font-bold"
                            >
                              Negociar →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* STAGE: NEGOCIAÇÃO */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-sm">
                  <span className="font-bold text-blue-600 block pb-1 border-b border-slate-200">
                    Em Negociação (
                    {tenant.crmClients?.filter(
                      (c) => c.pipelineStage === "negotiation",
                    ).length || 0}
                    )
                  </span>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tenant.crmClients
                      ?.filter((c) => c.pipelineStage === "negotiation")
                      .map((cli) => (
                        <div
                          key={cli.id}
                          className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-2 shadow-sm"
                        >
                          <strong className="block text-slate-800 font-bold">
                            {cli.name}
                          </strong>
                          <span className="block text-[10px] text-slate-500">
                            {cli.phone}
                          </span>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <button
                              onClick={() => setSelectedCrmClient(cli)}
                              className="text-slate-500 hover:underline"
                            >
                              Ver Notas
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateClientStage(cli.id, "lead")
                                }
                                className="text-slate-500"
                              >
                                ← Retornar
                              </button>
                              <button
                                onClick={() =>
                                  updateClientStage(cli.id, "active")
                                }
                                className="text-emerald-700 font-bold"
                              >
                                Ativar →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* STAGE: ATIVO */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-sm">
                  <span className="font-bold text-emerald-600 block pb-1 border-b border-slate-200">
                    Ativos Recorrentes (
                    {tenant.crmClients?.filter(
                      (c) => c.pipelineStage === "active",
                    ).length || 0}
                    )
                  </span>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tenant.crmClients
                      ?.filter((c) => c.pipelineStage === "active")
                      .map((cli) => (
                        <div
                          key={cli.id}
                          className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-2 shadow-sm"
                        >
                          <strong className="block text-slate-800 font-bold">
                            {cli.name}
                          </strong>
                          <div className="flex gap-1 items-center text-[9px] text-slate-500">
                            <span>
                              💰 Cashback: R$ {cli.cashback.toFixed(2)}
                            </span>
                            <span>•</span>
                            <span>🌟 PTS: {cli.points}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                            <button
                              onClick={() => setSelectedCrmClient(cli)}
                              className="text-slate-500 hover:underline"
                            >
                              Ver Histórico
                            </button>
                            <button
                              onClick={() =>
                                updateClientStage(cli.id, "inactive")
                              }
                              className="text-red-600"
                            >
                              Inativar?
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* STAGE: INATIVOS */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                  <span className="font-bold text-red-600 block pb-1 border-b border-slate-200">
                    Inativos Sumidos (
                    {tenant.crmClients?.filter(
                      (c) => c.pipelineStage === "inactive",
                    ).length || 0}
                    )
                  </span>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tenant.crmClients
                      ?.filter((c) => c.pipelineStage === "inactive")
                      .map((cli) => (
                        <div
                          key={cli.id}
                          className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-2 shadow-sm"
                        >
                          <strong className="block text-slate-800 font-bold">
                            {cli.name}
                          </strong>
                          <span className="block text-[10px] text-slate-500">
                            {cli.phone}
                          </span>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <button
                              onClick={() => setSelectedCrmClient(cli)}
                              className="text-slate-500 hover:underline"
                            >
                              Ver Histórico
                            </button>
                            <button
                              onClick={() =>
                                updateClientStage(cli.id, "active")
                              }
                              className="text-emerald-700 font-bold"
                            >
                              Reativar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* OVERLAY: CLIENT HISTORY POPUP */}
              {selectedCrmClient && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Ficha Completa do Cliente
                    </h3>
                    <div className="space-y-2 text-xs text-slate-700">
                      <p>
                        <strong className="text-slate-900">Nome</strong>:{" "}
                        {selectedCrmClient.name}
                      </p>
                      <p>
                        <strong className="text-slate-900">Telefone</strong>:{" "}
                        {selectedCrmClient.phone}
                      </p>
                      <p>
                        <strong className="text-slate-900">Email</strong>:{" "}
                        {selectedCrmClient.email || "Não informado"}
                      </p>
                      <p>
                        <strong className="text-slate-900">
                          Fidelidade Acumulada
                        </strong>
                        :
                      </p>
                      <ul className="list-disc leading-tight pl-4 text-[11px] text-slate-600">
                        <li>Frequência geral: Alta Recorrência</li>
                        <li>
                          Cashback Disponível: R${" "}
                          {selectedCrmClient.cashback.toFixed(2)}
                        </li>
                        <li>
                          Pontos de fidelidade: {selectedCrmClient.points} pts
                        </li>
                      </ul>
                      <div className="p-2.5 bg-slate-100/50 rounded mt-1 border border-slate-250">
                        <span className="font-bold block text-slate-500 text-[10px]">
                          Anotações de Atendimento:
                        </span>
                        <p className="text-[11px] italic text-slate-700 mt-1">
                          "
                          {selectedCrmClient.notes ||
                            "Nenhum histórico digitado ainda."}
                          "
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCrmClient(null)}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-850 font-bold rounded text-xs border border-slate-200 transition-all cursor-pointer"
                    >
                      Fechar Ficha
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: FINANCEIRO */}
          {activeTab === "finance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">
                    Controle do Fluxo de Caixa Empresarial
                  </h2>
                  <p className="text-xs text-zinc-450">
                    Lance gastos operacionais diários (água, luz, insumos) e
                    veja relatórios consolidados.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFinance(true)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Lançar Entrada ou Saída
                </button>
              </div>

              {showAddFinance && (
                <form
                  onSubmit={handleAddFinanceSubmit}
                  className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 text-xs shadow-md"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        value={new Date().toISOString().split("T")[0]} // Simplified for now
                        className="w-full p-2 bg-white border border-slate-250 text-slate-800 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Tipo de Lançamento
                      </label>
                      <select
                        value={newFinType}
                        onChange={(e) =>
                          setNewFinType(e.target.value as "income" | "expense")
                        }
                        className="w-full p-2 bg-white border border-slate-250 text-slate-800 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                      >
                        <option value="income">Entrada (Income)</option>
                        <option value="expense">Saída (Expense)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Categoria
                      </label>
                      <input
                        type="text"
                        value={newFinCategory}
                        onChange={(e) => setNewFinCategory(e.target.value)}
                        placeholder="Ex: Fornecedor, Energia"
                        className="w-full p-2 bg-white border border-slate-250 text-slate-800 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Valor Unitário (R$)
                      </label>
                      <input
                        type="number"
                        value={newFinAmount}
                        onChange={(e) =>
                          setNewFinAmount(Number(e.target.value))
                        }
                        className="w-full p-2 bg-white border border-slate-250 text-slate-800 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">
                        Meio de Recebimento
                      </label>
                      <select
                        value={newFinMethod}
                        onChange={(e) =>
                          setNewFinMethod(
                            e.target.value as "money" | "card" | "pix",
                          )
                        }
                        className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-xs"
                      >
                        <option value="pix">Pix</option>
                        <option value="card">Cartão de Crédito/Débito</option>
                        <option value="money">Dinheiro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">
                      Descrição
                    </label>
                    <input
                      type="text"
                      required
                      value={newFinDesc}
                      onChange={(e) => setNewFinDesc(e.target.value)}
                      placeholder="Ex: Pagamento da conta de água do salão"
                      className="w-full p-2.5 bg-white border border-slate-250 text-slate-800 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded cursor-pointer transition-all hover:bg-amber-400"
                    >
                      Salvar Lançamento
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddFinance(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer transition-all border border-slate-205"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* CASH FLOW LOGS LIST */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                {/* RECENT ENTRIES (Faturamento / Saídas) */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 lg:col-span-2 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Histórico Recente de Lançamentos
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {entriesList.map((ent) => (
                      <div
                        key={ent.id}
                        className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100"
                      >
                        <div className="space-y-0.5">
                          <strong className="block text-slate-800 font-bold">
                            {ent.description}
                          </strong>
                          <span className="block text-[10px] text-slate-500">
                            {ent.date} • Categoria: {ent.category} •{" "}
                            {ent.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`font-black text-sm ${ent.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {ent.type === "income" ? "+" : "-"} R${" "}
                          {ent.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-emerald-700 font-bold">
                        Total Receitas
                      </span>
                      <span className="block text-sm text-emerald-800 font-black">
                        R${" "}
                        {entriesList
                          .filter((e) => e.type === "income")
                          .reduce((acc, curr) => acc + curr.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-red-50 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-red-700 font-bold">
                        Total Despesas
                      </span>
                      <span className="block text-sm text-red-800 font-black">
                        R${" "}
                        {entriesList
                          .filter((e) => e.type === "expense")
                          .reduce((acc, curr) => acc + curr.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coluna Lateral de Contas a Pagar e Receber */}
                <div className="space-y-4">
                  {/* Contas a Pagar */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-amber-600">
                        Contas a Pagar (Futuro)
                      </h5>
                      <button
                        onClick={() => {
                          setShowAddPayable(!showAddPayable);
                          setEditingPayable(null);
                          setPayableTitle("");
                          setPayableDueDate("");
                          setPayableAmount(0);
                        }}
                        className="text-amber-600 hover:text-amber-700 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {showAddPayable && (
                      <form onSubmit={handleAddPayableSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                        <span className="font-semibold text-[10px] text-amber-600 block">
                          {editingPayable ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Título (Ex: Conta de Luz)"
                          value={payableTitle}
                          onChange={(e) => setPayableTitle(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            value={payableDueDate}
                            onChange={(e) => setPayableDueDate(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                          />
                          <input
                            type="number"
                            required
                            placeholder="Valor"
                            value={payableAmount || ""}
                            onChange={(e) => setPayableAmount(Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                          />
                        </div>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => { setShowAddPayable(false); setEditingPayable(null); }}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-semibold text-[10px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 bg-amber-500 text-neutral-950 rounded font-bold text-[10px] cursor-pointer"
                          >
                            Salvar
                          </button>
                        </div>
                      </form>
                    )}
                    <div className="space-y-2">
                      {tenant.finance.payables?.length === 0 ? (
                        <p className="text-slate-500 text-[11px]">
                          Nenhum boleto cadastrado.
                        </p>
                      ) : (
                        tenant.finance.payables?.map((pay) => (
                          <div
                            key={pay.id}
                            className="p-2 bg-slate-50 border border-slate-100 rounded flex items-center justify-between"
                          >
                            <div className="truncate flex-1 pr-2">
                              <strong className="block text-[11px] text-slate-800 truncate">
                                {pay.title}
                              </strong>
                              <span className="block text-[9px] text-slate-500">
                                Vence: {pay.dueDate}
                              </span>
                            </div>
                            <span className="text-[11px] text-red-600 font-bold shrink-0">
                              R$ {pay.amount.toFixed(2)}
                            </span>
                            <div className="flex gap-1 ml-2 shrink-0">
                              <button
                                onClick={() => startEditingPayable(pay)}
                                className="text-slate-400 hover:text-indigo-650 cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeletePayable(pay.id)}
                                className="text-slate-400 hover:text-red-650 cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
 
                  {/* Contas a Receber */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-blue-600">
                        Contas a Receber (Em Aberto)
                      </h5>
                      <button
                        onClick={() => {
                          setShowAddReceivable(!showAddReceivable);
                          setEditingReceivable(null);
                          setReceivableClient("");
                          setReceivableService("");
                          setReceivableDueDate("");
                          setReceivableAmount(0);
                        }}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {showAddReceivable && (
                      <form onSubmit={handleAddReceivableSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                        <span className="font-semibold text-[10px] text-blue-600 block">
                          {editingReceivable ? "Editar Conta a Receber" : "Nova Conta a Receber"}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Cliente"
                          value={receivableClient}
                          onChange={(e) => setReceivableClient(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Serviço (Opcional)"
                          value={receivableService}
                          onChange={(e) => setReceivableService(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            value={receivableDueDate}
                            onChange={(e) => setReceivableDueDate(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                          />
                          <input
                            type="number"
                            required
                            placeholder="Valor"
                            value={receivableAmount || ""}
                            onChange={(e) => setReceivableAmount(Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded font-medium outline-none text-[11px]"
                          />
                        </div>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => { setShowAddReceivable(false); setEditingReceivable(null); }}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-semibold text-[10px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 bg-blue-500 text-white rounded font-bold text-[10px] cursor-pointer"
                          >
                            Salvar
                          </button>
                        </div>
                      </form>
                    )}
                    <div className="space-y-2">
                      {tenant.finance.receivables?.length === 0 ? (
                        <p className="text-slate-500 text-[11px]">
                          Sem faturamento em cobrança.
                        </p>
                      ) : (
                        tenant.finance.receivables?.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-2 bg-slate-50 border border-slate-100 rounded flex items-center justify-between"
                          >
                            <div className="truncate flex-1 pr-2">
                              <strong className="block text-[11px] text-slate-800 truncate">
                                {rec.clientName}
                              </strong>
                              <span className="block text-[9px] text-slate-500">
                                Espere p/: {rec.dueDate}
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-600 font-bold shrink-0">
                              R$ {rec.amount.toFixed(2)}
                            </span>
                            <div className="flex gap-1 ml-2 shrink-0">
                              <button
                                onClick={() => startEditingReceivable(rec)}
                                className="text-slate-400 hover:text-indigo-655 cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteReceivable(rec.id)}
                                className="text-slate-400 hover:text-red-655 cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ESTOQUE */}
          {activeTab === "stock" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">
                    Estoque de Consumo e Produtos de Revenda
                  </h2>
                  <p className="text-xs text-zinc-450">
                    Acompanhe quantidade, custo versus venda e receba avisos de
                    fornecedores pendentes.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs rounded-lg cursor-pointer animate-pulse"
                >
                  Cadastrar Produto Novo
                </button>
              </div>

              {showAddProduct && (
                <form
                  onSubmit={handleAddProductSubmit}
                  className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 text-xs shadow-md text-slate-800 animate-fade-in"
                >
                  <h3 className="font-bold text-indigo-650 text-sm">
                    {editingInventoryProduct ? "Editar Produto no Estoque" : "Cadastrar Produto Novo"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do Item *"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Código (Ex: POM-01)"
                      value={newProdCode}
                      onChange={(e) => setNewProdCode(e.target.value)}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Categoria (Ex: Cabelo)"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Fornecedor"
                      value={newProdSupplier}
                      onChange={(e) => setNewProdSupplier(e.target.value)}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="number"
                      placeholder="Estoque Atual"
                      value={newProdQty}
                      onChange={(e) => setNewProdQty(Number(e.target.value))}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Estoque Mínimo"
                      value={newProdMin}
                      onChange={(e) => setNewProdMin(Number(e.target.value))}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Preço de Custo"
                      value={newProdCost}
                      onChange={(e) => setNewProdCost(Number(e.target.value))}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Preço Venda"
                      value={newProdSale}
                      onChange={(e) => setNewProdSale(Number(e.target.value))}
                      className="p-2.5 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded cursor-pointer transition-all hover:bg-amber-400"
                    >
                      Gravar no Estoque
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingInventoryProduct(null);
                        setNewProdName("");
                        setNewProdCode("");
                        setNewProdCategory("Cremes");
                        setNewProdSupplier("");
                        setNewProdQty(10);
                        setNewProdMin(3);
                        setNewProdCost(12);
                        setNewProdSale(35);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer transition-all border border-slate-205"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* PRODUCTS WORKSPACE LIST */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs shadow-sm p-4">
                {tenant.inventory && tenant.inventory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenant.inventory.map((prod) => {
                      const isLow = prod.quantity <= prod.minQuantity;
                      return (
                        <div
                          key={prod.id}
                          className="bg-white p-4 border border-slate-200 rounded-xl space-y-2 relative"
                        >
                          <div className="absolute top-4 right-4 flex gap-1">
                            <button
                              onClick={() => startEditingInventoryProduct(prod)}
                              className="p-1 text-slate-400 hover:text-indigo-650 rounded transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteInventoryProduct(prod.id)}
                              className="p-1 text-slate-400 hover:text-red-650 rounded transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <span className="font-mono text-slate-500">
                            {prod.code}
                          </span>
                          <strong className="text-slate-800 block">
                            {prod.name}
                          </strong>
                          <span className="text-slate-600">
                            {prod.category}
                          </span>
                          <span className="text-slate-500">
                            {prod.supplier || "Diversos"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${isLow ? "text-amber-600" : "text-slate-600"}`}
                            >
                              {prod.quantity} unids
                            </span>
                            {isLow && (
                              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] animate-pulse font-bold border border-amber-200">
                                REPOR! (mín: {prod.minQuantity})
                              </span>
                            )}
                          </div>

                          <div className="flex justify-end gap-1.5 text-right">
                            <button
                              onClick={() => adjustProductQuantity(prod.id, 1)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px]"
                            >
                              + Entrada
                            </button>
                            <button
                              onClick={() => adjustProductQuantity(prod.id, -1)}
                              className="px-2 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 rounded font-bold text-[10px]"
                            >
                              - Saída
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    Sem mercadorias registradas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MARKETING */}
          {activeTab === "marketing" && (
            <div className="space-y-6">
              {/* FIDELITY PROGRAM SETUP BOX */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                  Motor de Incentivo de Automações
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  Programa de Fidelidade do Lojista
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold">
                      Modelo Programático
                    </label>
                    <select
                      value={tenant.fidelityProgram.type}
                      onChange={(e) => {
                        const updated = {
                          ...tenant,
                          fidelityProgram: {
                            ...tenant.fidelityProgram,
                            type: e.target.value as "points" | "cashback",
                          },
                        };
                        saveTenantChanges(updated);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 text-slate-800 rounded"
                    >
                      <option value="cashback">
                        💰 Configurar Cashback (% Reembolso Automático)
                      </option>
                      <option value="points">
                        🌟 Pontos de Visita Coletivo
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold">
                      Fator Proporção (Taxa % ou multiplicador)
                    </label>
                    <input
                      type="number"
                      value={tenant.fidelityProgram.rate}
                      onChange={(e) => {
                        const updated = {
                          ...tenant,
                          fidelityProgram: {
                            ...tenant.fidelityProgram,
                            rate: Number(e.target.value),
                          },
                        };
                        saveTenantChanges(updated);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 text-slate-800 rounded"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  <span className="font-semibold block mb-1 text-slate-800">
                    Regra Vigente Promulgada
                  </span>
                  <input
                    type="text"
                    value={tenant.fidelityProgram.rule}
                    onChange={(e) => {
                      const updated = {
                        ...tenant,
                        fidelityProgram: {
                          ...tenant.fidelityProgram,
                          rule: e.target.value,
                        },
                      };
                      saveTenantChanges(updated);
                    }}
                    className="w-full bg-transparent border-none text-zinc-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* COUPONS AND PROMOTION CAMPAIGNS CONTAINER */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    Cupons de Desconto Ativos no Mini-site
                  </h3>
                  <button
                    onClick={() => setShowAddCoupon(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    + Criar Código Cupom
                  </button>
                </div>

                {showAddCoupon && (
                  <form
                    onSubmit={handleAddCouponSubmit}
                    className="p-4 bg-white border border-slate-200 rounded-lg space-y-4 text-xs shadow-md"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">
                          Código Promocional (Maiúsculas) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCoupCode}
                          onChange={(e) => setNewCoupCode(e.target.value)}
                          placeholder="Ex: QUERO10"
                          className="w-full p-2 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">
                          Abate (Valor númerico) *
                        </label>
                        <input
                          type="number"
                          required
                          value={newCoupDiscount}
                          onChange={(e) =>
                            setNewCoupDiscount(Number(e.target.value))
                          }
                          placeholder="Ex: 10"
                          className="w-full p-2 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">
                          Forma do Desconto
                        </label>
                        <select
                          value={newCoupType}
                          onChange={(e) =>
                            setNewCoupType(
                              e.target.value as "percent" | "value",
                            )
                          }
                          className="w-full p-2 bg-white border border-slate-250 rounded text-slate-800 font-medium outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        >
                          <option value="percent">Porcentagem (%)</option>
                          <option value="value">Valor Nominal (R$)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">
                          Nome Campanha *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCoupTitle}
                          onChange={(e) => setNewCoupTitle(e.target.value)}
                          placeholder="Ex: Primeira Visita"
                          className="w-full p-2 bg-white border border-slate-250 rounded text-slate-800 placeholder-slate-455 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded cursor-pointer transition-all hover:bg-amber-400"
                      >
                        Habilitar Cupom
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCoupon(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer transition-all border border-slate-205"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {tenant.marketingCampaigns?.length === 0 ? (
                    <div className="text-slate-500 p-2">
                      Nenhum cupom ativo na loja. Cadastre acima.
                    </div>
                  ) : (
                    tenant.marketingCampaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <code className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200 font-mono font-bold">
                            {camp.code}
                          </code>
                          <strong className="block text-slate-800 text-xs pt-1">
                            {camp.title}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            Valor de redução:{" "}
                            {camp.type === "percent"
                              ? `${camp.discount}%`
                              : `R$ ${camp.discount}`}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCouponStatus(camp.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${camp.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}
                          >
                            {camp.isActive ? "ATIVO" : "DESATIVADO"}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(camp.id)}
                            className="text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* LISTA TRANSMISSAO EXCLUSIVA */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800">
                  Automações de Listas de Transmissão (Simulação)
                </h3>
                <p className="text-xs text-slate-500">
                  Monte réguas de envio rápidas para todos os clientes em funis
                  inativos ou cadastrados.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Transmissão por SMS / WhatsApp
                  </span>
                  <p className="text-slate-600">
                    Envie cupons selecionados para um grupo filtrado de contatos
                    simultaneamente sem estressar a API.
                  </p>

                  <button
                    onClick={() =>
                      alert(
                        "Simulação de Envio em Massa disparada: 4 contatos agendados receberão promoções de marketing de forma assíncrona!",
                      )
                    }
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Disparar WhatsApp Newsletter Oficial 📣
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEPOIMENTO APPROVALS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold">
                  Aprovação de Depoimentos e Avaliações recomendadas
                </h2>
                <p className="text-xs text-zinc-450 font-mono">
                  Controle o que exibe no seu mini site público de
                  SeusiteAlugado.
                </p>
              </div>

              <div className="space-y-4">
                {tenant.reviews?.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center p-6">
                    Nenhum feedback recebido ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tenant.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-sm"
                      >
                        <div className="space-y-1 md:max-w-xl">
                          <div className="flex items-center gap-3">
                            <strong className="text-slate-800 font-bold">
                              {rev.author}
                            </strong>
                            <span className="text-[10px] text-slate-500">
                              {rev.date}
                            </span>
                            <span className="text-amber-500 font-bold">
                              ★ {rev.rating}
                            </span>
                          </div>
                          <p className="text-slate-600 italic">
                            "{rev.comment}"
                          </p>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${rev.approved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                          >
                            {rev.approved
                              ? "EXTERNO - EXIBINDO NO SITE"
                              : "PENDENTE DE APROVAÇÃO"}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleApproveReview(rev.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${rev.approved ? "bg-zinc-800 text-zinc-300" : "bg-emerald-600 text-white"}`}
                        >
                          {rev.approved
                            ? "Ocultar do Site"
                            : "Aprovar no Site Público ✓"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SALES PRODUCTS MANAGER (PREMIUM TIER ONLY) */}
          {activeTab === "salesProducts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold">
                    Venda de Produtos Online
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Cadastre produtos e habilite a aba de catálogo integrado de
                    WhatsApp no seu site público.
                  </p>
                </div>

                {!isFeatureLocked("salesProducts") && (
                  <button
                    onClick={() => setShowAddSalesProduct(!showAddSalesProduct)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all duration-150"
                  >
                    <Plus size={14} />
                    {showAddSalesProduct
                      ? "Fechar Formulário"
                      : "Adicionar Produto"}
                  </button>
                )}
              </div>

              {isFeatureLocked("salesProducts") ? (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 max-w-lg mx-auto shadow-xl">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Lock size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800">
                      Opção Exclusiva para Clientes Premium
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A funcionalidade de catálogo de produtos à venda com botão
                      ativo de WhatsApp é habilitada exclusivamente para
                      assinantes do **Plano Premium**.
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpgradeToPlan("premium")}
                    className="px-5 py-2 inline-block bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 duration-100"
                  >
                    Fazer Upgrade para Premium Agora
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Form to Add Sales Product */}
                  {showAddSalesProduct && (
                    <form
                      onSubmit={handleAddSalesProductSubmit}
                      className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 text-xs max-w-2xl text-slate-800 shadow-md animate-fade-in"
                    >
                      <h3 className="font-bold text-indigo-650 text-sm">
                        Novo Produto para Venda
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-655 font-bold block">
                            Nome do Produto
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Ex: Top Fitness Cropped SallesFit"
                            value={newSalesProdName}
                            onChange={(e) =>
                              setNewSalesProdName(e.target.value)
                            }
                            className="w-full p-2.5 bg-white border border-slate-250 text-slate-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-455 font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-655 font-bold block">
                            Valor de Venda (R$)
                          </label>
                          <input
                            required
                            type="number"
                            step="0.01"
                            placeholder="Ex: 89.90"
                            value={newSalesProdPrice || ""}
                            onChange={(e) =>
                              setNewSalesProdPrice(Number(e.target.value))
                            }
                            className="w-full p-2.5 bg-white border border-slate-250 text-slate-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-455 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-slate-655 font-bold block">
                            Foto do Produto (URL ou Upload)
                          </label>
                          {isCompressingSalesImg && (
                            <span className="text-[10px] text-indigo-600 font-bold animate-pulse">
                              ⚡ Comprimindo imagem...
                            </span>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="Cole a URL da foto (opcional se fizer upload)"
                          value={newSalesProdImg}
                          onChange={(e) => setNewSalesProdImg(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 text-slate-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-455 font-medium"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSalesProductImageUpload}
                            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                          />
                          {newSalesProdImg && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              ✓ Imagem vinculada
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-655 font-bold block">
                          Descrição Detalhada do Produto
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Fale das qualidades, tecido, tamanhos e cores disponíveis para encantar seus clientes..."
                          value={newSalesProdDesc}
                          onChange={(e) => setNewSalesProdDesc(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 text-slate-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-455 font-medium"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSalesProduct(false);
                            setNewSalesProdName("");
                            setNewSalesProdDesc("");
                            setNewSalesProdPrice(0);
                            setNewSalesProdImg("");
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-all border border-slate-205"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow cursor-pointer transition-all"
                        >
                          Cadastrar Produto ✓
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products Grid */}
                  <div>
                    <h3 className="font-bold text-sm text-white mb-3">
                      Seus Produtos Cadastrados (
                      {tenant.productsToSell?.length || 0})
                    </h3>
                    {!tenant.productsToSell ||
                    tenant.productsToSell.length === 0 ? (
                      <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">
                        Nenhum produto cadastrado para venda no site público.
                        Clique em "Adicionar Produto" acima para começar!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {tenant.productsToSell.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              {product.imageUrl && (
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-950 relative border border-zinc-800">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-slate-800">
                                  {product.name}
                                </h4>
                                <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                                  {product.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-500 block uppercase tracking-wide">
                                  Preço de Venda
                                </span>
                                <span className="text-sm font-black text-slate-800">
                                  R$ {product.price.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditingProduct(product)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
                                  title="Editar produto"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSalesProduct(product.id)
                                  }
                                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
                                  title="Excluir produto"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    const shareUrl = `https://sitealugado.com/${tenant.slug}`;
                                    const text = `Confira o produto ${product.name} por R$ ${product.price.toFixed(2)} no meu site!`;
                                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`, "_blank");
                                  }}
                                  className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
                                  title="Compartilhar produto"
                                >
                                  <Share2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS & BRAND COR SETUP */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Configuração do Site
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSiteSettings}
                  disabled={isSavingSiteSettings}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer disabled:cursor-wait transition-colors shadow-sm"
                >
                  <Save size={14} />
                  {isSavingSiteSettings ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-800">
                  Identidade Visual Customizada (Site Rápido)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs animate-in fade-in duration-200">
                  {/* Color Selector */}
                  <div className="space-y-2 col-span-1">
                    <label className="block text-slate-500 font-bold">
                      Cor de Detalhe e Botões
                    </label>
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {["amber", "rose", "blue", "emerald", "zinc"].map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            saveIdentitySettings({ themeColor: c })
                          }
                          className={`w-10 h-10 rounded-xl border-2 transition-transform cursor-pointer flex items-center justify-center ${
                            c === "amber"
                              ? "bg-amber-500 border-amber-300"
                              : c === "rose"
                                ? "bg-rose-500 border-rose-300"
                                : c === "blue"
                                  ? "bg-blue-500 border-blue-300"
                                  : c === "emerald"
                                    ? "bg-emerald-500 border-emerald-300"
                                    : "bg-zinc-650 border-zinc-400"
                          } ${settingsDraft.themeColor === c ? "scale-110 ring-2 ring-white border-white" : "opacity-80"}`}
                        >
                          {settingsDraft.themeColor === c && (
                            <Check size={16} className="text-white font-bold" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font picker */}
                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold">
                      Fonte de Texto
                    </label>
                    <select
                      value={settingsDraft.fontFamily}
                      onChange={(e) =>
                        saveIdentitySettings({
                          fontFamily: e.target.value as
                            | "sans"
                            | "serif"
                            | "mono",
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 rounded"
                    >
                      <option value="sans">
                        Sans-serif Limpa (Inter/Helvetica)
                      </option>
                      <option value="serif">
                        Serif Elegante (Playfair/Georgia)
                      </option>
                      <option value="mono">
                        Monospace Técnica (Fira Code/JetBrains)
                      </option>
                    </select>
                  </div>

                  {/* Template Picker */}
                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold">
                      Layout Estrutural (Templates)
                    </label>
                    <select
                      value={settingsDraft.template}
                      onChange={(e) =>
                        saveIdentitySettings({
                          template: e.target.value as
                            | "classic"
                            | "modern"
                            | "minimal",
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded"
                    >
                      <option value="classic">
                        Layout Clássico Centralizado (Vintage)
                      </option>
                      <option value="modern">
                        Layout Sleek Bento-Grid (Startup)
                      </option>
                      <option value="minimal">
                        Minimalista Alto-Contraste
                      </option>
                    </select>
                  </div>

                  {/* Theme Mode Picker */}
                  <div className="space-y-2 relative">
                    <label className="block text-slate-500 font-bold flex items-center justify-between">
                      <span>Modo Visual Padrão</span>
                      {settingsDraft.plan !== "premium" && userRole !== "superadmin" && (
                        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                          <Lock size={8} /> Premium
                        </span>
                      )}
                    </label>
                    <select
                      value={settingsDraft.themeMode || "light"}
                      disabled={settingsDraft.plan !== "premium" && userRole !== "superadmin"}
                      onChange={(e) =>
                        saveIdentitySettings({
                          themeMode: e.target.value as "light" | "dark",
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded"
                    >
                      <option value="light">Modo Claro (Padrão)</option>
                      <option value="dark">Modo Escuro (Sleek Dark)</option>
                    </select>
                    {settingsDraft.plan !== "premium" && userRole !== "superadmin" ? (
                      <p className="text-[9px] text-amber-600/80 mt-1 leading-tight">
                        Disponível apenas para parceiros no plano **Premium**.
                      </p>
                    ) : (
                      <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                        Ativo! Clientes Premium herdam essa visualização padrão.
                      </p>
                    )}
                  </div>
                </div>

                {/* Banner & Cover Photo Layout Configuration */}
                <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold">
                      Foto da Capa (Logotipo / Perfil - URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settingsDraft.logoUrl}
                        onChange={(e) =>
                          saveIdentitySettings({ logoUrl: e.target.value })
                        }
                        placeholder="Cole o endereço da foto da capa"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded focus:outline-none"
                      />
                      {settingsDraft.logoUrl && (
                        <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                          <img
                            referrerPolicy="no-referrer"
                            src={settingsDraft.logoUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      {isCompressingLogo && (
                        <span className="text-[10px] text-indigo-600 font-bold animate-pulse">
                          ⚡ Comprimindo...
                        </span>
                      )}
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                      <span className="text-slate-500 font-bold text-[10px]">
                        Sugestões de Capa:
                      </span>
                      {[
                        {
                          name: "Barbearia",
                          url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150",
                        },
                        {
                          name: "Beleza",
                          url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150",
                        },
                        {
                          name: "Oficina/Mecânica",
                          url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150",
                        },
                        {
                          name: "Cafe/Restaurante",
                          url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150",
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            saveIdentitySettings({ logoUrl: preset.url })
                          }
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded text-[10px] text-slate-600 transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold font-sans">
                      Banner de Fundo da Página (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settingsDraft.bannerUrl}
                        onChange={(e) =>
                          saveIdentitySettings({ bannerUrl: e.target.value })
                        }
                        placeholder="Cole o endereço do banner da página"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded focus:outline-none"
                      />
                      {settingsDraft.bannerUrl && (
                        <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                          <img
                            referrerPolicy="no-referrer"
                            src={settingsDraft.bannerUrl}
                            alt="Preview Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      {isCompressingBanner && (
                        <span className="text-[10px] text-indigo-600 font-bold animate-pulse">
                          ⚡ Comprimindo...
                        </span>
                      )}
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                      <span className="text-zinc-500 font-bold text-[10px]">
                        Sugestões de Banner:
                      </span>
                      {[
                        {
                          name: "Dark Neon",
                          url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=800",
                        },
                        {
                          name: "Mármore Chic",
                          url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
                        },
                        {
                          name: "Escritório Moderno",
                          url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
                        },
                        {
                          name: "Estilo Industrial",
                          url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            saveIdentitySettings({ bannerUrl: preset.url })
                          }
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded text-[10px] text-zinc-300 transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CORE BUSINESS DESCRIPTION FORMS AND NETWORKS */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800">
                  Informações Básicas Gerais
                </h3>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleSaveSiteSettings();
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        Nome Fantasia do Negócio
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.name}
                        onChange={(e) =>
                          setSettingsDraft((current) => ({
                            ...current,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        Horário de Funcionamento
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.openingHours}
                        onChange={(e) =>
                          setSettingsDraft((current) => ({
                            ...current,
                            openingHours: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">
                      Endereço Físico
                    </label>
                    <input
                      type="text"
                      value={settingsDraft.address}
                      onChange={(e) =>
                        setSettingsDraft((current) => ({
                          ...current,
                          address: e.target.value,
                        }))
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        WhatsApp para Contatos
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.socials.whatsapp}
                        onChange={(e) =>
                          setSettingsDraft((current) => ({
                            ...current,
                            socials: {
                              ...current.socials,
                              whatsapp: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        Telefone de Contato
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.socials.phone || ""}
                        onChange={(e) =>
                          setSettingsDraft((current) => ({
                            ...current,
                            socials: {
                              ...current.socials,
                              phone: e.target.value,
                            },
                          }))
                        }
                        placeholder="Ex: (11) 4002-8922"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">
                        E-mail Comercial
                      </label>
                      <input
                        type="text"
                        value={settingsDraft.socials.email}
                        onChange={(e) =>
                          setSettingsDraft((current) => ({
                            ...current,
                            socials: {
                              ...current.socials,
                              email: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* DYNAMIC SOCIAL NETWORKS ADDER */}
                  <div className="border-t border-slate-200 pt-4 mt-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800">
                      Cadastrar Novas Redes Sociais
                    </h4>

                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-slate-600 mb-1.5 font-semibold">
                          Escolher Rede Social
                        </label>
                        <select
                          value={socialPlatform}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSocialPlatform(val);
                            const prefixes: Record<string, string> = {
                              instagram: "instagram.com/",
                              facebook: "facebook.com/",
                              youtube: "youtube.com/",
                              tiktok: "tiktok.com/@",
                              kwai: "kwai.com/",
                              twitter: "twitter.com/",
                            };
                            setSocialLink(prefixes[val] || "");
                          }}
                          className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 text-xs rounded focus:outline-none"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="kwai">Kwai (Kawai)</option>
                          <option value="twitter">Twitter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5 font-semibold">
                          Endereço (Auto-preenchido)
                        </label>
                        <input
                          type="text"
                          value={socialLink}
                          onChange={(e) => setSocialLink(e.target.value)}
                          placeholder="Ex: instagram.com/perfil"
                          className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 text-xs rounded focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!socialLink.trim()) {
                            alert(
                              "Preencha o link da rede social antes de adicionar.",
                            );
                            return;
                          }
                          // Save in socials object
                          const updatedSocials = {
                            ...settingsDraft.socials,
                            [socialPlatform]: socialLink,
                          };
                          setSettingsDraft((current) => ({
                            ...current,
                            socials: updatedSocials,
                          }));
                          alert(
                            `Rede social ${socialPlatform} cadastrada com sucesso!`,
                          );
                        }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded border border-emerald-500 cursor-pointer transition-colors px-4 flex items-center justify-center gap-1"
                      >
                        ✓ Cadastrar Rede
                      </button>
                    </div>

                    {/* Array of active social links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        "instagram",
                        "facebook",
                        "youtube",
                        "tiktok",
                        "kwai",
                        "twitter",
                      ].map((platform) => {
                        const linkValue =
                          settingsDraft.socials[
                            platform as keyof typeof settingsDraft.socials
                          ];
                        if (!linkValue) return null;
                        return (
                          <div
                            key={platform}
                            className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs shadow-sm"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-bold text-slate-700 capitalize">
                                {platform}:
                              </span>
                              <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                                {linkValue}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = { ...settingsDraft.socials };
                                delete copy[
                                  platform as keyof typeof settingsDraft.socials
                                ];
                                setSettingsDraft((current) => ({
                                  ...current,
                                  socials: copy,
                                }));
                                alert(
                                  `Rede social de ${platform} removida com sucesso.`,
                                );
                              }}
                              className="text-red-600 hover:text-red-700 text-[10.5px] font-bold underline cursor-pointer shrink-0"
                            >
                              Excluir
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
