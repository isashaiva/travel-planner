# TravelUA 🗺️

Сервіс для планування подорожей по Україні. Обери місто на карті — отримай готовий маршрут з реальними локаціями, бюджетом та навігацією.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

## Можливості

- **Генератор маршрутів** — обери точку на карті, система підбирає реальні локації через Google Places API і будує маршрут
- **Розрахунок бюджету** — автоматичний підрахунок витрат на їжу, таксі та готель
- **Dashboard** — особистий кабінет зі збереженими маршрутами
- **Відмітки прогресу** — відмічай відвідані локації, система показує наступне місце
- **Explore** — стрічка публічних маршрутів від інших користувачів
- **Соціальні функції** — лайки, коментарі, збереження чужих маршрутів
- **Профіль** — статистика подорожей, редагування даних, зміна пароля

## Стек

- **Frontend** — React 18 + TypeScript + Vite
- **Стилі** — Tailwind CSS (glassmorphism дизайн)
- **Карти** — Google Maps API + Places API
- **Backend** — Firebase (Firestore + Authentication)
- **Auth** — Email/Password + Google OAuth

## Запуск

```bash
git clone https://github.com/your-username/travel-planner
cd travel-planner
npm install
```

Створи `.env` файл:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key
```

```bash
npm run dev
```

## Firebase

Проєкт використовує Firestore з такими колекціями:

- `routes` — маршрути користувачів
- `likes` — лайки до маршрутів
- `comments` — коментарі до маршрутів

Firestore Rules та необхідні індекси описані в `firestore.rules`.
