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

const heroImages = [
  {
    src: "/opengraph-image.jpg",
    alt: "STAY YOKABAN 外観",
  },
  {
    src: "/yokaban-sign-tapestry.jpg",
    alt: "STAY YOKABAN ロゴタペストリー",
  },
  {
    src: "/kitchen-overview.jpg",
    alt: "広々としたキッチンとダイニング",
  },
  {
    src: "/bedroom-door-view.jpg",
    alt: "くつろぎの寝室空間",
  },
];

export function HeroSection() {
  const [api, setApi] = React.useState<CarouselApi>();

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
              {/* ここで高さを確実に確保（スマホは60vh、PCは80vh）し、真っ白になるのを防ぐ */}
              <div className="relative w-full h-[60vh] min-h-[450px] md:h-[80vh] md:min-h-[600px]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw" // 画像の最適化
                />
                {/* 文字を見やすくするための暗いフィルター */}
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* PC画面でのみ表示する左右の矢印 */}
        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/50 border-none text-white z-20 transition-all backdrop-blur-sm" />
          <CarouselNext className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/50 border-none text-white z-20 transition-all backdrop-blur-sm" />
        </div>
      </Carousel>

      {/* 前面に固定するテキストエリア */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 pointer-events-none">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          STAY YOKABAN
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-white/95 mb-8 md:mb-12 max-w-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium px-2">
          天文館で過ごす、特別な夜
        </p>
        
        {/* スマホでは縦並び、PCでは横並びになるボタン */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0 pointer-events-auto">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg w-full sm:w-48 py-6 shadow-lg">
            <Link href="#booking">予約する</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/30 text-base md:text-lg w-full sm:w-48 py-6 backdrop-blur-md shadow-lg">
            <Link href="#features">施設を見る</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
