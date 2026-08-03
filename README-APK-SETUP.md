# Fleetpro TMS — APK বিল্ড সেটআপ গাইড

## ১. রিপোতে ফাইল বসানো

আপনার `Fleetpro` রিপোর **রুট ফোল্ডারে** এই ফাইল/ফোল্ডারগুলো বসান:

```
Fleetpro/
├── .github/
│   └── workflows/
│       └── build-apk.yml
├── src/
│   ├── main.jsx
│   ├── index.css
│   └── TransportManagementApp.jsx   ← আপনার আপলোড করা ফাইলটি এখানে রাখুন
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── capacitor.config.json
└── .gitignore
```

**গুরুত্বপূর্ণ:** আপনার `TransportManagementApp.jsx` ফাইলটি অবশ্যই `src/` ফোল্ডারের ভেতরে রাখতে হবে, কারণ `main.jsx` সেখান থেকেই ইমপোর্ট করছে।

## ২. GitHub-এ পুশ করা

```bash
git clone https://github.com/hassanahamed1988/Fleetpro.git
cd Fleetpro

# উপরের ফাইলগুলো এখানে কপি করুন, তারপর:
git add .
git commit -m "APK build configuration যোগ করা হলো"
git push origin main
```

## ৩. স্বয়ংক্রিয় APK বিল্ড (GitHub Actions)

পুশ করার পর GitHub নিজে থেকেই APK বিল্ড করবে:

1. আপনার রিপোতে যান → **Actions** ট্যাবে ক্লিক করুন
2. "Build Android APK" ওয়ার্কফ্লো রান হতে দেখবেন (কয়েক মিনিট সময় লাগবে)
3. রান শেষ হলে, সেই রানের পেজে নিচের দিকে **Artifacts** সেকশনে `fleetpro-tms-apk` নামে একটা ZIP পাবেন
4. ডাউনলোড করে আনজিপ করলে `app-debug.apk` পাবেন — এটাই আপনার ইনস্টলযোগ্য APK

## ৪. লোকালি নিজের কম্পিউটারে বিল্ড করতে চাইলে (ঐচ্ছিক)

প্রয়োজন: Node.js 20+, JDK 17, Android SDK

```bash
npm install
npx cap add android      # প্রথমবার একবার
npm run android:build
```

APK পাবেন: `android/app/build/outputs/apk/debug/app-debug.apk`

## ৫. রিলিজ (সাইনড) APK চাইলে

উপরের workflow টি **debug APK** বানায় (টেস্টিং-এর জন্য যথেষ্ট, ইনস্টল করা যায় সরাসরি)। 
Play Store-এ আপলোড করার মতো **signed release APK** লাগলে জানাবেন — সাইনিং কী (keystore) সেটআপসহ আলাদা workflow বানিয়ে দেব।

## নোট
- অ্যাপের আইকন/নাম পরিবর্তন করতে `capacitor.config.json`-এ `appName` ও `appId` এডিট করুন
- `appId` (যেমন `com.fleetpro.tms`) একবার সেট করলে পরে না বদলানোই ভালো — নাহলে আপডেট ইনস্টলে সমস্যা হতে পারে
