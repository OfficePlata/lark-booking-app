// 【ファイル概要】
// アプリケーションで使用する翻訳テキストデータ（辞書）ファイルです。
// 施設：Stay Yokaban（鹿児島市天文館）

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
    // Hero: ご指定の文言を反映
    hero: {
      title: '天文館で過ごす、特別な夜',
      subtitle: 'グルメや観光の中心地で、暮らすような旅を。お客様のためのプライベート空間です。',
      cta: '空室を検索',
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
      notesPlaceholder: 'チェックイン時間のご相談など',
      confirmation: '予約確認',
      paymentInfo: 'お支払い情報',
      // Form specific
      step1: '1. 日程の選択',
      step2: '2. お客様情報',
      guestNameLabel: 'お名前',
      guestNamePlaceholder: '例：薩摩 次郎',
      emailLabel: 'メールアドレス',
      emailPlaceholder: 'mail@example.com',
      emailDescription: '予約詳細をお送りします',
      guestsLabel: '宿泊人数',
      guestsCount: '名',
      submitButton: '予約リクエストを送信',
      submitting: '送信中...',
      successTitle: 'リクエスト送信完了',
      successMessage: '確認メールをお送りします。',
      continueBooking: '続けて予約する',
      selectDatesError: '日程を選択してください',
      requestSuccess: '予約完了',
      requestSuccessDesc: '詳細はメールをご確認ください。',
      errorTitle: 'エラー',
      errorMessage: '処理中に問題が発生しました',
      // Validation messages
      nameMinLength: 'お名前は2文字以上で入力してください',
      emailInvalid: '有効なメールアドレスを入力してください',
      guestsRequired: '人数を選択してください',
    },
    // Pricing
    pricing: {
      title: 'プラン・料金',
      baseRate: '基本料金',
      night1: '1泊',
      night2: '2連泊',
      night3plus: '3連泊以上',
      additionalGuest: '追加人数',
      perNightPerPerson: '/ 泊・人',
      taxIncluded: '税込',
      // Pricing section specific
      sectionTitle: '宿泊プラン',
      sectionSubtitle: '天文館のマンションで、気兼ねなく過ごすプライベートステイ。',
      planName: 'スタンダードプラン',
      planDescription: '最大2名様まで・完全貸切',
      planPrice: '¥10,000~', // ※実際の価格に合わせてください
      planUnit: '/泊',
      additionalGuestNote: '※現在、3名様プランを準備中です',
      discountNote: '※連泊でのご利用も歓迎しております',
      feature1: 'マンション一室貸切',
      feature2: 'Wi-Fi完備',
      feature3: 'キッチン利用可',
      feature4: 'アメニティ完備',
      feature5: '近隣コインパーキングをご利用ください',
      popularPlan: 'おすすめ',
      bookButton: '予約へ進む',
    },
    // Calendar
    calendar: {
      title: '空室状況',
      available: '予約可能',
      unavailable: '満室',
      selected: '選択中',
      today: '今日',
    },
    // Restrictions
    restrictions: {
      title: 'ご案内',
      message: '1泊からご予約いただけます。',
      availableFrom: '',
      shortStayRestricted: '',
    },
    // Confirmation
    confirmation: {
      title: 'ご予約完了',
      thankYou: 'Stay Yokabanへのご予約ありがとうございます',
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
      address: '〒892-0843 鹿児島市千日町9-23 銀座ハイツ506号',
      copyright: '© Stay Yokaban All rights reserved.',
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
    // Hero: 日本語のニュアンスに合わせて修正
    hero: {
      title: 'Stay Yokaban - Your Night in Tenmonkan',
      subtitle: 'Travel like a local in the heart of the gourmet and sightseeing district. A private space just for you.',
      cta: 'Check Availability',
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
      selectDates: 'Select Dates',
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
      notesPlaceholder: 'E.g., Check-in time inquiries',
      confirmation: 'Booking Confirmation',
      paymentInfo: 'Payment Information',
      // Form specific
      step1: '1. Select Dates',
      step2: '2. Guest Information',
      guestNameLabel: 'Full Name',
      guestNamePlaceholder: 'John Doe',
      emailLabel: 'Email Address',
      emailPlaceholder: 'mail@example.com',
      emailDescription: 'We will send details via email',
      guestsLabel: 'Number of Guests',
      guestsCount: ' guest(s)',
      submitButton: 'Request Booking',
      submitting: 'Sending...',
      successTitle: 'Request Sent',
      successMessage: 'Please check your email for confirmation.',
      continueBooking: 'Book Another Date',
      selectDatesError: 'Please select dates',
      requestSuccess: 'Booking Confirmed',
      requestSuccessDesc: 'We have sent a confirmation email.',
      errorTitle: 'Error',
      errorMessage: 'An error occurred',
      // Validation messages
      nameMinLength: 'Name must be at least 2 characters',
      emailInvalid: 'Please enter a valid email address',
      guestsRequired: 'Please select number of guests',
    },
    // Pricing
    pricing: {
      title: 'Rates',
      baseRate: 'Base Rate',
      night1: '1 Night',
      night2: '2 Nights',
      night3plus: '3+ Nights',
      additionalGuest: 'Additional Guest',
      perNightPerPerson: '/ night / person',
      taxIncluded: 'Tax included',
      // Pricing section specific
      sectionTitle: 'Accommodation Plans',
      sectionSubtitle: 'Your private base in downtown Kagoshima. Enjoy a local living experience.',
      planName: 'Standard Plan',
      planDescription: 'Private apartment for up to 2 guests',
      planPrice: '¥10,000~',
      planUnit: '/night',
      additionalGuestNote: '*Plan for 3 guests is currently in preparation.',
      discountNote: '*Longer stays are welcome.',
      feature1: 'Entire Apartment',
      feature2: 'Free Wi-Fi',
      feature3: 'Kitchen Available',
      feature4: 'Amenities Included',
      feature5: 'Nearby Coin Parking Only',
      popularPlan: 'Recommended',
      bookButton: 'Book Now',
    },
    // Calendar
    calendar: {
      title: 'Availability',
      available: 'Available',
      unavailable: 'Booked',
      selected: 'Selected',
      today: 'Today',
    },
    // Restrictions
    restrictions: {
      title: 'Information',
      message: 'We welcome bookings starting from 1 night.',
      availableFrom: '',
      shortStayRestricted: '',
    },
    // Confirmation
    confirmation: {
      title: 'Booking Complete',
      thankYou: 'Thank you for choosing Stay Yokaban',
      reservationId: 'Reservation ID',
      details: 'Details',
      receipt: 'Receipt',
      downloadReceipt: 'Download Receipt',
      emailSent: 'Confirmation email sent',
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
      address: '#506 Ginza Heights, 9-23 Sennichi-cho, Kagoshima City',
      copyright: '© Stay Yokaban All rights reserved.',
    },
  },
} as const

export type TranslationKeys = typeof translations.ja
