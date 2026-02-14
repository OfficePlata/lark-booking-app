// 【ファイル概要】
// アプリケーションで使用する翻訳テキストデータ（辞書）ファイルです。
// 日本語（ja）と英語（en）のテキストリソースをオブジェクト形式で管理します。

export type Locale = 'ja' | 'en'

export const translations = {
  ja: {
    // Navigation
    nav: {
      home: 'ホーム',
      booking: '予約',
      rooms: 'お部屋',
      access: 'アクセス',
    },
    // Hero
    hero: {
      title: '特別な時間を、特別な場所で',
      subtitle: '自然に囲まれた静かな空間で、心からのくつろぎをお届けします',
      cta: '予約する',
    },
    // Booking Form
    booking: {
      title: 'ご予約',
      checkIn: 'チェックイン',
      checkOut: 'チェックアウト',
      guests: '人数',
      guestUnit: '名',
      nights: '泊',
      nightsStay: '泊のご宿泊',
      selectDates: '日付を選択してください',
      totalAmount: '合計金額',
      basePrice: '基本料金',
      additionalGuest: '追加人数料金',
      perNight: '/ 泊',
      perPerson: '/ 人',
      reserve: '予約を確定する',
      reserveAndPay: 'お支払いへ進む',
      guestName: 'お名前',
      email: 'メールアドレス',
      phone: '電話番号',
      notes: 'ご要望',
      notesPlaceholder: '特別なリクエストがあればご記入ください',
      confirmation: '予約確認',
      paymentInfo: 'お支払い情報',
    },
    // Pricing
    pricing: {
      title: '料金案内',
      baseRate: '基本料金（1室2名まで）',
      night1: '1泊',
      night2: '2連泊',
      night3plus: '3連泊以上',
      additionalGuest: '追加人数（3名様以上）',
      perNightPerPerson: '/ 泊・人',
      taxIncluded: '税込',
    },
    // Calendar
    calendar: {
      title: '空室カレンダー',
      available: '予約可能',
      unavailable: '予約不可',
      selected: '選択中',
      today: '今日',
    },
    // Restrictions
    restrictions: {
      title: '予約制限について',
      message: '現在、3連泊以上のご予約のみ承っております。',
      availableFrom: 'より、1泊・2泊のご予約も可能になります。',
      shortStayRestricted: '1泊・2泊のご予約は制限されています',
    },
    // Confirmation
    confirmation: {
      title: 'ご予約完了',
      thankYou: 'ご予約ありがとうございます',
      reservationId: '予約番号',
      details: '予約詳細',
      receipt: '領収書',
      downloadReceipt: '領収書をダウンロード',
      emailSent: '確認メールをお送りしました',
    },
    // Payment
    payment: {
      title: 'お支払い',
      cardNumber: 'カード番号',
      expiry: '有効期限',
      cvv: 'セキュリティコード',
      processing: '処理中...',
      success: '決済完了',
      error: '決済エラーが発生しました',
      retry: 'もう一度お試しください',
    },
    // Common
    common: {
      close: '閉じる',
      back: '戻る',
      next: '次へ',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      yen: '円',
    },
    // Footer
    footer: {
      contact: 'お問い合わせ',
      instagram: 'Instagram',
      address: '所在地',
      copyright: 'All rights reserved.',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      booking: 'Book',
      rooms: 'Rooms',
      access: 'Access',
    },
    // Hero
    hero: {
      title: 'A Special Place for Special Moments',
      subtitle: 'Experience true relaxation in a serene space surrounded by nature',
      cta: 'Book Now',
    },
    // Booking Form
    booking: {
      title: 'Reservation',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guests: 'Guests',
      guestUnit: '',
      nights: 'night',
      nightsStay: ' night stay',
      selectDates: 'Please select dates',
      totalAmount: 'Total Amount',
      basePrice: 'Base Price',
      additionalGuest: 'Additional Guest Fee',
      perNight: '/ night',
      perPerson: '/ person',
      reserve: 'Confirm Reservation',
      reserveAndPay: 'Proceed to Payment',
      guestName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      notes: 'Special Requests',
      notesPlaceholder: 'Please enter any special requests',
      confirmation: 'Booking Confirmation',
      paymentInfo: 'Payment Information',
    },
    // Pricing
    pricing: {
      title: 'Pricing',
      baseRate: 'Base Rate (up to 2 guests)',
      night1: '1 Night',
      night2: '2 Nights',
      night3plus: '3+ Nights',
      additionalGuest: 'Additional Guest (3rd guest onwards)',
      perNightPerPerson: '/ night / person',
      taxIncluded: 'Tax included',
    },
    // Calendar
    calendar: {
      title: 'Availability Calendar',
      available: 'Available',
      unavailable: 'Unavailable',
      selected: 'Selected',
      today: 'Today',
    },
    // Restrictions
    restrictions: {
      title: 'Booking Restrictions',
      message: 'Currently, only reservations of 3 nights or more are accepted.',
      availableFrom: ', bookings for 1-2 nights will become available.',
      shortStayRestricted: '1-2 night stays are currently restricted',
    },
    // Confirmation
    confirmation: {
      title: 'Booking Complete',
      thankYou: 'Thank you for your reservation',
      reservationId: 'Reservation ID',
      details: 'Reservation Details',
      receipt: 'Receipt',
      downloadReceipt: 'Download Receipt',
      emailSent: 'A confirmation email has been sent',
    },
    // Payment
    payment: {
      title: 'Payment',
      cardNumber: 'Card Number',
      expiry: 'Expiry Date',
      cvv: 'Security Code',
      processing: 'Processing...',
      success: 'Payment Complete',
      error: 'Payment error occurred',
      retry: 'Please try again',
    },
    // Common
    common: {
      close: 'Close',
      back: 'Back',
      next: 'Next',
      loading: 'Loading...',
      error: 'An error occurred',
      yen: 'JPY',
    },
    // Footer
    footer: {
      contact: 'Contact',
      instagram: 'Instagram',
      address: 'Address',
      copyright: 'All rights reserved.',
    },
  },
} as const

export type TranslationKeys = typeof translations.ja
