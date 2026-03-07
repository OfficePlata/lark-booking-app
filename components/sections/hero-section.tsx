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

// 【修正箇所1】画像のパスを public 直下の設定（/ファイル名）に直しました
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

  // 自動再生の処理（5秒ごと）
  React.useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    // 【修正箇所2】スマホでは高さを抑えめ(60vh)、PC(md以上)では高め(80vh)に自動可変する設定を追加
    <section className="relative w-full h-[60vh] min-h-[400px] md:h-[80vh] md:min-h-[600px] overflow-hidden">
      <Carousel
        setApi={setApi}
        className="w-full h-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {heroImages.map((image, index) => (
            <CarouselItem key={index} className="h-full relative">
              <div className="absolute inset-0 w-full h-full">
                {/* スマホでもPCでも画面いっぱいに比率を保って表示される object-cover */}
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* PC画面のときだけ表示する左右の矢印 */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-8 w-12 h-12 bg-white/20 hover:bg-white/40 border-none text-white" />
          <CarouselNext className="right-8 w-12 h-12 bg-white/20 hover:bg-white/40 border-none text-white" />
        </div>
      </Carousel>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 pointer-events-none">
        {/* スマホだと少し文字を小さくして見やすく調整 */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-lg">
          STAY YOKABAN
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-8 md:mb-10 max-w-2xl drop-shadow-md">
          暮らすように泊まる、心地よいプライベート空間
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-8 py-6">
            <Link href="#booking">予約する</Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20 text-base md:text-lg px-8 py-6">
            <Link href="#features">施設を見る</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
