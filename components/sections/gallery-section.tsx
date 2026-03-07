"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ギャラリーデータの定義
const galleryData = {
  kitchen: [
    { src: "/kitchen-overview.jpg", altJa: "キッチン全体", altEn: "Kitchen Overview" },
    { src: "/kitchen-appliances.jpg", altJa: "調理家電", altEn: "Appliances" },
    { src: "/kitchen-sink-area.jpg", altJa: "シンク周り", altEn: "Sink Area" },
    { src: "/kitchen-cutlery-drawer.jpg", altJa: "カトラリー", altEn: "Cutlery" },
    { src: "/kitchen-tableware-cabinet.jpg", altJa: "食器棚", altEn: "Tableware" },
    { src: "/kitchen-cookware-seasonings.jpg", altJa: "調理器具", altEn: "Cookware" },
    { src: "/kitchen-seasoning-containers.jpg", altJa: "調味料", altEn: "Seasonings" },
    { src: "/kitchen-large-pot.jpg", altJa: "大鍋", altEn: "Large Pot" },
  ],
  bedroom: [
    { src: "/bedroom-door-view.jpg", altJa: "寝室入り口", altEn: "Bedroom Entrance" },
    { src: "/bedroom-cloud-art.jpg", altJa: "寝室のアート", altEn: "Bedroom Art" },
    { src: "/desk-workspace.jpg", altJa: "ワークスペース", altEn: "Workspace" },
    { src: "/closet-hangers.jpg", altJa: "クローゼット", altEn: "Closet" },
    { src: "/tv-wifi-router.jpg", altJa: "TV・Wi-Fi", altEn: "TV & Wi-Fi" },
  ],
  bath: [
    { src: "/bathroom-bathtub.jpg", altJa: "バスルーム", altEn: "Bathroom" },
    { src: "/shower-room-amenities.jpg", altJa: "アメニティ", altEn: "Amenities" },
    { src: "/washroom-laundry.jpg", altJa: "ランドリー", altEn: "Laundry" },
    { src: "/washroom-towels.jpg", altJa: "タオル", altEn: "Towels" },
    { src: "/washroom-cabinet.jpg", altJa: "洗面台収納", altEn: "Cabinet" },
    { src: "/restroom-toilet.jpg", altJa: "トイレ", altEn: "Restroom" },
    { src: "/fabric-room-mists.jpg", altJa: "ルームミスト", altEn: "Room Mists" },
  ],
  other: [
    { src: "/hallway-art-gallery.jpg", altJa: "廊下のアート", altEn: "Hallway Art" },
    { src: "/hallway-kitchen-view.jpg", altJa: "廊下からの眺め", altEn: "Hallway View" },
  ]
};

// 翻訳データ
const translations = {
  ja: {
    title: "施設・設備",
    description: "快適な滞在をサポートする充実した設備をご用意しています。",
    kitchen: "キッチン",
    bedroom: "寝室・ワーク",
    bath: "バス・洗面",
    other: "その他",
  },
  en: {
    title: "Facilities",
    description: "Full range of equipment to support your comfortable stay.",
    kitchen: "Kitchen",
    bedroom: "Bedroom",
    bath: "Bath & Wash",
    other: "Others",
  },
};

export function GallerySection() {
  const { language } = useTranslation();
  const t = translations[(language as keyof typeof translations) || "ja"];

  return (
    <section id="features" className="py-20 bg-zinc-50">
      <div className="container mx-auto px-4">
        {/* セクション見出し */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{t.title}</h2>
          <p className="text-zinc-600 max-w-2xl mx-auto">{t.description}</p>
        </div>

        {/* カテゴリータブ */}
        <Tabs defaultValue="kitchen" className="w-full">
          <TabsList className="flex flex-wrap justify-center bg-transparent gap-2 mb-10 h-auto">
            <TabsTrigger value="kitchen" className="px-6 py-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white border border-zinc-200">
              {t.kitchen}
            </TabsTrigger>
            <TabsTrigger value="bedroom" className="px-6 py-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white border border-zinc-200">
              {t.bedroom}
            </TabsTrigger>
            <TabsTrigger value="bath" className="px-6 py-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white border border-zinc-200">
              {t.bath}
            </TabsTrigger>
            <TabsTrigger value="other" className="px-6 py-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white border border-zinc-200">
              {t.other}
            </TabsTrigger>
          </TabsList>

          {/* 各カテゴリーのコンテンツ */}
          {(Object.keys(galleryData) as Array<keyof typeof galleryData>).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {galleryData[category].map((image, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-200 shadow-sm transition-all hover:shadow-md"
                  >
                    <Image
                      src={image.src}
                      alt={language === "en" ? image.altEn : image.altJa}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    {/* ホバー時に説明を表示（PCのみ） */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">
                        {language === "en" ? image.altEn : image.altJa}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
