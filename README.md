# THE SYSTEM (React + Vite + Capacitor Android)

Terminal temalı, offline-first Life OS uygulaması.

## Kurulum

```bash
npm install
npm run dev
```

## Android Kurulum (Gerçek Uygulama)

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio içinden:

- **APK**: Build > Build Bundle(s) / APK(s) > Build APK(s)
- **AAB**: Build > Generate Signed Bundle / APK > Android App Bundle

## Yerel Bildirim Mantığı

- Görev oluşturulunca 3 ayrı local notification planlanır:
  1. Deadline -60 dakika
  2. Deadline anı
  3. Deadline +1 dakika (başarısızlık)
- Uygulama açılışında tüm aktif görevler taranır ve bildirimler yeniden planlanır (failsafe).
- Deadline geçtiyse ve görev tamamlanmadıysa HP cezası bir kez uygulanır.
