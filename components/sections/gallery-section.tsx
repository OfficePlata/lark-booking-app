"use client";

import * as React from "react";
// プレビュー環境でのエラーを回避するため、標準のHTML要素を使用します
// 本番環境（Vercel）でもこのまま動作し、ビルドエラーも発生しません
import { useTranslation } from "@/lib/i18n/context";

// 1. ギャラリーデータの定義
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
    { src: "/dining-table-setting.jpg", altJa: "お部屋に配置されたダイニングテーブルのセッティング", altEn: "Dining table setting in the room" },
    { src: "/dining-table-close-up.jpg", altJa: "テーブル上の食器とカトラリー", altEn: "Tableware and cutlery on the dining table" },
  ]
} as const;

// 2. 翻訳データ
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

type Category = keyof typeof galleryData;

export function GallerySection() {
  // エラーログに基づき useTranslation を使用
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<Category>("kitchen");
  
  const currentLang = (language === "en" ? "en" : "ja") as keyof typeof translations;
  const t = translations[currentLang];

  return (
    <section id="features" className="py-20 bg-zinc-50 min-h-[600px]">
      <div className="container mx-auto px-4">
        
        {/* セクション見出し */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">
            {t.title}
          </h2>
          <div className="w-20 h-1 bg-zinc-900 mx-auto mb-6 rounded-full" />
          <p className="text-zinc-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {t.description}
          </p>
        </div>

        {/* カスタムタブ（依存関係エラーを避けるために自作） */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(Object.keys(galleryData) as Array<Category>).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 border shadow-sm ${
                activeTab === cat
                  ? "bg-zinc-900 text-white border-zinc-900 scale-105 shadow-md"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              {t[cat as keyof typeof t]}
            </button>
          ))}
        </div>

        {/* ギャラリーグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 transition-all duration-500">
          {galleryData[activeTab].map((image, index) => (
            <div 
              key={`${activeTab}-${index}`} 
              className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-200 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 animate-in fade-in zoom-in duration-300"
            >
              <img
                src={image.src}
                alt={currentLang === "en" ? image.altEn : image.altJa}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f4f4f5/71717a?text=${activeTab}`;
                }}
              />
              
              {/* ホバー時に情報を表示 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                <p className="text-white text-sm font-bold tracking-wide transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {currentLang === "en" ? image.altEn : image.altJa}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 補足メッセージ */}
        <div className="mt-20 p-8 border border-zinc-200 rounded-3xl bg-white shadow-sm text-center max-w-4xl mx-auto">
          <p className="text-zinc-500 text-sm italic">
            {currentLang === "en" 
              ? "Actual equipment and layout may vary slightly." 
              : "※実際の設備や配置は写真と若干異なる場合がございます。"}
          </p>
        </div>
      </div>
    </section>
  );
}
