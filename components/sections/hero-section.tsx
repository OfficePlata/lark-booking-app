"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLanguage } from "@/lib/i18n/context";

// 画像リスト（altテキストはキーで管理します）
const heroImages = [
  {
    src: "/opengraph-image.jpg",
    altKey: "alt1",
  },
  {
    src: "/yokaban-sign-tapestry.jpg",
    altKey: "alt2",
  },
  {
    src: "/kitchen-overview.jpg",
    altKey: "alt3",
  },
  {
    src: "/bedroom-door-view.jpg",
    altKey: "alt4",
  },
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

export function HeroSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  // プロジェクトのi18nから現在の言語（'ja' または 'en'）を取得
  const { language } = useLanguage(); 
  
  // 現在の言語に対応するテキストを取得（デフォルトは日本語）
  const t = translations[(language as keyof typeof translations) || "ja"] || translations.ja;

  // 5秒ごとの自動再生タイマー
  React.useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <section className="relative w-full">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {heroImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[60vh] min-h-[450px] md:h-[80vh] md:min-h-[600px]">
                <Image
                  src={image.src}
                  alt={t[image.altKey as keyof typeof t] || "STAY YOKABAN image"}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/50 border-none text-white z-20 transition-all backdrop-blur-sm" />
          <CarouselNext className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/50 border-none text-white z-20 transition-all backdrop-blur-sm" />
        </div>
      </Carousel>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 pointer-events-none">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          STAY YOKABAN
        </h1>
        {/* 言語に合わせてサブタイトルを変更 */}
        <p className="text-base sm:text-lg md:text-2xl text-white/95 mb-8 md:mb-12 max-w-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium px-2">
          {t.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0 pointer-events-auto">
          {/* 言語に合わせてボタンのテキストを変更 */}
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg w-full sm:w-48 py-6 shadow-lg">
            <Link href="#booking">{t.bookNow}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/30 text-base md:text-lg w-full sm:w-48 py-6 backdrop-blur-md shadow-lg">
            <Link href="#features">{t.viewFeatures}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
