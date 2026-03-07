"use client";

import * as React from "react";

// 画像リスト
const heroImages = [
  { src: "/opengraph-image.jpg", altKey: "alt1" },
  { src: "/yokaban-sign-tapestry.jpg", altKey: "alt2" },
  { src: "/kitchen-overview.jpg", altKey: "alt3" },
  { src: "/bedroom-door-view.jpg", altKey: "alt4" },
] as const;

// 日本語と英語のテキストデータ
const translations = {
  ja: {
    subtitle: "暮らすように泊まる、心地よいプライベート空間",
    bookNow: "予約する",
    viewFeatures: "施設を見る",
    alt1: "STAY YOKABAN 外観",
    alt2: "STAY YOKABAN ロゴタペストリー",
    alt3: "広々としたキッチンとダイニング",
    alt4: "くつろぎの寝室空間",
  },
  en: {
    subtitle: "Live like a local in your cozy private space",
    bookNow: "Book Now",
    viewFeatures: "Explore",
    alt1: "STAY YOKABAN Exterior",
    alt2: "STAY YOKABAN Logo Tapestry",
    alt3: "Spacious Kitchen and Dining",
    alt4: "Relaxing Bedroom Space",
  },
};

export default function HeroSection() {
  const [currentLang, setCurrentLang] = React.useState<"ja" | "en">("ja");
  const t = translations[currentLang];
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 5秒ごとの自動再生タイマー
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section className="relative w-full h-[60vh] min-h-[450px] md:h-[80vh] md:min-h-[600px] overflow-hidden bg-slate-900">
      
      {/* 言語切り替えボタンスイッチ（プレビュー確認用） */}
      <div className="absolute top-4 right-4 z-50 flex bg-black/30 rounded p-1 backdrop-blur-sm">
        <button 
          onClick={() => setCurrentLang('ja')} 
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${currentLang === 'ja' ? 'bg-white text-black shadow' : 'text-white/70 hover:text-white'}`}
        >
          JA
        </button>
        <button 
          onClick={() => setCurrentLang('en')} 
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${currentLang === 'en' ? 'bg-white text-black shadow' : 'text-white/70 hover:text-white'}`}
        >
          EN
        </button>
      </div>

      {/* スライド表示エリア */}
      {heroImages.map((image, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img
            src={image.src}
            alt={t[image.altKey as keyof typeof t] || "STAY YOKABAN image"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/1200x800/1e293b/ffffff?text=Image+${index + 1}`;
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
        
      {/* ナビゲーション矢印 */}
      <div className="hidden md:block">
        <button 
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/50 border-none text-white z-20 transition-all backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
        >
          &#10094;
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/50 border-none text-white z-20 transition-all backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
        >
          &#10095;
        </button>
      </div>

      {/* コンテンツ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 px-4 pointer-events-none">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          STAY YOKABAN
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-white/95 mb-8 md:mb-12 max-w-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium px-2">
          {t.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0 pointer-events-auto">
          <a 
            href="#booking" 
            className="flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 text-base md:text-lg w-full sm:w-48 py-4 px-6 rounded-md shadow-lg font-medium transition-colors"
          >
            {t.bookNow}
          </a>
          <a 
            href="#features" 
            className="flex items-center justify-center bg-white/10 text-white border border-white hover:bg-white/30 text-base md:text-lg w-full sm:w-48 py-4 px-6 rounded-md backdrop-blur-md shadow-lg font-medium transition-colors"
          >
            {t.viewFeatures}
          </a>
        </div>
      </div>
    </section>
  );
}
