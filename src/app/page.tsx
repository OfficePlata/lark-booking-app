"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Star,
  Heart,
  Share,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Snowflake,
  Bath,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Globe,
  Mail,
  Instagram,
  Home as HomeIcon,
  Users,
  BedDouble,
  CalendarDays,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const propertyImages = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=80",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
];

const amenities = [
  { icon: Wifi, label: "Wi-Fi完備", description: "高速インターネット接続" },
  { icon: Utensils, label: "キッチン", description: "調理器具・食器完備" },
  { icon: Tv, label: "テレビ", description: "大型スマートTV" },
  { icon: Wind, label: "乾燥機", description: "洗濯乾燥機付き" },
  { icon: Snowflake, label: "エアコン", description: "全室空調完備" },
  { icon: Bath, label: "専用バスルーム", description: "ゆったりバスタブ付き" },
  { icon: Car, label: "駐車場", description: "無料駐車場あり" },
  { icon: HomeIcon, label: "一棟貸切", description: "プライベート空間" },
];

const reviews = [
  {
    id: 1,
    name: "田中 健太",
    avatar: "T",
    date: "2026年2月",
    rating: 5,
    comment: "天文館の中心部にありながら、とても静かで快適に過ごせました。内装も綺麗でおしゃれで、友人との旅行に最適でした。",
  },
  {
    id: 2,
    name: "山本 美咲",
    avatar: "Y",
    date: "2026年1月",
    rating: 5,
    comment: "和風モダンな雰囲気がとても素敵でした。キッチンも使いやすく、地元の食材を買って料理も楽しめました。",
  },
  {
    id: 3,
    name: "鈴木 大輔",
    avatar: "S",
    date: "2025年12月",
    rating: 5,
    comment: "駅から近く、周辺にお店もたくさんあって便利でした。清潔で居心地の良い空間です。また利用したいです。",
  },
  {
    id: 4,
    name: "佐藤 優子",
    avatar: "S",
    date: "2025年11月",
    rating: 5,
    comment: "家族3人で利用しました。広々としていて子供も喜んでいました。乾燥機があるのも助かりました。",
  },
];

export default function Home() {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(2);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const getPricePerNight = (n: number): number => {
    if (n >= 8) return 10000;
    if (n >= 5) return 11000;
    if (n >= 3) return 12000;
    if (n === 2) return 13000;
    return 16000;
  };
  const pricePerNight = getPricePerNight(nights);
  const subtotal = pricePerNight * nights;
  const cleaningFee = 3000;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Stay Yokaban
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">ホーム</a>
            <a href="#booking" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">予約</a>
            <a href="#rooms" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">お部屋</a>
            <a href="#access" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">アクセス</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">English</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <section className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            天文館で過ごす、特別な夜
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">4.87</span>
                <span className="text-gray-500">· 30件のレビュー</span>
              </div>
              <span className="text-gray-500">·</span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  スーパーホスト
                </Badge>
              </div>
              <span className="text-gray-500">·</span>
              <button className="underline font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                鹿児島市、鹿児島県
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share className="w-4 h-4" />
                シェア
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                保存
              </Button>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="mb-12">
          <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
            <div className="relative">
              <div className="photo-grid">
                {propertyImages.slice(0, 5).map((img, idx) => (
                  <DialogTrigger key={idx} asChild>
                    <button
                      className="relative overflow-hidden cursor-pointer group"
                      onClick={() => setCurrentPhotoIndex(idx)}
                    >
                      <img
                        src={img}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  </DialogTrigger>
                ))}
              </div>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="absolute bottom-4 right-4 bg-white shadow-md"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  すべての写真を表示
                </Button>
              </DialogTrigger>
            </div>

            <DialogContent className="max-w-4xl p-0 bg-black">
              <div className="relative h-[80vh] flex items-center justify-center">
                <img
                  src={propertyImages[currentPhotoIndex]}
                  alt={`Property ${currentPhotoIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/20"
                  onClick={() => setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : propertyImages.length - 1)}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/20"
                  onClick={() => setCurrentPhotoIndex(prev => prev < propertyImages.length - 1 ? prev + 1 : 0)}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {currentPhotoIndex + 1} / {propertyImages.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12" id="rooms">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Property Overview */}
            <section className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    一棟貸切 · 天文館通駅から徒歩4分
                  </h2>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      最大2名
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4" />
                      ベッド2台
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      バス1
                    </span>
                  </div>
                </div>
                <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" />
                  <AvatarFallback>YB</AvatarFallback>
                </Avatar>
              </div>
            </section>

            <Separator />

            {/* Highlights */}
            <section className="py-8">
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <HomeIcon className="w-8 h-8 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">一棟まるまる貸切</h3>
                    <p className="text-gray-500 text-sm">
                      アパート全体をご利用いただけます。プライベートな空間で快適にお過ごしください。
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <Sparkles className="w-8 h-8 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">清潔さにこだわり</h3>
                    <p className="text-gray-500 text-sm">
                      このホストは、Airbnbの厳しい清掃基準を遵守しています。
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <MapPin className="w-8 h-8 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">最高のロケーション</h3>
                    <p className="text-gray-500 text-sm">
                      最近のゲストの100%がロケーションに5つ星評価をつけました。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Description */}
            <section className="py-8">
              <h2 className="text-xl font-semibold mb-4">宿泊施設について</h2>
              <div className="text-gray-700 space-y-4 leading-relaxed">
                <p>
                  天文館の中心部に位置する、全面リフォーム済みの和風モダンなアパートメントです。
                  グルメや観光の中心地で、暮らすような旅をお楽しみください。
                </p>
                <p>
                  9月にオープンしたばかりの新しいお部屋で、最大2名様までご宿泊いただけます。
                  天文館通駅から徒歩4分の好立地で、周辺には飲食店やコンビニが充実しています。
                </p>
                <p>
                  Wi-Fi完備、キッチン・調理器具完備、乾燥機付きで長期滞在にも最適です。
                  お客様のプライベート空間としてご利用ください。
                </p>
              </div>
            </section>

            <Separator />

            {/* Amenities */}
            <section className="py-8" id="amenities">
              <h2 className="text-xl font-semibold mb-6">提供されるアメニティ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3">
                    <amenity.icon className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-medium">{amenity.label}</p>
                      <p className="text-sm text-gray-500">{amenity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-6">
                アメニティをすべて表示
              </Button>
            </section>

            <Separator />

            {/* Calendar Section */}
            <section className="py-8" id="booking">
              <h2 className="text-xl font-semibold mb-2">宿泊可能日を確認</h2>
              <p className="text-gray-500 mb-6">日程を選択して空室状況をご確認ください</p>

              <div className="flex flex-col md:flex-row gap-6">
                <div>
                  <p className="text-sm font-medium mb-2">チェックイン</p>
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date: Date) => date < new Date()}
                    className="rounded-lg border"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">チェックアウト</p>
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date: Date) => date < (checkIn || new Date())}
                    className="rounded-lg border"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="booking-card bg-white">
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">スタンダードプラン</p>
                <p className="text-sm text-gray-600 mb-3">
                  最大2名様まで・完全貸切<br />
                  <span className="text-xs text-gray-400">（※3名様利用のご準備は現在進めております）</span>
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">¥{pricePerNight.toLocaleString()}</span>
                  <span className="text-gray-500">〜 / 泊（1部屋）</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  2名様でご宿泊の場合、1名様あたり ¥{Math.round(pricePerNight / 2).toLocaleString()}〜
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">4.87</span>
                <span className="text-gray-500">· 30件のレビュー</span>
              </div>

              <div className="border rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b">
                  <div className="p-3 border-r">
                    <p className="text-xs font-semibold uppercase">チェックイン</p>
                    <p className="text-sm text-gray-600">
                      {checkIn ? checkIn.toLocaleDateString('ja-JP') : '日付を選択'}
                    </p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase">チェックアウト</p>
                    <p className="text-sm text-gray-600">
                      {checkOut ? checkOut.toLocaleDateString('ja-JP') : '日付を選択'}
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold uppercase">ゲスト</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ゲスト{guests}名</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{guests}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setGuests(Math.min(2, guests + 1))}
                        disabled={guests >= 2}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full mb-4 h-12 text-base font-semibold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                予約リクエストを送信
              </Button>

              <p className="text-center text-sm text-gray-500 mb-6">
                予約確定まで料金は発生しません
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="underline">¥{pricePerNight.toLocaleString()} × {nights}泊</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">清掃料金</span>
                  <span>¥{cleaningFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">サービス料</span>
                  <span>¥{serviceFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold pt-2">
                  <span>合計（税込）</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">💡 連泊割引あり（自動適用）</span>
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 2泊：¥13,000/泊</li>
                  <li>• 3〜4泊：¥12,000/泊</li>
                  <li>• 5〜7泊：¥11,000/泊</li>
                  <li>• 8泊以上：¥10,000/泊</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Reviews Section */}
        <section className="py-8" id="reviews">
          <div className="flex items-center gap-2 mb-8">
            <Star className="w-6 h-6 fill-current" />
            <span className="text-xl font-semibold">4.87 · 30件のレビュー</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                      {review.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>

          <Button variant="outline" className="font-medium">
            30件のレビューをすべて表示
          </Button>
        </section>

        <Separator className="my-12" />

        {/* Location Section */}
        <section className="py-8" id="access">
          <h2 className="text-xl font-semibold mb-6">ロケーション</h2>
          <div className="bg-gray-100 rounded-xl h-80 mb-6 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">天文館エリア</p>
                <p className="text-gray-500 text-sm">鹿児島市千日町</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">鹿児島市千日町9-23 銀座ハイツ506号</p>
              <p className="text-gray-600 leading-relaxed">
                天文館通駅から徒歩4分。繁華街の中心にありながら、静かで快適な環境です。
                周辺にはレストラン、居酒屋、コンビニが多数あり、観光やビジネスに最適な立地です。
              </p>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Host Section */}
        <section className="py-8">
          <div className="flex items-start gap-6">
            <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" />
              <AvatarFallback className="text-xl">YB</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold">ホスト：Stay Yokaban</h2>
                <Badge className="bg-rose-500 hover:bg-rose-600">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  スーパーホスト
                </Badge>
              </div>
              <p className="text-gray-500 text-sm mb-4">2024年9月からホスティング</p>

              <div className="grid grid-cols-3 gap-4 mb-6 max-w-md">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-lg">30</p>
                  <p className="text-xs text-gray-500">レビュー</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-lg">4.87</p>
                  <p className="text-xs text-gray-500">評価</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-lg">1時間</p>
                  <p className="text-xs text-gray-500">応答時間</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                天文館で過ごす、特別な夜をお届けします。グルメや観光の中心地で、
                暮らすような旅を。お客様のプライベート空間として、快適にお過ごしいただけるよう
                心を込めて準備しております。
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  ホストに連絡
                </Button>
                <a
                  href="https://www.instagram.com/017mori"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    @017mori
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Things to Know */}
        <section className="py-8">
          <h2 className="text-xl font-semibold mb-8">注意事項</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">ハウスルール</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  チェックイン：15:00以降
                </li>
                <li className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  チェックアウト：10:00まで
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  最大宿泊人数：2名
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">安全に関する事項</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  火災報知器設置済み
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  消火器設置済み
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  セキュリティカメラなし
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">キャンセルポリシー</h3>
              <p className="text-gray-600 leading-relaxed">
                チェックイン7日前までのキャンセルで全額返金。
                それ以降のキャンセルについてはお問い合わせください。
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Stay Yokaban</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                天文館で過ごす、特別な夜
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">お問い合わせ</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  zundare.hogane017@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  @017mori
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">アクセス</h4>
              <p className="text-sm text-gray-600">
                〒892-0843<br />
                鹿児島市千日町9-23<br />
                銀座ハイツ506号
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">リンク</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition">ホーム</a></li>
                <li><a href="#booking" className="hover:text-gray-900 transition">予約</a></li>
                <li><a href="#rooms" className="hover:text-gray-900 transition">お部屋</a></li>
                <li><a href="#access" className="hover:text-gray-900 transition">アクセス</a></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2026 Stay Yokaban. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900 transition">プライバシーポリシー</a>
              <span>·</span>
              <a href="#" className="hover:text-gray-900 transition">利用規約</a>
              <span>·</span>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                日本語（JP）
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
