export type ProductCategoryId = "nutrition" | "baby" | "medical" | "personal" | "senior" | "daily";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategoryId;
  categoryLabel: string;
  price: number;
  compareAt?: number;
  image?: string;
  imageAlt: string;
  badge?: string;
  description: string;
  highlights: string[];
  inquiryOnly?: boolean;
  tierPrice?: { quantity: number; unitPrice: number };
};

export const categories: { id: ProductCategoryId | "all"; name: string; tagline: string }[] = [
  { id: "all", name: "全部商品", tagline: "為全家挑選安心好物" },
  { id: "nutrition", name: "保健營養", tagline: "每日營養補給" },
  { id: "baby", name: "婦嬰用品", tagline: "溫柔呵護每個成長階段" },
  { id: "medical", name: "醫療照護", tagline: "居家照護先詢問藥師" },
  { id: "personal", name: "個人清潔", tagline: "清爽舒適每一天" },
  { id: "senior", name: "銀髮照護", tagline: "熟齡生活照護好幫手" },
  { id: "daily", name: "日常健康", tagline: "健康生活日常選物" },
];

export const products: Product[] = [
  {
    id: "omega3",
    name: "好鄰嚴選 Omega-3 魚油",
    subtitle: "日常營養補給・60 粒",
    category: "nutrition",
    categoryLabel: "保健營養",
    price: 790,
    compareAt: 990,
    image: "/images/promo-omega.jpg",
    imageAlt: "設計稿中的 Omega-3 魚油瓶",
    badge: "本月推薦",
    description: "嚴選日常營養補給，實際成分、食用方式與注意事項請以商品外包裝標示為準。",
    highlights: ["商品標示完整", "滿 2 件每件 NT$750", "食品非藥品，無醫療效能"],
    tierPrice: { quantity: 2, unitPrice: 750 },
  },
  {
    id: "probiotics",
    name: "優格益生菌日常配方",
    subtitle: "順暢補給・30 包",
    category: "nutrition",
    categoryLabel: "保健營養",
    price: 599,
    compareAt: 760,
    image: "/images/promo-probiotic.jpg",
    imageAlt: "設計稿中的益生菌商品包裝",
    badge: "人氣好評",
    description: "作為日常飲食補充選擇；請閱讀商品標示，特殊族群食用前可先向藥師或醫療人員詢問。",
    highlights: ["滿 2 件每件 NT$560", "食用方式依外包裝標示", "食品不得宣稱醫療效能"],
    tierPrice: { quantity: 2, unitPrice: 560 },
  },
  {
    id: "vitamin-c",
    name: "維生素 C 咀嚼錠",
    subtitle: "清新柑橘風味・60 錠",
    category: "nutrition",
    categoryLabel: "保健營養",
    price: 499,
    compareAt: 620,
    image: "/images/promo-vitamin.jpg",
    imageAlt: "設計稿中的維生素 C 瓶",
    badge: "限時優惠",
    description: "日常營養補給食品，請依商品包裝標示食用；本頁不提供疾病診斷或治療建議。",
    highlights: ["滿 2 件每件 NT$459", "食品請依標示適量食用", "食品非藥品"],
    tierPrice: { quantity: 2, unitPrice: 459 },
  },
  {
    id: "baby-lotion",
    name: "植萃寶寶潤膚乳",
    subtitle: "日常保濕・200 ml",
    category: "baby",
    categoryLabel: "婦嬰用品",
    price: 420,
    compareAt: 520,
    imageAlt: "婦嬰用品分類插圖",
    badge: "溫和呵護",
    description: "日常肌膚清潔保養用品，使用前請先詳閱產品標示與注意事項。",
    highlights: ["清爽保濕質地", "日常清潔保養", "使用前請閱讀標示"],
  },
  {
    id: "handwash",
    name: "植萃潔手慕斯補充組",
    subtitle: "清新草本香・兩入組",
    category: "personal",
    categoryLabel: "個人清潔",
    price: 360,
    compareAt: 450,
    imageAlt: "個人清潔用品分類插圖",
    badge: "居家必備",
    description: "日常清潔用品，使用方式與注意事項依產品外包裝標示。",
    highlights: ["補充包組合", "居家日常清潔", "避免接觸眼睛"],
  },
  {
    id: "salad-guide",
    name: "輕食營養日常指南",
    subtitle: "健康知識・藥師編輯",
    category: "daily",
    categoryLabel: "日常健康",
    price: 0,
    image: "/images/health-salad.jpg",
    imageAlt: "設計稿中的繽紛蔬菜沙拉",
    badge: "免費閱讀",
    description: "以均衡飲食與日常健康知識為主題的閱讀內容，並非個人診斷或治療建議。",
    highlights: ["健康知識文章", "不替代醫療診斷", "如有症狀請尋求專業醫療協助"],
  },
  {
    id: "care-consult",
    name: "居家照護用品諮詢",
    subtitle: "先諮詢藥師・確認適用品項",
    category: "medical",
    categoryLabel: "醫療照護",
    price: 0,
    image: "/images/pharmacist-icon.jpg",
    imageAlt: "藥師提供專業諮詢的圖示",
    badge: "藥師諮詢",
    description: "醫療器材僅於確認品項、販售者資格及法定資訊揭露條件均符合後，才提供通訊交易。此入口先協助您聯絡藥師。",
    highlights: ["請先確認醫材許可或登錄資訊", "不符合通訊交易條件的品項不提供線上下單", "使用前請詳閱醫療器材說明書"],
    inquiryOnly: true,
  },
];

export type ShippingMethod = "home_delivery" | "store_pickup";
export type QuoteLineInput = { productId: string; quantity: number };

export function calculateQuote(lines: QuoteLineInput[], shippingMethod: ShippingMethod) {
  if (!Array.isArray(lines) || lines.length > 30) throw new Error("購物車商品數量不正確");
  const normalized = new Map<string, number>();
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      throw new Error("商品數量需介於 1 至 99 件");
    }
    normalized.set(line.productId, (normalized.get(line.productId) ?? 0) + line.quantity);
  }
  const items = [...normalized.entries()].map(([productId, quantity]) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product) throw new Error("找不到購物車中的商品");
    if (product.inquiryOnly || product.price <= 0) throw new Error("此品項需先洽詢藥師，不能線上結帳");
    const unitPrice = product.tierPrice && quantity >= product.tierPrice.quantity ? product.tierPrice.unitPrice : product.price;
    const regularSubtotal = product.price * quantity;
    const lineTotal = unitPrice * quantity;
    return {
      productId,
      name: product.name,
      quantity,
      unitPrice,
      regularUnitPrice: product.price,
      lineTotal,
      discount: regularSubtotal - lineTotal,
      image: product.image ?? null,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.regularUnitPrice * item.quantity, 0);
  const discount = items.reduce((sum, item) => sum + item.discount, 0);
  const merchandiseTotal = subtotal - discount;
  const shippingFee = shippingMethod === "store_pickup" || merchandiseTotal >= 1200 ? 0 : 80;
  return {
    items,
    subtotal,
    discount,
    shippingFee,
    total: merchandiseTotal + shippingFee,
    freeShippingThreshold: 1200,
    remainingForFreeShipping: Math.max(0, 1200 - merchandiseTotal),
    shippingMethod,
  };
}
