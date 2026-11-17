import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Baby, BadgeCheck, BookOpen, Check, ChevronDown, ChevronRight,
  Clock3, Gift, Heart, HeartPulse, Home as HomeIcon, Leaf, LogOut, Mail, MapPin,
  Menu, Minus, PackageCheck, Phone, Plus, Search, ShieldCheck, ShoppingCart, Sparkles,
  Store, Stethoscope, Trash2, Truck, UserRound, X, type LucideIcon,
} from "lucide-react";
import { categories, products, type Product, type ProductCategoryId, type QuoteLineInput, type ShippingMethod } from "../../shared/store";
import { startLogin } from "./const";
import { useAuth } from "./_core/hooks/useAuth";
import { trpc } from "./lib/trpc";

type CartEntry = { productId: string; quantity: number };
const CART_KEY = "goodcare-cart-v1";
const formatMoney = (value: number) => new Intl.NumberFormat("zh-TW").format(value);
const readCart = (): CartEntry[] => {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
};

const categoryIcons: Record<string, LucideIcon> = {
  nutrition: HeartPulse, baby: Baby, medical: Stethoscope, personal: Sparkles,
  senior: Heart, daily: Leaf,
};

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand ${inverse ? "brand-inverse" : ""}`} aria-label="好鄰健康藥局首頁">
    {inverse ? <span className="brand-symbol"><HeartPulse size={30} /></span> : <img src="/images/brand-mark.jpg" alt="好鄰健康藥局標誌" />}
    {inverse && <span><b>好鄰健康藥局</b><small>GOODCARE PHARMACY</small></span>}
  </Link>;
}

function Header({ count, query, setQuery, onSearch }: { count: number; query: string; setQuery: (value: string) => void; onSearch: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const doLogout = async () => { await logout(); toast.success("已安全登出"); setLocation("/"); };
  return <>
    <div className="topline"><div className="wrap top-line-inner"><span><MapPin size={14} /> 高雄市・熱河街 123 號</span><i /> <span>營業時間：08:30－22:00</span><a href="tel:071234567">門市電話 07-123-4567</a></div></div>
    <header className="site-header">
      <div className="wrap header-main">
        <button className="mobile-menu icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="切換導覽選單">{menuOpen ? <X /> : <Menu />}</button>
        <Logo />
        <nav className={`primary-nav ${menuOpen ? "nav-open" : ""}`} aria-label="主要導覽">
          <Link href="/" className="nav-home"><HomeIcon size={15} fill="currentColor" /> 首頁</Link>
          <a href="#categories" onClick={() => setMenuOpen(false)}>商品分類 <ChevronDown size={13} /></a>
          <a href="#featured" onClick={() => setMenuOpen(false)}>健康專區 <ChevronDown size={13} /></a>
          <a href="#service" onClick={() => setMenuOpen(false)}>門市服務 <ChevronDown size={13} /></a>
          <Link href="/account" onClick={() => setMenuOpen(false)}>會員專區 <ChevronDown size={13} /></Link>
          <Link href="/policy" onClick={() => setMenuOpen(false)}>關於我們 <ChevronDown size={13} /></Link>
        </nav>
        <form className="search-box" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋商品或健康資訊…" aria-label="搜尋商品或健康資訊" />
          <button aria-label="搜尋"><Search size={19} /></button>
        </form>
        <Link href="/account" className="header-link account-link"><UserRound size={20} /><span>{isAuthenticated ? (user?.name || "會員中心") : "會員登入"}</span></Link>
        {isAuthenticated && <button className="logout-small" onClick={() => void doLogout()} aria-label="登出"><LogOut size={16} /></button>}
        <Link href="/cart" className="header-cart"><ShoppingCart size={21} /><span>購物車</span><b>{count}</b></Link>
      </div>
    </header>
  </>;
}

function Footer() {
  return <footer className="site-footer" id="service">
    <div className="wrap footer-main">
      <div className="footer-brand"><Logo inverse /><p>在地關懷・專業服務・健康生活更美好</p></div>
      <div className="footer-contact"><span><Phone size={17} /> 07-123-4567</span><span><MapPin size={17} /> 高雄市熱河街 123 號</span><span><Clock3 size={17} /> 08:30－22:00</span></div>
      <div className="newsletter"><label htmlFor="newsletter-email">訂閱健康資訊</label><div><input id="newsletter-email" placeholder="輸入 Email" type="email" /><button onClick={() => toast.success("感謝訂閱，好鄰健康資訊即將寄送給您。")}>訂閱</button></div></div>
    </div>
    <div className="wrap footer-bottom"><div><Link href="/policy">購物說明</Link><Link href="/policy">退換貨政策</Link><Link href="/policy">隱私權政策</Link><Link href="/policy">服務條款</Link><a href="tel:071234567">聯絡我們</a></div><span>© 2026 好鄰健康藥局　All Rights Reserved.</span></div>
  </footer>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const [, setLocation] = useLocation();
  const Icon = categoryIcons[product.category] || HeartPulse;
  return <article className="product-card">
    <button className="product-image" onClick={() => setLocation(`/products/${product.id}`)} aria-label={`查看${product.name}`}>
      {product.image ? <img src={product.image} alt={product.imageAlt} /> : <span className={`product-illustration illustration-${product.category}`}><Icon size={50} strokeWidth={1.3} /></span>}
      {product.badge && <span className="product-badge">{product.badge}</span>}
    </button>
    <div className="product-copy">
      <span className="product-category">{product.categoryLabel}</span>
      <Link href={`/products/${product.id}`} className="product-name">{product.name}</Link>
      <p>{product.subtitle}</p>
      {product.inquiryOnly ? <div className="price-line"><span className="ask-price">請先洽藥師</span></div> : product.price > 0 ? <div className="price-line"><strong>NT$ {formatMoney(product.price)}</strong>{product.compareAt && <del>NT$ {formatMoney(product.compareAt)}</del>}</div> : <div className="price-line"><strong className="free-tag">免費閱讀</strong></div>}
      <button className={product.inquiryOnly ? "outline-action" : "add-action"} onClick={() => product.inquiryOnly ? setLocation("/policy#consult") : product.id === "salad-guide" ? setLocation("/policy#health") : onAdd(product)}>{product.inquiryOnly ? <><Phone size={15} /> 藥師諮詢</> : product.id === "salad-guide" ? <>閱讀文章 <ArrowRight size={15} /></> : <><Plus size={15} /> 加入購物車</>}</button>
    </div>
  </article>;
}

function HomePage({ add, query, setCategory }: { add: (p: Product) => void; query: string; setCategory: (category: ProductCategoryId | "all") => void }) {
  const [active, setActive] = useState<ProductCategoryId | "all">("all");
  const [quoteQty, setQuoteQty] = useState(2);
  const [, setLocation] = useLocation();
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = active === "all" || product.category === active;
    const term = query.trim().toLocaleLowerCase();
    const matchesSearch = !term || `${product.name} ${product.subtitle} ${product.categoryLabel}`.toLocaleLowerCase().includes(term);
    return matchesCategory && matchesSearch && product.id !== "salad-guide";
  }), [active, query]);
  const selectCategory = (category: ProductCategoryId | "all") => { setActive(category); setCategory(category); };
  const featured = products.find((product) => product.id === "omega3")!;
  return <main>
    <section className="hero-wrap"><img src="/images/hero-pharmacy.jpg" alt="好鄰健康藥局，專業藥師陪伴全家人的健康；藥師在門市提供諮詢服務" className="hero-art" /><div className="hero-mobile-copy"><span>好鄰健康藥局・高雄在地服務</span><h1>專業藥師，<br />全家人的健康夥伴</h1><p>在地關懷・專業服務・健康生活更美好</p><button onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}>立即選購 <ArrowRight size={16} /></button></div></section>
    <section className="wrap category-rail" id="categories" aria-label="商品分類">
      {categories.filter((category) => category.id !== "all").map((category) => {
        const Icon = categoryIcons[category.id] || HeartPulse;
        return <button key={category.id} onClick={() => { selectCategory(category.id as ProductCategoryId); document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" }); }} className="category-tile"><span className={`category-icon icon-${category.id}`}><Icon size={29} strokeWidth={1.8} /></span><span><b>{category.name}</b><small>{category.tagline}</small></span><ChevronRight size={15} className="category-arrow" /></button>;
      })}
    </section>
    <section className="wrap home-showcase">
      <div className="promo-panel">
        <div className="ribbon">本月優惠</div><p className="eyebrow">好鄰嚴選・健康加倍</p><h2>精選保健商品<br /><strong>限時特惠中</strong></h2><p className="promo-subtitle">滿額免運・優惠即時試算</p>
        <div className="promo-bottles"><img src="/images/promo-omega.jpg" alt="Omega-3 魚油瓶" /><img src="/images/promo-probiotic.jpg" alt="益生菌包裝" /><img src="/images/promo-vitamin.jpg" alt="維生素 C 瓶" /></div>
        <button className="orange-button" onClick={() => { add(featured); toast.success("Omega-3 魚油已加入購物車"); }}>立即搶購 <ArrowRight size={16} /></button>
      </div>
      <div className="pharmacist-panel" id="consult">
        <img className="pharmacist-art" src="/images/pharmacist-icon.jpg" alt="藥師提供專業諮詢服務" />
        <div className="pharmacist-copy"><span className="eyebrow">專業・守護全家健康</span><h2>藥師諮詢服務</h2><p>用專業，守護全家健康</p><ul><li><Check size={15} /> 用藥諮詢・健康建議</li><li><Check size={15} /> 處方箋及個人用藥問題請親洽門市</li><li><Check size={15} /> 健康檢測與照護諮詢</li></ul><a href="tel:071234567" className="green-button"><Phone size={16} /> 線上聯絡藥師</a></div>
        <span className="handwritten">專業藥師<br />隨時為您服務！</span>
      </div>
      <div className="knowledge-panel" id="health">
        <div className="panel-heading"><span><BookOpen size={22} /> 健康知識館</span><Link href="/policy#health">更多文章 <ArrowRight size={14} /></Link></div>
        <button className="knowledge-card" onClick={() => setLocation("/policy#health")}><img src="/images/health-salad.jpg" alt="清爽均衡的蔬菜沙拉" /><span><b>夏季健康飲食指南</b><strong>輕鬆補充營養</strong><small>均衡飲食與日常營養知識，陪您安心照顧自己…</small><time>▦ 2025/06/15</time></span></button>
        <div className="slider-dots"><i className="active" /><i /><i /></div>
      </div>
    </section>
    <section className="quote-strip"><div className="wrap quote-strip-inner"><div className="quote-intro"><span className="eyebrow">即時報價小工具</span><b>買多更划算，價格馬上算給您看</b><small>選擇件數，立即查看分級優惠與配送金額</small></div><div className="quote-item"><img src="/images/promo-omega.jpg" alt="魚油商品" /><div><b>Omega-3 魚油</b><small>第 2 件起每件 NT$750</small></div><div className="quantity-stepper"><button onClick={() => setQuoteQty(Math.max(1, quoteQty - 1))} aria-label="減少數量"><Minus size={14} /></button><span>{quoteQty}</span><button onClick={() => setQuoteQty(quoteQty + 1)} aria-label="增加數量"><Plus size={14} /></button></div><strong className="quote-total">NT$ {formatMoney(quoteQty * (quoteQty >= 2 ? 750 : 790))}</strong><button className="green-button compact" onClick={() => { for (let i = 0; i < quoteQty; i++) add(featured); toast.success(`已將 ${quoteQty} 件加入購物車`); }}>加入購物車 <ArrowRight size={15} /></button></div></div></section>
    <section className="wrap product-section" id="featured">
      <div className="section-heading"><div><span className="eyebrow">GOODCARE SELECT</span><h2>{query ? `搜尋「${query}」` : "好鄰嚴選商品"}</h2><p>安心選品，讓健康融入每一天</p></div><Link href="/cart" className="text-link">查看購物車 <ArrowRight size={16} /></Link></div>
      <div className="category-pills">{categories.map((category) => <button key={category.id} className={active === category.id ? "selected" : ""} onClick={() => selectCategory(category.id)}>{category.name}</button>)}</div>
      {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={add} />)}</div> : <div className="empty-search"><Search size={25} /><b>沒有找到符合的商品</b><p>試試其他關鍵字，或聯絡藥師為您協助。</p><a href="tel:071234567" className="outline-action">聯絡藥師 <Phone size={15} /></a></div>}
    </section>
    <section className="trust-band"><div className="wrap trust-items"><div><Gift /><span><b>好鄰會員</b><small>每筆消費安心累積</small></span></div><div><HeartPulse /><span><b>藥師守護</b><small>專業諮詢・健康建議</small></span></div><div><Store /><span><b>門市取貨</b><small>線上預訂・門市付款</small></span></div><div><Truck /><span><b>安心配送</b><small>滿 NT$1,200 免運費</small></span></div></div></section>
  </main>;
}

function PageTitle({ eyebrow, title, back = "/" }: { eyebrow: string; title: string; back?: string }) {
  return <div className="page-title"><Link href={back} className="back-link"><ArrowLeft size={16} /> 返回</Link><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>;
}

function PriceBox({ quote, loading }: { quote: any; loading?: boolean }) {
  if (!quote) return <div className="quote-pending">{loading ? "正在更新報價…" : "報價資料載入中"}</div>;
  return <div className="price-box"><div><span>商品小計</span><b>NT$ {formatMoney(quote.subtotal)}</b></div>{quote.discount > 0 && <div className="discount-row"><span>數量優惠</span><b>− NT$ {formatMoney(quote.discount)}</b></div>}<div><span>配送費</span><b>{quote.shippingFee ? `NT$ ${formatMoney(quote.shippingFee)}` : "免費"}</b></div><div className="price-total"><span>報價總額</span><strong>NT$ {formatMoney(quote.total)}</strong></div>{quote.remainingForFreeShipping > 0 && <small className="shipping-tip">再買 NT$ {formatMoney(quote.remainingForFreeShipping)} 即享免運</small>}{quote.remainingForFreeShipping === 0 && <small className="shipping-tip">已達免運門檻</small>}</div>;
}

function CartPage({ cart, update, remove }: { cart: CartEntry[]; update: (id: string, qty: number) => void; remove: (id: string) => void }) {
  const [, setLocation] = useLocation();
  const quote = trpc.store.quote.useQuery({ items: cart, shippingMethod: "home_delivery" }, { enabled: cart.length > 0, staleTime: 0 });
  return <main className="wrap inner-page"><PageTitle eyebrow="購物袋" title="購物車" /><div className="cart-layout">
    <section className="cart-list card-surface"><div className="cart-list-heading"><b>商品內容</b><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} 件商品</span></div>
      {cart.length === 0 ? <div className="empty-cart"><ShoppingCart size={44} /><h2>購物車還沒有商品</h2><p>從好鄰嚴選開始，為日常健康補充安心好物。</p><Link href="/" className="green-button">前往選購 <ArrowRight size={15} /></Link></div> : cart.map((entry) => { const product = products.find((item) => item.id === entry.productId); if (!product) return null; return <div className="cart-row" key={entry.productId}><div className="cart-thumb">{product.image ? <img src={product.image} alt={product.imageAlt} /> : <HeartPulse />}</div><div className="cart-product"><Link href={`/products/${product.id}`}>{product.name}</Link><small>{product.subtitle}</small><span>NT$ {formatMoney(product.price)} / 件</span></div><div className="quantity-stepper"><button onClick={() => update(product.id, entry.quantity - 1)} aria-label="減少"><Minus size={13} /></button><span>{entry.quantity}</span><button onClick={() => update(product.id, entry.quantity + 1)} aria-label="增加"><Plus size={13} /></button></div><button className="remove-button" onClick={() => remove(product.id)} aria-label={`移除${product.name}`}><Trash2 size={17} /></button></div>; })}
    </section>
    <aside className="cart-summary card-surface"><h2>報價明細</h2><p className="live-label"><span /> 即時動態報價</p>{cart.length === 0 ? <div className="quote-pending">加入商品後即會顯示即時報價。</div> : <PriceBox quote={quote.data} loading={quote.isLoading} />}{quote.error && <p className="inline-error">{quote.error.message}</p>}<button className="green-button full-button" disabled={!cart.length || quote.isLoading || Boolean(quote.error)} onClick={() => setLocation("/checkout")}>前往結帳 <ArrowRight size={16} /></button><p className="secure-note"><ShieldCheck size={15} /> 訂單送出前會再次核算價格</p></aside>
  </div></main>;
}

function CheckoutPage({ cart, clearCart }: { cart: CartEntry[]; clearCart: () => void }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const profile = trpc.member.profile.useQuery(undefined, { enabled: isAuthenticated });
  const saveProfile = trpc.member.saveProfile.useMutation();
  const createOrder = trpc.store.createOrder.useMutation();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("home_delivery");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("高雄市");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [invoiceType, setInvoiceType] = useState<"personal" | "company">("personal");
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [taxId, setTaxId] = useState("");
  const quote = trpc.store.quote.useQuery({ items: cart, shippingMethod }, { enabled: cart.length > 0, staleTime: 0 });
  useEffect(() => {
    if (!profile.data) return;
    setRecipientName(profile.data.recipientName || user?.name || "");
    setPhone(profile.data.phone || ""); setCity(profile.data.city || "高雄市"); setDistrict(profile.data.district || ""); setAddress(profile.data.address || "");
  }, [profile.data, user?.name]);
  if (!cart.length) return <main className="wrap inner-page"><PageTitle eyebrow="完成訂單" title="結帳" /><div className="empty-cart card-surface"><ShoppingCart size={40} /><h2>購物車是空的</h2><Link href="/" className="green-button">返回選購</Link></div></main>;
  if (!isAuthenticated && !authLoading) return <main className="wrap inner-page"><PageTitle eyebrow="會員訂單" title="登入後完成訂單" /><div className="login-card card-surface"><UserRound size={42} /><h2>請先登入會員</h2><p>登入後即可保存收件資訊，並在會員中心查詢訂單。</p><button className="green-button" onClick={() => startLogin()}>使用 Manus 帳戶登入 <ArrowRight size={16} /></button><Link href="/cart" className="text-link">返回購物車</Link></div></main>;
  if (authLoading) return <main className="wrap inner-page"><div className="loading-card">正在確認會員狀態…</div></main>;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (shippingMethod === "home_delivery" && (!city || !district || address.trim().length < 5)) { toast.error("請填寫完整宅配地址"); return; }
    if (invoiceType === "company" && (!invoiceTitle.trim() || !/^\d{8}$/.test(taxId))) { toast.error("公司戶請填寫抬頭與 8 位統一編號"); return; }
    try {
      const result = await createOrder.mutateAsync({ recipientName, phone, email: user?.email || "", city: shippingMethod === "home_delivery" ? city : "", district: shippingMethod === "home_delivery" ? district : "", address: shippingMethod === "home_delivery" ? address : "", shippingMethod, paymentMethod: shippingMethod === "store_pickup" ? "pay_at_store" : "cash_on_delivery", invoiceType, invoiceTitle, taxId, items: cart });
      await saveProfile.mutateAsync({ recipientName, phone, city: shippingMethod === "home_delivery" ? city : "", district: shippingMethod === "home_delivery" ? district : "", address: shippingMethod === "home_delivery" ? address : "" }).catch(() => undefined);
      clearCart(); setLocation(`/orders/${result.orderNo}`); toast.success("訂單已送出");
    } catch (error) { toast.error(error instanceof Error ? error.message : "送出失敗，請再試一次"); }
  };
  return <main className="wrap inner-page"><PageTitle eyebrow="安全結帳" title="確認訂單" /><form onSubmit={submit} className="checkout-layout">
    <div className="checkout-left"><section className="card-surface checkout-section"><div className="section-title"><span className="number-dot">1</span><div><h2>收件資訊</h2><p>會員資料會安全保存於您的帳戶</p></div></div><div className="form-grid"><label>收件人姓名<input required minLength={2} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="請輸入姓名" /></label><label>聯絡電話<input required minLength={8} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx-xxx-xxx" /></label></div>
    </section><section className="card-surface checkout-section"><div className="section-title"><span className="number-dot">2</span><div><h2>配送方式</h2><p>依您的需求選擇安全便利的配送方式</p></div></div><div className="choice-grid"><label className={`choice-card ${shippingMethod === "home_delivery" ? "choice-selected" : ""}`}><input type="radio" checked={shippingMethod === "home_delivery"} onChange={() => setShippingMethod("home_delivery")} /><Truck size={21} /><span><b>宅配到府</b><small>貨到付款・滿 NT$1,200 免運</small></span></label><label className={`choice-card ${shippingMethod === "store_pickup" ? "choice-selected" : ""}`}><input type="radio" checked={shippingMethod === "store_pickup"} onChange={() => setShippingMethod("store_pickup")} /><Store size={21} /><span><b>高雄門市取貨</b><small>門市付款・免運費</small></span></label></div>{shippingMethod === "home_delivery" && <div className="form-grid address-grid"><label>縣市<input required value={city} onChange={(e) => setCity(e.target.value)} /></label><label>行政區<input required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="例：三民區" /></label><label className="address-field">收件地址<input required minLength={5} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="路段、巷弄、門牌與樓層" /></label></div>}</section>
    <section className="card-surface checkout-section"><div className="section-title"><span className="number-dot">3</span><div><h2>付款方式</h2><p>本網站原型提供取貨付款方式，不會收集信用卡資料</p></div></div><div className="payment-note"><Check size={18} /><span><b>{shippingMethod === "store_pickup" ? "門市取貨付款" : "宅配貨到付款"}</b><small>{shippingMethod === "store_pickup" ? "商品到店後，於高雄門市付款取貨" : "收到商品時向物流人員付款"}</small></span></div></section>
    <section className="card-surface checkout-section"><div className="section-title"><span className="number-dot">4</span><div><h2>發票資訊</h2><p>此原型收集發票偏好，不會代替正式電子發票開立</p></div></div><div className="choice-grid"><label className={`choice-card ${invoiceType === "personal" ? "choice-selected" : ""}`}><input type="radio" checked={invoiceType === "personal"} onChange={() => setInvoiceType("personal")} /><BadgeCheck size={20} /><span><b>個人電子發票</b><small>依會員 Email 作為聯絡資訊</small></span></label><label className={`choice-card ${invoiceType === "company" ? "choice-selected" : ""}`}><input type="radio" checked={invoiceType === "company"} onChange={() => setInvoiceType("company")} /><Store size={20} /><span><b>公司戶統一編號</b><small>請填寫抬頭及 8 位統編</small></span></label></div>{invoiceType === "company" && <div className="form-grid invoice-grid"><label>發票抬頭<input required value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} placeholder="公司／機關名稱" /></label><label>統一編號<input required inputMode="numeric" maxLength={8} pattern="[0-9]{8}" value={taxId} onChange={(e) => setTaxId(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="8 位數字" /></label></div>}</section>
    </div><aside className="card-surface checkout-summary"><h2>訂單摘要</h2>{cart.map((item) => { const product = products.find((p) => p.id === item.productId); return product ? <div className="checkout-item" key={item.productId}><span>{product.name} × {item.quantity}</span><b>NT$ {formatMoney((product.tierPrice && item.quantity >= product.tierPrice.quantity ? product.tierPrice.unitPrice : product.price) * item.quantity)}</b></div> : null; })}<PriceBox quote={quote.data} loading={quote.isLoading} />{quote.error && <p className="inline-error">{quote.error.message}</p>}<button type="submit" className="green-button full-button" disabled={createOrder.isPending || quote.isLoading || Boolean(quote.error)}>{createOrder.isPending ? "正在送出…" : "確認報價並送出訂單"} <ArrowRight size={16} /></button><p className="terms-small">送出即表示您同意<Link href="/policy">購物說明與隱私權政策</Link>。藥品不於本網站線上販售；醫療器材須符合通訊交易法定條件。</p></aside>
  </form></main>;
}

function ProductPage({ productId, add }: { productId: string; add: (product: Product) => void }) {
  const product = products.find((item) => item.id === productId);
  const [, setLocation] = useLocation();
  if (!product) return <main className="wrap inner-page"><PageTitle eyebrow="商品內容" title="找不到這項商品" /><Link href="/" className="green-button">回首頁</Link></main>;
  const Icon = categoryIcons[product.category] || HeartPulse;
  return <main className="wrap inner-page"><div className="breadcrumbs"><Link href="/">首頁</Link><ChevronRight size={13} /><span>{product.categoryLabel}</span><ChevronRight size={13} /><span>{product.name}</span></div><div className="product-detail card-surface"><div className="detail-image">{product.image ? <img src={product.image} alt={product.imageAlt} /> : <span className={`product-illustration illustration-${product.category}`}><Icon size={76} /></span>}</div><div className="detail-copy"><span className="eyebrow">{product.categoryLabel}・好鄰嚴選</span><h1>{product.name}</h1><p className="detail-subtitle">{product.subtitle}</p>{product.inquiryOnly ? <div className="detail-inquiry">此類商品需先確認品項資格與使用情況，暫不提供線上下單。</div> : <div className="detail-price"><strong>NT$ {formatMoney(product.price)}</strong>{product.compareAt && <del>NT$ {formatMoney(product.compareAt)}</del>}</div>}<p className="detail-description">{product.description}</p><ul className="detail-highlights">{product.highlights.map((line) => <li key={line}><Check size={16} />{line}</li>)}</ul>{product.inquiryOnly ? <a className="green-button" href="tel:071234567"><Phone size={16} /> 聯絡藥師</a> : <button className="green-button" onClick={() => add(product)}><ShoppingCart size={17} /> 加入購物車</button>}{product.tierPrice && <small className="tier-note">購買 {product.tierPrice.quantity} 件起，每件 NT$ {formatMoney(product.tierPrice.unitPrice)}；運費滿 NT$1,200 免運</small>}</div></div><section className="legal-note"><ShieldCheck size={18} /><span>商品資訊以實際包裝標示為準；保健食品不得取代均衡飲食或醫療。<Link href="/policy">查看購物與法規說明</Link></span></section></main>;
}

function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const profile = trpc.member.profile.useQuery(undefined, { enabled: isAuthenticated });
  const ordersQuery = trpc.store.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  const saveProfile = trpc.member.saveProfile.useMutation();
  const [editing, setEditing] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("高雄市");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  useEffect(() => {
    if (profile.data) {
      setRecipientName(profile.data.recipientName || user?.name || "");
      setPhone(profile.data.phone || ""); setCity(profile.data.city || "高雄市");
      setDistrict(profile.data.district || ""); setAddress(profile.data.address || "");
    } else if (user?.name) setRecipientName(user.name);
  }, [profile.data, user?.name]);
  if (loading) return <main className="wrap inner-page"><div className="loading-card">正在載入會員資料…</div></main>;
  if (!isAuthenticated) return <main className="wrap inner-page"><PageTitle eyebrow="好鄰會員" title="會員專區" /><div className="login-card card-surface"><UserRound size={42} /><h2>登入會員，保存健康好鄰情</h2><p>使用 Manus 帳戶安全登入後，可管理收件資訊並查詢個人訂單。</p><button className="green-button" onClick={() => startLogin()}>會員登入 / 註冊 <ArrowRight size={16} /></button><small className="muted">本網站使用 Manus OAuth 帳戶驗證，不另行保存密碼。</small></div></main>;
  const save = async () => {
    try {
      await saveProfile.mutateAsync({ recipientName, phone, city, district, address });
      await profile.refetch(); setEditing(false); toast.success("會員資料已更新");
    } catch (error) { toast.error(error instanceof Error ? error.message : "資料更新失敗"); }
  };
  return <main className="wrap inner-page"><PageTitle eyebrow="好鄰會員" title={`您好，${user?.name || "好鄰會員"}`} /><div className="account-grid">
    <section className="card-surface account-card"><div className="account-title"><span className="member-avatar"><UserRound /></span><div><h2>會員資料</h2><p>{user?.email || "已驗證的會員帳戶"}</p></div></div>
      {editing ? <div className="profile-edit"><label>收件人姓名<input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /></label><label>聯絡電話<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label><div className="profile-edit-row"><label>縣市<input value={city} onChange={(e) => setCity(e.target.value)} /></label><label>行政區<input value={district} onChange={(e) => setDistrict(e.target.value)} /></label></div><label>地址<input value={address} onChange={(e) => setAddress(e.target.value)} /></label><div className="profile-edit-actions"><button className="green-button" onClick={() => void save()}>儲存資料</button><button className="outline-action" onClick={() => setEditing(false)}>取消</button></div></div> : <><div className="profile-display"><p><b>收件人</b>{profile.data?.recipientName || user?.name || "尚未設定"}</p><p><b>聯絡電話</b>{profile.data?.phone || "尚未設定"}</p><p><b>地址</b>{[profile.data?.city, profile.data?.district, profile.data?.address].filter(Boolean).join(" ") || "尚未設定"}</p></div><button className="outline-action" onClick={() => setEditing(true)}>{profile.data ? "編輯會員與收件資料" : "設定會員與收件資料"}</button></>}
      <button className="outline-action logout-button" onClick={async () => { await logout(); setLocation("/"); toast.success("已安全登出"); }}><LogOut size={15} /> 登出會員</button>
    </section>
    <section className="card-surface account-card"><div className="account-title"><PackageCheck size={25} /><div><h2>我的訂單</h2><p>僅顯示目前登入會員的訂單</p></div></div>{ordersQuery.isLoading ? <p className="muted">訂單載入中…</p> : ordersQuery.data?.length ? <div className="orders-list">{ordersQuery.data.map((order) => <button className="order-row" key={order.orderNo} onClick={() => setLocation(`/orders/${order.orderNo}`)}><span><b>{order.orderNo}</b><small>{new Date(order.createdAt).toLocaleDateString("zh-TW")}・{order.status === "pending" ? "待確認" : order.status}</small></span><strong>NT$ {formatMoney(order.total)}</strong><ChevronRight size={16} /></button>)}</div> : <div className="empty-orders"><ClipboardIcon /><span>目前還沒有訂單</span><Link href="/" className="text-link">開始選購</Link></div>}</section>
  </div></main>;
}
function ClipboardIcon() { return <BookOpen size={28} />; }

function OrderPage({ orderNo }: { orderNo: string }) {
  const order = trpc.store.getOrder.useQuery({ orderNo });
  if (order.isLoading) return <main className="wrap inner-page"><div className="loading-card">正在確認訂單…</div></main>;
  if (order.error || !order.data) return <main className="wrap inner-page"><PageTitle eyebrow="訂單查詢" title="找不到此訂單" /><p className="muted">請確認已登入建立該訂單的會員帳戶。</p><Link href="/account" className="green-button">會員中心</Link></main>;
  const lineItems = JSON.parse(order.data.itemsJson) as { productId: string; name: string; quantity: number; lineTotal: number }[];
  return <main className="wrap inner-page"><div className="order-success card-surface"><span className="success-mark"><Check size={34} /></span><span className="eyebrow">ORDER RECEIVED</span><h1>訂單已成功送出</h1><p>感謝您選擇好鄰健康藥局，我們已收到您的預訂資料。</p><div className="order-number"><small>訂單編號</small><b>{order.data.orderNo}</b><span>狀態：{order.data.status === "pending" ? "待門市確認" : order.data.status}</span></div><div className="order-receipt">{lineItems.map((item) => <div key={item.productId}><span>{item.name} × {item.quantity}</span><b>NT$ {formatMoney(item.lineTotal)}</b></div>)}<div><span>運費</span><b>{order.data.shippingFee ? `NT$ ${formatMoney(order.data.shippingFee)}` : "免費"}</b></div><div className="receipt-total"><span>訂單總額</span><strong>NT$ {formatMoney(order.data.total)}</strong></div></div><p className="muted">{order.data.shippingMethod === "store_pickup" ? "請於門市營業時間內聯絡門市確認取貨時間，取貨時付款。" : "宅配訂單採貨到付款，請留意物流聯絡。"}</p><p className="muted">發票類型：{order.data.invoiceType === "company" ? `公司戶・${order.data.invoiceTitle || ""}（${order.data.taxId || ""}）` : "個人電子發票（待正式系統串接）"}</p><div className="order-actions"><Link href="/account" className="outline-action">查看會員訂單</Link><Link href="/" className="green-button">繼續逛逛</Link></div></div></main>;
}

function PolicyPage() {
  return <main className="wrap inner-page"><PageTitle eyebrow="好鄰健康藥局" title="購物須知與健康資訊" /><div className="policy-layout"><aside className="policy-nav card-surface"><a href="#shopping">購物與配送</a><a href="#returns">退換貨說明</a><a href="#privacy">隱私權政策</a><a href="#compliance">網路交易與法規</a><a href="#health">健康知識館</a><a href="#consult">藥師諮詢</a></aside><div className="policy-content card-surface">
    <section id="shopping"><h2>購物與配送</h2><p>本網站僅提供一般商品的線上選購與訂單預約。滿 NT$1,200 宅配免運；未達門檻宅配運費 NT$80；高雄門市取貨免運並於門市付款。商品與訂單價格以結帳前的即時報價及最後確認頁為準。</p></section>
    <section id="returns"><h2>退換貨說明</h2><p>如商品有瑕疵、寄送錯誤或需辦理退換貨，請保留完整包裝與購買憑證，並於收貨後儘速聯絡門市。實際退換貨方式、期限及例外事項將依商品性質、消費者保護相關規定與正式公告辦理；食品、個人衛生用品等已拆封商品，可能依法或依商品性質適用不同條件。</p><a href="tel:071234567" className="text-link">聯絡客服：07-123-4567</a></section>
    <section id="privacy"><h2>隱私權政策</h2><p>登入採 Manus OAuth 驗證，本網站不收集或保存會員密碼。訂單所需的姓名、電話、配送地址及 Email 用於會員服務、配送聯繫與訂單查詢；會員僅可查看自己的訂單。此示範網站不處理信用卡資料，也不串接正式金流或電子發票服務。</p><p>正式營運前，業者應依實際資料處理方式補齊蒐集目的、利用期間與對象、當事人權利及聯絡窗口等完整告知事項。</p></section>
    <section id="compliance"><h2>藥局電商交易提醒</h2><div className="compliance-callout"><ShieldCheck /><p><b>藥品不作為本網站的一般線上商品販售。</b>需要藥品或用藥指示時，請親洽藥師、持處方箋至合法藥局，或循醫療管道處理。</p></div><p>醫療器材依食藥署「通訊交易通路販售醫療器材之品項及應遵行事項」辦理；只有確認屬可通訊交易品項且販售者具備法定資格時，才可開放線上販售，並須揭露商品許可或登錄資料、業者資訊及法定警語。本網站未經個別核實的醫材一律採藥師諮詢，不提供線上下單。</p><p>食品與保健食品不宣稱醫療效能；健康食品功效僅依核准內容及範圍說明。商品標示與使用方式以實際包裝為準。</p><p className="launch-note"><b>正式營運前請完成業者資料核實：</b>請藥局經營者確認並填入實際藥局／藥商名稱、地址、藥商或醫材商許可執照字號、藥師諮詢專線，以及各商品實際許可證或登錄資料。本展示資料中的門市電話與地址為視覺稿示例，不能替代正式營業資訊。</p><div className="source-links"><b>主管機關資料</b><a href="https://www.fda.gov.tw/tc/newsContent.aspx?cid=4&id=t622653" target="_blank" rel="noreferrer">食藥署：網路平台違規販售藥品之管理作為 <ArrowRight size={13} /></a><a href="https://www.fda.gov.tw/tc/siteContent.aspx?sid=11680" target="_blank" rel="noreferrer">食藥署：醫材商（藥局）通訊交易通路販售醫療器材資訊專區 <ArrowRight size={13} /></a><a href="https://www.fda.gov.tw/TC/csmnewsContent.aspx?id=t623612&mid=267" target="_blank" rel="noreferrer">食藥署：食品廣告不得宣稱誇大不實、易生誤解或醫療效能 <ArrowRight size={13} /></a></div></section>
    <section id="health"><h2>夏季健康飲食指南</h2><div className="health-article"><img src="/images/health-salad.jpg" alt="蔬菜沙拉與均衡飲食" /><p>日常飲食可留意食物多樣性、補充蔬菜水果與足量飲水。每個人的需求會因年齡、健康狀況與用藥而不同；若有特殊飲食需求或身體不適，請洽詢醫療人員。健康知識僅供一般參考，不取代診斷或治療。</p></div></section>
    <section id="consult"><h2>藥師諮詢與門市聯絡</h2><div className="consult-card"><img src="/images/pharmacist-icon.jpg" alt="藥師諮詢" /><div><b>好鄰健康藥局・高雄門市</b><p>高雄市熱河街 123 號<br />每日 08:30－22:00</p><a href="tel:071234567" className="green-button"><Phone size={15} /> 07-123-4567</a></div></div></section>
  </div></div></main>;
}

export default function App() {
  const [location] = useLocation();
  const [cart, setCart] = useState<CartEntry[]>(readCart);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategoryId | "all">("all");
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  const add = (product: Product) => {
    if (product.inquiryOnly || product.price <= 0) { toast.info("此品項請先聯絡藥師"); return; }
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item);
      return [...current, { productId: product.id, quantity: 1 }];
    });
    toast.success(`${product.name}已加入購物車`);
  };
  const update = (id: string, quantity: number) => setCart((current) => quantity < 1 ? current.filter((item) => item.productId !== id) : current.map((item) => item.productId === id ? { ...item, quantity: Math.min(99, quantity) } : item));
  const remove = (id: string) => setCart((current) => current.filter((item) => item.productId !== id));
  const clearCart = () => setCart([]);
  const onSearch = () => { if (location !== "/") window.location.href = `/?q=${encodeURIComponent(query)}`; else document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" }); };
  const urlQuery = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("q") : null;
  useEffect(() => { if (urlQuery) setQuery(urlQuery); }, [urlQuery]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  let content;
  if (location === "/") content = <HomePage add={add} query={query} setCategory={setActiveCategory} />;
  else if (location === "/cart") content = <CartPage cart={cart} update={update} remove={remove} />;
  else if (location === "/checkout") content = <CheckoutPage cart={cart} clearCart={clearCart} />;
  else if (location === "/account") content = <AccountPage />;
  else if (location === "/policy") content = <PolicyPage />;
  else if (location.startsWith("/orders/")) content = <OrderPage orderNo={decodeURIComponent(location.slice("/orders/".length))} />;
  else if (location.startsWith("/products/")) content = <ProductPage productId={decodeURIComponent(location.slice("/products/".length))} add={add} />;
  else content = <main className="wrap inner-page"><PageTitle eyebrow="好鄰健康藥局" title="找不到這個頁面" /><Link href="/" className="green-button">返回首頁</Link></main>;
  return <div className="app-shell"><Header count={count} query={query} setQuery={setQuery} onSearch={onSearch} />{content}<Footer /><a className="back-to-top" href="#top" aria-label="回到頁面頂端">⌃</a></div>;
}
