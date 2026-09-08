# 📱 Smart Artisan Mobile (Flutter App)
### Native Android & iOS Mobile Client for SIH26090 (Team Bro Code)

This folder contains the native **Flutter** cross-platform mobile application corresponding to **Slide 3** of the Smart India Hackathon presentation:
> *"Tech Stack: Mobile App & Frontend: Flutter, SQLite"*

---

## 🌟 Key Features

1. **Multilingual Speech Input (Bhashini / Whisper)**: Allows rural artisans to speak product details in Hindi, Bengali, Tamil, and English with live waveform visualizer.
2. **On-Device Vision Scanner (TF-Lite & YOLOv8)**: Real-time viewfinder with laser sweep, bounding box detection, and bilateral symmetry/density evaluation.
3. **Heritage Pricing Engine**: Living wage calculator featuring sliders for raw materials, labor hours, and artisan skill tier.
4. **ONDC Multi-Channel Sync**: 1-click broadcast to India's national Open Network for Digital Commerce and WhatsApp storefront.
5. **Offline-First SQLite Resiliency**: Local device storage using `sqflite` guaranteeing zero data loss in remote areas with patchy cellular networks.

---

## 🚀 How to Run the Flutter App

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (version 3.2.0 or higher)
- Android Studio / Android SDK (with emulator or connected physical Android phone)

### Step 1: Install Dependencies
```bash
cd artisan_companion_mobile
flutter pub get
```

### Step 2: Configure Backend IP
In `lib/services/api_service.dart`, the default base URL is:
- **Android Emulator**: `http://10.0.2.2:8000/api/v1`
- **Physical Phone on Wi-Fi**: Change `10.0.2.2` to your computer's local Wi-Fi IP address (e.g., `http://192.168.1.100:8000/api/v1`).

Make sure your FastAPI backend is running:
```bash
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Step 3: Run on Device / Emulator
```bash
flutter run
```

### Step 4: Build Release Android APK
```bash
flutter build apk --release
```
The installable APK will be output at:
`build/app/outputs/flutter-apk/app-release.apk`
