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
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; // ※もしインストールされていれば自動再生に使えます

// スライドショーに表示する画像のリスト
const heroImages = [
  {
    src: "/opengraph-image.jpg", // publicフォルダ直下にある場合
    alt: "STAY YOKABAN 外観",
  },
  {
    src: "/images/yokaban-sign-tapestry.jpg", // public/images フォルダに配置した場合
    alt: "STAY YOKABAN ロゴタペストリー",
  },
  {
    src: "/images/kitchen-overview.jpg",
    alt: "広々としたキッチンとダイニング",
  },
  {
    src: "/images/bedroom-door-view.jpg",
    alt: "くつろぎの寝室空間",
  },
];

export function HeroSection() {
  // 自動再生用のプラグイン設定（数秒ごとに次のスライドへ）
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        opts={{
          loop: true, // ループさせる
        }}
      >
        <CarouselContent className="h-full">
          {heroImages.map((image, index) => (
            <CarouselItem key={index} className="h-full relative">
              {/* 背景画像 */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0} // 最初の画像だけ優先読み込み
                  className="object-cover"
                />
                {/* 文字を読みやすくするための暗いオーバーレイ */}
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* 左右の矢印ナビゲーション（PC画面などで表示） */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-8 w-12 h-12 bg-white/20 hover:bg-white/40 border-none text-white" />
          <CarouselNext className="right-8 w-12 h-12 bg-white/20 hover:bg-white/40 border-none text-white" />
        </div>
      </Carousel>

      {/* 前面に固定で表示するテキストとボタン */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
          STAY YOKABAN
        </h1>
        <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl drop-shadow-md">
          暮らすように泊まる、心地よいプライベート空間
        </p>
        
        <div className="flex gap-4 pointer-events-auto">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
            <Link href="#booking">予約する</Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20 text-lg px-8">
            <Link href="#features">施設を見る</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
