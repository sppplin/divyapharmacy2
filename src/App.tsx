import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Heart, 
  User, 
  ShoppingBag, 
  Menu, 
  X, 
  ArrowRight, 
  Send,
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  MessageSquare,
  Star,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
  Twitter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { PRODUCTS } from './data/products';
import { TRUSTED_TALES, INFO_PAGES, INGREDIENTS, MOCK_REVIEWS } from './constants';
import { Product, CartItem } from './types';

// --- Components ---

const AnnouncementBar = () => (
  <div className="bg-[#0f2419] text-white text-center py-2 px-4 text-xs sm:text-sm tracking-wider font-light border-b border-black/40">
    Free shipping on orders above ₹399 | Genuine AYUSH-Certified Products | <a href="#shop" className="text-gold-light hover:underline font-normal">Shop Now →</a>
  </div>
);

const UtilityBar = () => (
  <div className="hidden md:flex bg-[#1a3a2a] px-10 py-1.5 items-center justify-between text-[10px] text-white/75 tracking-wider border-b border-black/30">
    <div className="flex items-center gap-5">
      <span>Mon–Sat 9am–6pm IST</span>
      <span>+91-1800-XXX-XXXX</span>
    </div>
    <div className="flex items-center gap-5">
      <a href="#" className="hover:text-white transition-colors">Track Order</a>
      <a href="#" className="hover:text-white transition-colors">Store Locator</a>
      <a href="#" className="hover:text-white transition-colors">Help</a>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<{ type: 'home' | 'product' | 'info'; id?: string }>({ type: 'home' });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('divya_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('divya_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [selectedSize, setSelectedSize] = useState('200g');
  const [pincode, setPincode] = useState('');
  const [isWellnessPopupOpen, setIsWellnessPopupOpen] = useState(false);
  const talesScrollRef = useRef<HTMLDivElement>(null);

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const heroBanners = [
    {
      desktop: 'https://static.wixstatic.com/media/7fa905_d81e4b0ccfdf4a549770256de087229a~mv2.png',
      mobile: 'https://static.wixstatic.com/media/7fa905_6b4b2a8dceaf456ea6202a781b46b696~mv2.png'
    },
    {
      desktop: 'https://static.wixstatic.com/media/7fa905_86e2dbb47ab84177868a9c28269620c7~mv2.png',
      mobile: 'https://static.wixstatic.com/media/7fa905_6d7d59dcdb234377827fb0d22cb061f0~mv2.png'
    },
    {
      desktop: 'https://static.wixstatic.com/media/7fa905_afd984aef76543ffb6941211ce32c673~mv2.png',
      mobile: 'https://static.wixstatic.com/media/7fa905_6b4b2a8dceaf456ea6202a781b46b696~mv2.png'
    }
  ];

  const nextHeroSlide = () => {
    setSlideDirection(1);
    setCurrentHeroSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const prevHeroSlide = () => {
    setSlideDirection(-1);
    setCurrentHeroSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  useEffect(() => {
    // Preload first hero banner
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroBanners[0].desktop;
    document.head.appendChild(link);

    const timer = setInterval(nextHeroSlide, 6000);

    // Wellness Popup logic
    const hasSeenPopup = localStorage.getItem('divya_wellness_popup_seen');
    if (!hasSeenPopup) {
      const popupTimer = setTimeout(() => {
        setIsWellnessPopupOpen(true);
      }, 3000);
      return () => {
        clearInterval(timer);
        clearTimeout(popupTimer);
        document.head.removeChild(link);
      };
    }

    return () => {
      clearInterval(timer);
      document.head.removeChild(link);
    };
  }, []);

  const scrollTales = (direction: 'left' | 'right') => {
    if (talesScrollRef.current) {
      const scrollAmount = 324; // Card width (300) + gap (24)
      const { scrollLeft } = talesScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      talesScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    localStorage.setItem('divya_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('divya_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product: Product, variantIdx = 0, qty = 1) => {
    const variant = product.variants[variantIdx];
    const key = `${product.handle}-${variantIdx}`;
    setCart(prev => {
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item => item.key === key ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, {
        key,
        handle: product.handle,
        title: product.title,
        image: product.image,
        vendor: product.vendor,
        option: variant.option,
        price: variant.price,
        qty
      }];
    });
    showToast(`Added to cart: ${product.title}`);
  };

  const toggleWishlist = (handle: string) => {
    setWishlist(prev => {
      if (prev.includes(handle)) {
        showToast('Removed from wishlist');
        return prev.filter(h => h !== handle);
      }
      showToast('Added to wishlist');
      return [...prev, handle];
    });
  };

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.tags.toLowerCase().includes(q) || 
        p.vendor.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'all') {
      const cat = activeCategory.toLowerCase();
      result = result.filter(p => {
        const type = p.type.toLowerCase();
        const tags = p.tags.toLowerCase();
        
        // Custom mapping for UI categories to data
        if (cat === 'heart' || cat === 'cardiac' || cat === 'bp care') {
          return type === 'heart' || tags.includes('heart') || tags.includes('blood pressure') || tags.includes('cardiac');
        }
        if (cat === 'immunity') {
          return tags.includes('immunity') || tags.includes('immune');
        }
        if (cat === 'digestion') {
          return tags.includes('digestion') || tags.includes('digestive') || tags.includes('stomach');
        }
        if (cat === 'joints' || cat === 'pain relief') {
          return tags.includes('pain') || tags.includes('relief') || tags.includes('joint') || tags.includes('joints');
        }
        if (cat === 'skin') {
          return tags.includes('skin') || tags.includes('dermatology');
        }
        if (cat === 'respiratory') {
          return tags.includes('respiratory') || tags.includes('cough') || tags.includes('breathing') || type === 'liquid' || type === 'tablet';
        }
        if (cat === 'rituals' || cat === 'pooja') {
          return tags.includes('ritual') || tags.includes('pooja') || tags.includes('havan') || type === 'rituals' || type === 'ghee';
        }
        
        return type === cat || tags.includes(cat);
      });
    }
    return result;
  }, [searchQuery, activeCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);

  const navigateTo = (type: 'home' | 'product' | 'info', id?: string, sectionId?: string) => {
    setView({ type, id });
    setIsMobileNavOpen(false);
    
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const currentProduct = view.type === 'product' ? PRODUCTS.find(p => p.handle === view.id) : null;
  const currentInfoPage = view.type === 'info' ? INFO_PAGES[view.id as keyof typeof INFO_PAGES] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <UtilityBar />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-green-mid border-b-0 sm:border-b-2 border-black/20 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 h-[70px] flex items-center justify-between">
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu size={24} />
          </button>

          <a href="/" className="flex flex-col text-white" onClick={(e) => { e.preventDefault(); navigateTo('home'); setActiveCategory('all'); setSearchQuery(''); }}>
            <span className="font-serif text-xl sm:text-2xl tracking-widest leading-none">Divya Ayurveda</span>
            <span className="hidden sm:block text-[8px] sm:text-[9px] tracking-[4px] text-gold-light uppercase font-light mt-1">Ancient Wisdom • Modern Wellness</span>
          </a>

          <div className="hidden md:block flex-1 max-w-sm mx-10 relative">
            <input 
              type="text" 
              placeholder="Search herbs, formulas..." 
              className="w-full py-2 pl-4 pr-10 bg-white/10 border border-white/25 rounded text-white text-sm placeholder:text-white/50 focus:bg-white/20 focus:border-white/45 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="flex flex-col items-center text-white/85 hover:text-white transition-colors" onClick={() => setIsWishlistOpen(true)}>
              <Heart size={22} strokeWidth={1.5} />
              <span className="hidden sm:block text-[10px] mt-1">Wishlist</span>
            </button>
            <button className="flex flex-col items-center text-white/85 hover:text-white transition-colors" onClick={() => setIsAuthOpen(true)}>
              <User size={22} strokeWidth={1.5} />
              <span className="hidden sm:block text-[10px] mt-1">{user ? 'Account' : 'Login'}</span>
            </button>
            <button className="relative flex flex-col items-center text-white/85 hover:text-white transition-colors" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className="hidden sm:block text-[10px] mt-1">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:block bg-green-light border-b-3 border-gold">
          <div className="max-w-[1400px] mx-auto px-10 flex justify-center">
            {['Home', 'Shop All', 'Diabetes', 'Heart', 'Brain', 'Joints', 'Rituals'].map((item) => (
              <button 
                key={item}
                className="px-5 py-3 text-xs uppercase tracking-widest text-white/90 hover:text-white transition-colors"
                onClick={() => {
                  if (item === 'Home') { navigateTo('home'); setActiveCategory('all'); setSearchQuery(''); }
                  else if (item === 'Shop All') { setActiveCategory('all'); navigateTo('home', undefined, 'shop'); }
                  else { setActiveCategory(item); navigateTo('home', undefined, 'shop'); }
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {view.type === 'home' && (
          <>
            {/* Hero Section */}
            <section className="relative h-[400px] sm:h-[500px] lg:h-[800px] bg-green-dark overflow-hidden group/hero">
              <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                <motion.div
                  key={currentHeroSlide}
                  initial={{ x: slideDirection > 0 ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: slideDirection > 0 ? '-100%' : '100%' }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  {/* Desktop Banner */}
                  <div 
                    className="hidden sm:block absolute inset-0 bg-cover bg-no-repeat bg-center"
                    style={{ backgroundImage: `url(${heroBanners[currentHeroSlide].desktop})` }}
                  ></div>
                  {/* Mobile Banner */}
                  <div 
                    className="sm:hidden absolute inset-0 bg-contain bg-no-repeat bg-top"
                    style={{ backgroundImage: `url(${heroBanners[currentHeroSlide].mobile})` }}
                  ></div>
                </motion.div>
              </AnimatePresence>
              
              <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 h-full flex items-end justify-center sm:justify-start pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="pb-12 w-full sm:w-auto pointer-events-auto"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start">
                    <button 
                      className="w-full sm:w-auto bg-gold hover:bg-gold-light text-white px-10 py-4 text-xs tracking-widest uppercase font-bold transition-all shadow-xl"
                      onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Shop All Products
                    </button>
                    <button 
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-green-dark px-10 py-4 text-xs tracking-widest uppercase font-bold transition-all shadow-xl border border-gray-100"
                      onClick={() => navigateTo('info', 'our-story')}
                    >
                      Our Story
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Navigation Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-10 pointer-events-none">
                <button 
                  onClick={prevHeroSlide}
                  className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 border border-green-dark/20 bg-white/50 backdrop-blur-sm flex items-center justify-center text-green-dark hover:bg-white transition-all group opacity-0 group-hover/hero:opacity-100"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button 
                  onClick={nextHeroSlide}
                  className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 border border-green-dark/20 bg-white/50 backdrop-blur-sm flex items-center justify-center text-green-dark hover:bg-white transition-all group opacity-0 group-hover/hero:opacity-100"
                >
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSlideDirection(i > currentHeroSlide ? 1 : -1);
                      setCurrentHeroSlide(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${currentHeroSlide === i ? 'bg-gold w-6' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </section>

            {/* Benefits Strip */}
            <div className="bg-green-pale py-4 px-6 sm:px-10 overflow-hidden">
              <div className="max-w-[1400px] mx-auto flex flex-nowrap overflow-x-auto no-scrollbar justify-start sm:justify-around gap-8 sm:gap-4 text-[10px] sm:text-sm text-green-dark font-medium whitespace-nowrap">
                {[
                  { icon: CheckCircle2, text: "GMP Certified Manufacturing" },
                  { icon: ShieldCheck, text: "100% Secure Checkout" },
                  { icon: RefreshCw, text: "Easy Returns Within 7 Days" },
                  { icon: Truck, text: "Free Shipping Above ₹399" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <item.icon size={16} className="text-green-light sm:w-[18px] sm:h-[18px]" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-16 px-4 sm:px-10 bg-cream"
            >
              <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] tracking-[3px] uppercase text-green-light font-bold mb-3 block">Browse By</span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-green-dark font-normal">Health Concerns</h2>
                  <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { name: 'Immunity', image: 'https://krishnaayurved.com/cdn/shop/collections/Category_banner-01.jpg?v=1754030903&width=450' },
                    { name: 'Digestion', image: 'https://static.wixstatic.com/media/7fa905_e3cd3b37178a40f28c6a44d08bfaf77b~mv2.jpg' },
                    { name: 'Joints', image: 'https://nutraceuticalbusinessreview.com/article-image-alias/bone-and-joint-health-ingredients-for.jpg' },
                    { name: 'Heart', image: 'https://static.wixstatic.com/media/7fa905_9b73fa7de1e44db7b9d121b5e9f6f110~mv2.jpg' },
                    { name: 'Skin', image: 'https://krishnaayurved.com/cdn/shop/collections/Category_banner-05.jpg?v=1754030368&width=450' },
                    { name: 'Respiratory', image: 'https://www.cornerstoneuc.com/wp-content/uploads/sites/522/2024/03/Asthma-Patient.jpg' },
                    { name: 'Diabetes', image: 'https://static.wixstatic.com/media/7fa905_7cb8ed2806a74428bbd4f10200968bee~mv2.jpg' },
                    { name: 'Rituals', image: 'https://freshmills.in/cdn/shop/files/golden-champa-agarbatti-913650.png?v=1717361821&width=1214' }
                  ].map((cat, i) => (
                    <button 
                      key={i}
                      className="bg-white border border-gray-200 p-4 text-center hover:border-green-dark hover:shadow-md transition-all group rounded-xl"
                      onClick={() => {
                        setActiveCategory(cat.name);
                        const element = document.getElementById('shop');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-green-pale group-hover:border-green-mid transition-all duration-300">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <h3 className="font-serif text-[11px] sm:text-xs font-bold text-green-dark uppercase tracking-wider">{cat.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Iconic Bestsellers */}
            <motion.section 
              id="shop" 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-16 px-1 sm:px-10 bg-cream"
            >
              <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] tracking-[3px] uppercase text-green-light font-bold mb-3 block">Our Collection</span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-green-dark font-normal">
                    {activeCategory === 'all' ? 'Iconic Bestsellers' : `${activeCategory} Care`}
                  </h2>
                  {activeCategory !== 'all' && (
                    <button 
                      onClick={() => setActiveCategory('all')}
                      className="mt-4 text-xs font-bold uppercase tracking-widest text-gold hover:text-green-dark transition-colors"
                    >
                      View All Products
                    </button>
                  )}
                  <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, idx) => (
                      <motion.div 
                        key={product.handle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="group bg-white border border-gray-100 hover:border-green-light hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => navigateTo('product', product.handle)}
                      >
                        <div className="relative aspect-square overflow-hidden bg-cream">
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {parseFloat(product.compare_price) > parseFloat(product.price) && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-1">
                              Save {Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_price)) * 100)}%
                            </span>
                          )}
                          <button 
                            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.handle); }}
                          >
                            <Heart size={18} fill={wishlist.includes(product.handle) ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="p-2 sm:p-6">
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">{product.vendor}</span>
                          <h3 className="font-serif text-base sm:text-lg font-semibold text-green-dark mb-2 line-clamp-1">{product.title}</h3>
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-gold text-gold" />)}
                            <span className="text-[10px] text-gray-400 ml-1">(4.8)</span>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg font-bold text-green-dark">₹{product.price}</span>
                            {parseFloat(product.compare_price) > parseFloat(product.price) && (
                              <span className="text-sm text-gray-400 line-through">₹{product.compare_price}</span>
                            )}
                          </div>
                          <button 
                            className="w-full bg-green-dark hover:bg-green-mid text-white py-3 text-[10px] tracking-[2px] uppercase font-bold transition-colors"
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="font-serif text-xl text-gray-400">No products found for this concern.</p>
                      <button 
                        onClick={() => setActiveCategory('all')}
                        className="mt-4 text-xs font-bold uppercase tracking-widest text-gold hover:text-green-dark transition-colors"
                      >
                        Browse All Products
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Our Story / Philosophy */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-20 px-6 sm:px-10 bg-green-dark text-white overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center opacity-10"></div>
              <div className="max-w-[1400px] mx-auto relative grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-gold tracking-[4px] uppercase text-xs font-bold mb-4 block">Our Story</span>
                  <h2 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight">A Legacy of <br /> Healing Wisdom</h2>
                  <p className="text-white/70 text-lg leading-relaxed mb-8">
                    Divya Ayurveda was born from a simple yet profound vision: to bring the transformative power of ancient Ayurveda to the modern world. We believe that true beauty and wellness are reflections of inner balance.
                  </p>
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="font-serif text-2xl text-gold mb-2">20+ Years</h4>
                      <p className="text-xs text-white/50 uppercase tracking-widest">Of Excellence</p>
                    </div>
                    <div>
                      <h4 className="font-serif text-2xl text-gold mb-2">100% Pure</h4>
                      <p className="text-xs text-white/50 uppercase tracking-widest">Natural Herbs</p>
                    </div>
                  </div>
                  <button 
                    className="bg-gold hover:bg-gold-light text-white px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all"
                    onClick={() => navigateTo('info', 'our-story')}
                  >
                    Read Our Story
                  </button>
                </div>
                <div className="relative">
                  <div className="aspect-[4/5] bg-cream/10 rounded-sm overflow-hidden border border-white/10">
                    <img src="https://static.wixstatic.com/media/7fa905_fccfbac0d10c4c52b5254baadcd8ae85~mv2.jpg" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-8 -left-8 bg-gold p-8 max-w-[240px] hidden sm:block">
                    <h3 className="font-serif text-xl mb-2">Our Philosophy</h3>
                    <p className="text-xs text-white/80 leading-relaxed">We follow the 'Sattvic' approach—purity in thought, ingredient, and process.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Rituals Section */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-16 px-4 sm:px-10 bg-[#fdfaf5]"
            >
              <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-12">
                  <span className="text-gold tracking-[4px] uppercase text-[10px] font-bold mb-3 block">Sacred Offerings</span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-green-dark mb-4">Rituals Rooted in Tradition, <br className="hidden sm:block" /> Made with Purity</h2>
                  <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 justify-center">
                  {PRODUCTS.filter(p => p.vendor === 'Aastha' || p.tags.includes('ritual') || p.tags.includes('pooja')).map((product, idx) => (
                    <motion.div 
                      key={product.handle}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group bg-white border border-gray-100 hover:border-gold hover:shadow-xl transition-all duration-300 cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => navigateTo('product', product.handle)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#f9f9f9]">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          loading="lazy"
                          className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                        />
                        <button 
                          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors"
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.handle); }}
                        >
                          <Heart size={16} fill={wishlist.includes(product.handle) ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="p-4 text-center">
                        <span className="text-[9px] text-gold uppercase tracking-widest mb-1 block font-bold">{product.vendor}</span>
                        <h3 className="font-serif text-sm sm:text-base font-semibold text-green-dark mb-2 line-clamp-1">{product.title}</h3>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="text-base font-bold text-green-dark">₹{product.price}</span>
                          {parseFloat(product.compare_price) > parseFloat(product.price) && (
                            <span className="text-xs text-gray-400 line-through">₹{product.compare_price}</span>
                          )}
                        </div>
                        <button 
                          className="w-full border border-green-dark text-green-dark hover:bg-green-dark hover:text-white py-2 text-[10px] tracking-[2px] uppercase font-bold transition-all"
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Trusted Tales - Shop by Reel */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-16 px-6 sm:px-10 bg-white overflow-hidden"
            >
              <div className="max-w-[1400px] mx-auto relative group/carousel">
                <div className="mb-10">
                  <span className="text-gold tracking-[4px] uppercase text-[10px] font-bold mb-2 block">Community</span>
                  <h2 className="font-serif text-3xl text-green-dark uppercase tracking-widest mb-2">Trusted Tales</h2>
                  <p className="text-sm text-gray-500 max-w-2xl">Experience Ayurveda, share your story. Be part of the #DivyaTribe—tag @divyaayurveda to get featured and inspire others on their wellness journey.</p>
                </div>
                
                {/* Side Arrows */}
                <button 
                  onClick={() => scrollTales('left')}
                  className="absolute left-4 top-[60%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-green-dark hover:bg-green-dark hover:text-white transition-all shadow-sm opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
                >
                  <ChevronLeft size={18} strokeWidth={1} />
                </button>
                <button 
                  onClick={() => scrollTales('right')}
                  className="absolute right-4 top-[60%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-green-dark hover:bg-green-dark hover:text-white transition-all shadow-sm opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
                >
                  <ChevronRight size={18} strokeWidth={1} />
                </button>

                <div 
                  ref={talesScrollRef}
                  className="flex gap-6 overflow-x-hidden pb-8 snap-x no-scrollbar scroll-smooth"
                >
                  {TRUSTED_TALES.map((tale) => (
                    <div key={tale.id} className="min-w-[260px] sm:min-w-[300px] snap-start group bg-white shadow-md hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden border border-gray-100">
                      <div className="relative aspect-[9/16] overflow-hidden">
                        <img src={tale.videoUrl} alt={tale.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        
                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                          <div className="flex gap-4">
                            <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                              <Heart size={18} />
                              <span className="text-[10px]">2.4k</span>
                            </button>
                            <button className="hover:text-gold transition-colors flex items-center gap-1">
                              <Send size={18} />
                              <span className="text-[10px]">Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-white flex gap-4 items-start">
                        <div className="relative">
                          <img src={tale.productIcon} className="w-12 h-12 rounded-lg border border-gray-100 object-cover shadow-sm" />
                          <div className="absolute -bottom-1 -right-1 bg-gold text-white p-1 rounded-full">
                            <Plus size={8} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-green-dark line-clamp-1 mb-1">{tale.title}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">{tale.desc}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-green-dark">{tale.price}</span>
                            <button className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-gold-light transition-colors">Shop Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Video Background Section */}
            <section className="relative h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="https://video.wixstatic.com/video/7fa905_bba61bd3dcb344ba83743232824c277c/1080p/mp4/file.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 text-center px-6 max-w-4xl">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-white tracking-[4px] uppercase text-[10px] sm:text-xs font-bold mb-4 block"
                >
                  Nourished by Nature
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-3xl sm:text-5xl text-white mb-6"
                >
                  Inspired by Ayurveda
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 text-sm sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  We combine the wisdom of Ayurveda with pure, natural ingredients to craft health & beauty products that nurture you—inside & out.
                </motion.p>
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-green-dark px-8 py-4 rounded-full text-[10px] sm:text-xs tracking-[2px] uppercase font-bold hover:bg-gold hover:text-white transition-all shadow-xl"
                >
                  Discover Our Bestsellers
                </motion.button>
              </div>
            </section>

            {/* Latest Reads */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-16 px-4 sm:px-10 bg-white"
            >
              <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] tracking-[3px] uppercase text-green-light font-bold mb-3 block">The Journal</span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-green-dark font-normal">Latest Reads</h2>
                  <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { title: "Understanding Your Dosha", category: "Ayurveda 101", image: "https://static.wixstatic.com/media/7fa905_e40eaf3ffd7a4730816e2c7e30ea2ea0~mv2.jpg" },
                    { title: "The Power of Ashwagandha", category: "Herb Spotlight", image: "https://static.wixstatic.com/media/7fa905_ed2e76c525384cc88086930d77581bdb~mv2.jpg" },
                    { title: "Morning Ritual with Copper", category: "Wellness", image: "https://static.wixstatic.com/media/7fa905_49a05952f08e4f1696009848f76046e7~mv2.jpg" }
                  ].map((post, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="aspect-[16/10] overflow-hidden mb-4 rounded-sm">
                        <img src={post.image} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2 block">{post.category}</span>
                      <h3 className="font-serif text-xl text-green-dark group-hover:text-gold transition-colors mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">Discover the ancient secrets to a balanced life and holistic well-being...</p>
                      <button className="text-xs font-bold uppercase tracking-widest text-green-dark flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read More <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Testimonials */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="py-16 px-6 sm:px-10 bg-cream-dark"
            >
              <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl sm:text-4xl text-green-dark font-normal">Trusted by Thousands</h2>
                  <div className="w-12 h-0.5 bg-gold mx-auto mt-4"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { name: "Ramesh Gupta", city: "Lucknow", text: "My HbA1c came down from 9.2 to 6.8 in three months with consistent use. This is genuinely remarkable." },
                    { name: "Sunita Sharma", city: "Delhi", text: "My blood pressure has been under control for over six months. Mukta Vati has completely changed my perspective." },
                    { name: "Vikram Patel", city: "Ahmedabad", text: "The Ashwagandha Churna is pure quality. My gym recovery is faster and my sleep has improved tremendously." }
                  ].map((t, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="bg-white p-8 border-l-4 border-green-light shadow-sm"
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
                      </div>
                      <p className="font-serif italic text-gray-700 leading-relaxed mb-6">"{t.text}"</p>
                      <div className="text-xs font-bold uppercase tracking-wider text-green-dark">{t.name}, {t.city}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Newsletter */}
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="bg-green-mid py-16 px-6 text-center"
            >
              <h2 className="font-serif text-3xl text-white mb-4">Ayurvedic Wisdom, Delivered</h2>
              <p className="text-white/70 mb-8">Subscribe for seasonal health tips and exclusive offers.</p>
              <div className="max-w-md mx-auto flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none"
                />
                <button className="bg-gold hover:bg-gold-light text-white px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors">
                  Subscribe
                </button>
              </div>
            </motion.section>
          </>
        )}

        {view.type === 'product' && currentProduct && (
          <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100">
              <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-4 flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-gray-400">
                <button onClick={() => navigateTo('home')} className="hover:text-green-dark transition-colors">Home</button>
                <ChevronRight size={10} />
                <span className="text-green-dark font-bold">{currentProduct.title}</span>
              </div>
            </div>
            
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-12">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left: Images */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="relative aspect-square bg-[#f9f9f9] overflow-hidden group">
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.title} 
                      loading="lazy"
                      className="w-full h-full object-contain p-8"
                    />
                    <button 
                      className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-all"
                      onClick={() => toggleWishlist(currentProduct.handle)}
                    >
                      <Heart size={20} fill={wishlist.includes(currentProduct.handle) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {currentProduct.images.map((img, i) => (
                      <div key={i} className="w-24 h-24 flex-shrink-0 bg-[#f9f9f9] border border-gray-100 cursor-pointer hover:border-gold transition-all p-2">
                        <img src={img} loading="lazy" className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Disclaimer: The image is for representation purposes only. The packaging you receive might vary.</p>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-5">
                  <div className="mb-8">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[3px] mb-2 block">Home &gt; {currentProduct.title}</span>
                    <h1 className="font-serif text-4xl text-green-dark mb-4 leading-tight">{currentProduct.title}</h1>
                    
                    <div className="mb-6">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Size :</span>
                      <div className="flex gap-3">
                        {['100g', '200g'].map(size => (
                          <button 
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-6 py-2 text-xs font-bold border transition-all ${selectedSize === size ? 'bg-green-dark text-white border-green-dark' : 'bg-white text-gray-400 border-gray-200 hover:border-green-dark'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">(50)</span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full mx-1"></div>
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <MessageSquare size={12} /> 2 Questions \ 2 Answers
                      </span>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-2xl font-bold text-green-dark">₹{currentProduct.price}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">(MRP INCLUSIVE OF ALL TAXES)</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                      <div className="flex items-center border border-gray-200 h-12">
                        <button className="px-4 h-full hover:bg-gray-50 text-gray-400"><Minus size={14} /></button>
                        <span className="w-10 text-center font-bold text-sm">1</span>
                        <button className="px-4 h-full hover:bg-gray-50 text-gray-400"><Plus size={14} /></button>
                      </div>
                      <button 
                        className="flex-grow bg-white border border-green-dark text-green-dark hover:bg-green-dark hover:text-white h-12 text-[11px] font-bold uppercase tracking-[2px] transition-all"
                        onClick={() => addToCart(currentProduct)}
                      >
                        Add to Bag
                      </button>
                    </div>

                    <div className="mb-8 p-6 border border-gray-100 bg-gray-50/50">
                      <h4 className="text-[11px] font-bold uppercase tracking-[2px] mb-4">Delivery Options</h4>
                      <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          placeholder="ENTER PIN CODE" 
                          className="flex-grow px-4 py-3 text-[11px] border border-gray-200 outline-none focus:border-green-dark bg-white"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                        <button className="px-6 bg-white border border-gray-200 text-gold text-[11px] font-bold uppercase tracking-[2px] hover:border-gold transition-all">Check</button>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Delivery outside India?</span>
                        <span>Guaranteed dispatch within 48 Hrs.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <button className="flex items-center justify-center gap-2 py-3 bg-[#f3e5d8] text-green-dark text-[10px] font-bold uppercase tracking-[1px]">
                        <ShoppingBag size={14} /> Available Offers
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 bg-[#f3e5d8] text-green-dark text-[10px] font-bold uppercase tracking-[1px]">
                        <Star size={14} /> What's New
                      </button>
                    </div>

                    {/* Accordions */}
                    <div className="border-t border-gray-100">
                      {[
                        { id: 'description', title: 'Description', content: currentProduct.body },
                        { id: 'benefits', title: 'Benefits', content: '<ul><li>Nourishes and revitalizes skin</li><li>Improves skin elasticity</li><li>Natural Ayurvedic formulation</li><li>Suitable for all skin types</li></ul>' },
                        { id: 'awards', title: 'Awards', content: 'Winner of the Vogue Wellness Awards 2024 for Best Traditional Ayurvedic Brand.' }
                      ].map((section) => (
                        <div key={section.id} className="border-b border-gray-100">
                          <button 
                            className="w-full py-5 flex items-center justify-between text-left group"
                            onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                          >
                            <span className="font-serif text-xl text-green-dark group-hover:text-gold transition-colors">{section.title}</span>
                            {openAccordion === section.id ? <Minus size={18} className="text-gray-400" /> : <Plus size={18} className="text-gray-400" />}
                          </button>
                          <AnimatePresence>
                            {openAccordion === section.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pb-6 text-sm text-gray-600 leading-relaxed markdown-body" dangerouslySetInnerHTML={{ __html: section.content }} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Ingredients Section */}
              <div className="mt-24 pt-24 border-t border-gray-100">
                <div className="grid md:grid-cols-12 gap-12">
                  <div className="md:col-span-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[3px] mb-2 block">Key Ingredients</span>
                    <div className="w-8 h-0.5 bg-green-dark mb-4"></div>
                    <h2 className="font-serif text-4xl text-green-dark mb-8 leading-tight">What's inside that really matters</h2>
                    <button className="text-[10px] font-bold uppercase tracking-[2px] text-green-dark border-b border-green-dark pb-1 hover:text-gold hover:border-gold transition-all">View Full List</button>
                  </div>
                  <div className="md:col-span-9">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      {INGREDIENTS.map((ing, i) => (
                        <div key={i} className="text-center">
                          <div className="aspect-square rounded-full overflow-hidden border border-gray-100 mb-6 p-2 bg-white shadow-sm hover:shadow-md transition-all">
                            <img src={ing.image} alt={ing.name} loading="lazy" className="w-full h-full object-cover rounded-full" />
                          </div>
                          <h4 className="font-serif text-lg text-green-dark mb-2">{ing.name}</h4>
                          <div className="w-6 h-0.5 bg-green-dark mx-auto mb-4"></div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{ing.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-24 pt-24 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                    <h2 className="font-serif text-4xl text-green-dark mb-4">Customer Reviews</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-gold text-gold" />)}
                      </div>
                      <span className="text-lg font-bold text-green-dark">4.8 out of 5</span>
                      <span className="text-sm text-gray-400">Based on 1,240 reviews</span>
                    </div>
                  </div>
                  <button className="bg-green-dark text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[2px] hover:bg-green-mid transition-all">Write a Review</button>
                </div>

                <div className="space-y-10">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="pb-10 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "fill-gold text-gold" : "text-gray-200"} />
                            ))}
                          </div>
                          <h4 className="font-bold text-green-dark text-sm mb-1">{review.title}</h4>
                          <div className="text-[11px] text-gray-400">
                            <span className="font-bold text-gray-600">{review.name}</span> on <span>{review.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-green-light font-bold uppercase tracking-widest">
                          <CheckCircle2 size={14} /> Verified Purchase
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view.type === 'info' && currentInfoPage && (
          <div className="bg-cream min-h-screen">
            {/* Info Hero */}
            <div className="bg-green-dark py-20 px-6 sm:px-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-[1400px] mx-auto"
              >
                <h1 className="font-serif text-4xl sm:text-6xl text-white mb-4">{currentInfoPage.title}</h1>
                <div className="w-24 h-1 bg-gold mx-auto"></div>
              </motion.div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16">
              <div className="flex flex-col lg:flex-row gap-16">
                {/* Side Nav */}
                <aside className="lg:w-64 flex-shrink-0">
                  <div className="sticky top-32">
                    <h4 className="font-serif text-green-dark text-xl mb-6 pb-2 border-b border-green-dark/10">Explore</h4>
                    <nav className="space-y-1">
                      {Object.entries(INFO_PAGES).map(([id, page]) => (
                        <button
                          key={id}
                          onClick={() => navigateTo('info', id)}
                          className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group ${
                            view.id === id 
                              ? 'bg-green-dark text-white font-bold' 
                              : 'text-gray-500 hover:bg-white hover:text-green-dark'
                          }`}
                        >
                          {page.title}
                          <ChevronRight size={14} className={`transition-transform ${view.id === id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                        </button>
                      ))}
                    </nav>

                    <div className="mt-12 p-6 bg-green-pale border border-green-dark/5">
                      <h5 className="font-serif text-green-dark font-bold mb-2">Need Help?</h5>
                      <p className="text-xs text-gray-500 mb-4">Our Ayurvedic consultants are here to guide you.</p>
                      <button className="w-full bg-green-dark text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-green-mid transition-colors">
                        Contact Us
                      </button>
                    </div>
                  </div>
                </aside>

                {/* Content */}
                <div className="flex-grow bg-white p-8 sm:p-12 shadow-sm border border-gray-100">
                  <button 
                    onClick={() => navigateTo('home')}
                    className="text-[10px] font-bold uppercase tracking-[2px] text-gold hover:text-green-dark mb-10 flex items-center gap-2 group transition-colors"
                  >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                  </button>
                  <div className="markdown-body max-w-none">
                    <ReactMarkdown>{currentInfoPage.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-dark text-white/60 pt-16 px-6 sm:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
            <div className="col-span-1 md:col-span-1">
              <span className="font-serif text-2xl text-white mb-6 block">Divya Ayurveda</span>
              <p className="text-sm leading-relaxed mb-8">Bringing the ancient healing wisdom of Ayurveda to modern Indian homes. Every product is crafted with reverence for tradition.</p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-serif text-white font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => navigateTo('home')} className="hover:text-gold-light transition-colors">Home</button></li>
                <li><button onClick={() => navigateTo('home')} className="hover:text-gold-light transition-colors">Shop All</button></li>
                <li><button onClick={() => navigateTo('info', 'our-story')} className="hover:text-gold-light transition-colors">Our Story</button></li>
                <li><button onClick={() => navigateTo('info', 'our-philosophy')} className="hover:text-gold-light transition-colors">Our Philosophy</button></li>
                <li><button onClick={() => navigateTo('info', 'stores')} className="hover:text-gold-light transition-colors">Our Stores</button></li>
                <li><button onClick={() => navigateTo('info', 'careers')} className="hover:text-gold-light transition-colors">Careers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-white font-semibold mb-6">Customer Service</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => navigateTo('info', 'faqs')} className="hover:text-gold-light transition-colors">FAQs</button></li>
                <li><button onClick={() => navigateTo('info', 'soundarya-club-faqs')} className="hover:text-gold-light transition-colors">Soundarya Club FAQs</button></li>
                <li><button onClick={() => navigateTo('info', 'policies')} className="hover:text-gold-light transition-colors">Policies</button></li>
                <li><button onClick={() => navigateTo('info', 'terms')} className="hover:text-gold-light transition-colors">Terms of Use</button></li>
                <li><button onClick={() => navigateTo('info', 'social-responsibility')} className="hover:text-gold-light transition-colors">Social Responsibility</button></li>
                <li><button onClick={() => navigateTo('info', 'media-press')} className="hover:text-gold-light transition-colors">Media & Press</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-white font-semibold mb-6">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li>1800-XXX-XXXX (Toll Free)</li>
                <li>support@divyaayurveda.in</li>
                <li>Mon–Sat, 9am–6pm IST</li>
              </ul>
              <div className="mt-8">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-3">We Accept</span>
                <div className="flex gap-2">
                  {['UPI', 'Visa', 'MC', 'COD'].map(p => (
                    <span key={p} className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs">
            <p>© 2025 Divya Ayurveda. All Rights Reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => navigateTo('info', 'policies')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => navigateTo('info', 'terms')} className="hover:text-white transition-colors">Terms of Use</button>
              <button onClick={() => navigateTo('info', 'policies')} className="hover:text-white transition-colors">Disclaimer</button>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Modals & Sidebars --- */}

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-green-dark text-white flex items-center justify-between">
                <h3 className="font-serif text-xl">Your Cart</h3>
                <button onClick={() => setIsCartOpen(false)}><X size={24} /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag size={64} strokeWidth={1} className="mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                    <button 
                      className="mt-6 text-green-dark font-bold uppercase text-xs tracking-widest underline"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.key} className="flex gap-4 pb-6 border-b border-gray-100">
                        <img src={item.image} alt={item.title} className="w-20 h-20 object-cover bg-cream" />
                        <div className="flex-grow">
                          <h4 className="font-serif text-green-dark font-semibold leading-tight mb-1">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 mb-2">{item.option}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-200">
                              <button 
                                className="p-1 hover:bg-gray-50"
                                onClick={() => setCart(prev => prev.map(i => i.key === item.key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-xs">{item.qty}</span>
                              <button 
                                className="p-1 hover:bg-gray-50"
                                onClick={() => setCart(prev => prev.map(i => i.key === item.key ? { ...i, qty: i.qty + 1 } : i))}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="text-sm font-bold">₹{parseFloat(item.price) * item.qty}</span>
                          </div>
                          <button 
                            className="text-[10px] text-gray-400 underline mt-2"
                            onClick={() => setCart(prev => prev.filter(i => i.key !== item.key))}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-xl font-bold text-green-dark">₹{cartTotal}</span>
                  </div>
                  <p className="text-[10px] text-center text-green-light mb-6">
                    {cartTotal >= 399 ? 'You qualify for FREE shipping!' : `Add ₹${399 - cartTotal} more for FREE shipping`}
                  </p>
                  <button 
                    className="w-full bg-green-dark hover:bg-green-mid text-white py-4 text-xs tracking-widest uppercase font-bold transition-colors mb-3"
                    onClick={() => { showToast('Proceeding to checkout...'); setIsCartOpen(false); }}
                  >
                    Proceed to Checkout
                  </button>
                  <button 
                    className="w-full text-center text-[10px] text-gray-400 underline"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wishlist Sidebar */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50"
              onClick={() => setIsWishlistOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-green-dark text-white flex items-center justify-between">
                <h3 className="font-serif text-xl">Your Wishlist</h3>
                <button onClick={() => setIsWishlistOpen(false)}><X size={24} /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Heart size={64} strokeWidth={1} className="mb-4 opacity-20" />
                    <p>Your wishlist is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {wishlist.map((handle) => {
                      const product = PRODUCTS.find(p => p.handle === handle);
                      if (!product) return null;
                      return (
                        <div key={handle} className="flex gap-4 pb-6 border-b border-gray-100">
                          <img src={product.image} alt={product.title} className="w-20 h-20 object-cover bg-cream" />
                          <div className="flex-grow">
                            <h4 className="font-serif text-green-dark font-semibold leading-tight mb-1">{product.title}</h4>
                            <p className="text-sm font-bold mb-3">₹{product.price}</p>
                            <div className="flex gap-3">
                              <button 
                                className="text-[10px] bg-green-dark text-white px-3 py-1.5 uppercase tracking-widest font-bold"
                                onClick={() => { addToCart(product); toggleWishlist(handle); }}
                              >
                                Move to Cart
                              </button>
                              <button 
                                className="text-[10px] text-gray-400 underline"
                                onClick={() => toggleWishlist(handle)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAuthOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md p-8 sm:p-12 shadow-2xl rounded-sm"
            >
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
                onClick={() => setIsAuthOpen(false)}
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl text-green-dark mb-2">{user ? 'Welcome Back' : 'Join Divya Ayurveda'}</h2>
                <p className="text-sm text-gray-500">{user ? user.email : 'Create an account for faster checkout and exclusive offers.'}</p>
              </div>

              {user ? (
                <div className="space-y-4">
                  <button className="w-full bg-green-dark text-white py-4 text-xs font-bold uppercase tracking-widest">My Orders</button>
                  <button className="w-full border border-gray-200 py-4 text-xs font-bold uppercase tracking-widest" onClick={() => setUser(null)}>Logout</button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setUser({ email: 'user@example.com' }); setIsAuthOpen(false); showToast('Logged in successfully'); }}>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Email Address</label>
                    <input type="email" required className="w-full px-4 py-3 border border-gray-200 outline-none focus:border-green-dark" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Password</label>
                    <input type="password" required className="w-full px-4 py-3 border border-gray-200 outline-none focus:border-green-dark" />
                  </div>
                  <button type="submit" className="w-full bg-green-dark text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-green-mid transition-colors">
                    Login / Create Account
                  </button>
                  <div className="text-center">
                    <a href="#" className="text-[10px] text-gray-400 underline">Forgot Password?</a>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/60"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-[300px] bg-green-dark z-[301] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <span className="font-serif text-xl text-white">Divya Ayurveda</span>
                <button onClick={() => setIsMobileNavOpen(false)} className="text-white/70"><X size={24} /></button>
              </div>
              <div className="p-6">
                <div className="relative mb-8">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full py-2 pl-4 pr-10 bg-white/10 border border-white/20 rounded text-white text-sm outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                </div>
                <nav className="flex flex-col gap-4">
                  {['Home', 'Shop All', 'Diabetes', 'Heart', 'Brain', 'Joints', 'Rituals'].map((item) => (
                    <button 
                      key={item}
                      className="text-left text-white/80 hover:text-white py-2 text-sm uppercase tracking-widest"
                      onClick={() => {
                        if (item === 'Home') { navigateTo('home'); setActiveCategory('all'); setSearchQuery(''); }
                        else if (item === 'Shop All') { setActiveCategory('all'); navigateTo('home', undefined, 'shop'); }
                        else { setActiveCategory(item); navigateTo('home', undefined, 'shop'); }
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] bg-green-dark text-white px-8 py-4 text-sm font-medium border-l-4 border-gold shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Offer Popup */}
      <AnimatePresence>
        {isWellnessPopupOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsWellnessPopupOpen(false);
                localStorage.setItem('divya_wellness_popup_seen', 'true');
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row rounded-lg"
            >
              <button 
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-black bg-white/80 rounded-full p-1 backdrop-blur-sm transition-all"
                onClick={() => {
                  setIsWellnessPopupOpen(false);
                  localStorage.setItem('divya_wellness_popup_seen', 'true');
                }}
              >
                <X size={20} />
              </button>

              {/* Left: Image */}
              <div className="hidden md:block md:w-1/2 relative">
                <img 
                  src="https://static.wixstatic.com/media/7fa905_e3cd3b37178a40f28c6a44d08bfaf77b~mv2.jpg" 
                  alt="Wellness Offer" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-green-dark/10"></div>
              </div>

              {/* Right: Content */}
              <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-center md:text-left">
                <span className="text-gold tracking-[4px] uppercase text-[10px] font-bold mb-4 block">Exclusive Offer</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-green-dark mb-4 leading-tight">
                  Unlock <span className="text-gold">20% Off</span> Your First Order
                </h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  Join the Divya Tribe today. Subscribe to our newsletter and receive an exclusive discount code for your journey to holistic wellness.
                </p>

                <form 
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsWellnessPopupOpen(false);
                    localStorage.setItem('divya_wellness_popup_seen', 'true');
                    showToast('Welcome to the tribe! Check your email for the code.');
                  }}
                >
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      placeholder="Enter your email address" 
                      className="w-full px-4 py-4 border border-gray-200 outline-none focus:border-gold text-sm transition-all"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-green-dark text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-green-mid transition-all shadow-lg"
                  >
                    Get My 20% Discount
                  </button>
                </form>

                <button 
                  className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest hover:text-green-dark transition-colors"
                  onClick={() => {
                    setIsWellnessPopupOpen(false);
                    localStorage.setItem('divya_wellness_popup_seen', 'true');
                  }}
                >
                  No thanks, I'll pay full price
                </button>

                <p className="mt-8 text-[9px] text-gray-400 leading-relaxed">
                  By signing up, you agree to receive marketing emails. You can unsubscribe at any time. View our <a href="#" className="underline">Privacy Policy</a>.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
