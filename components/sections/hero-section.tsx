"use client";

import * as React from "react";
// Next.jsの標準コンポーネントを使用
import Image from "next/image";
import Link from "next/link";
// エラーログに基づき、正しいフック名である useTranslation を使用
import { useTranslation } from "@/lib/i18n/context";

// 1. 画像リスト（opengraph-image.jpg を先頭に配置）
const heroImages = [
  { src: "/opengraph-image.jpg", altKey: "alt1" },
  { src: "/yokaban-sign-tapestry.jpg", altKey: "alt2" },
  { src: "/kitchen-overview.jpg", altKey: "alt3" },
  { src: "/bedroom-door-view.jpg", altKey: "alt4" },
] as const;

// 2. 翻訳データ
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

export function HeroSection() {
  // エラーログに従い、useTranslation を使用
  const { language } = useTranslation();
  const [currentLang, setCurrentLang] = React.useState<"ja" | "en">("ja");
  
  // マウント時に言語設定を同期（ハイドレーションエラー対策）
  React.useEffect(() => {
    if (language === "en") {
      setCurrentLang("en");
    } else {
      setCurrentLang("ja");
    }
  }, [language]);

  const t = translations[currentLang];
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 5秒ごとの自動スライド
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <section className="relative w-full h-[65vh] min-h-[480px] md:h-[85vh] md:min-h-[600px] overflow-hidden bg-zinc-950">
      
      {/* 背景スライド */}
      {heroImages.map((image, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <Image
            src={image.src}
            alt={t[image.altKey as keyof typeof t] || "STAY YOKABAN"}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* 視認性向上のためのオーバーレイグラデーション */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      ))}

      {/* ナビゲーション（矢印） */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-between px-4 md:px-8">
        <button 
          onClick={prevSlide}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all pointer-events-auto border border-white/10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button 
          onClick={nextSlide}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all pointer-events-auto border border-white/10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* コンテンツエリア */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        {/* タイトル：強力な影と間隔を調整 */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          STAY YOKABAN
        </h1>
        
        {/* サブタイトル：読みやすさを追求したウェイトと影 */}
        <p className="text-base sm:text-lg md:text-2xl text-zinc-100 mb-10 md:mb-14 max-w-2xl font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,1)] leading-relaxed">
          {t.subtitle}
        </p>
        
        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pointer-events-auto">
          <Link 
            href="#booking"
            className="flex items-center justify-center bg-zinc-100 text-zinc-950 hover:bg-white text-base md:text-lg font-bold px-10 py-4 rounded-full transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] transform hover:scale-105 active:scale-95"
          >
            {t.bookNow}
          </Link>
          
          <Link 
            href="#features"
            className="flex items-center justify-center bg-transparent text-white border-2 border-white/80 hover:bg-white/10 text-base md:text-lg font-semibold px-10 py-4 rounded-full backdrop-blur-md transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] transform hover:scale-105 active:scale-95"
          >
            {t.viewFeatures}
          </Link>
        </div>
      </div>

      {/* インジケーター */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === currentIndex ? "bg-white w-10 h-1.5" : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
