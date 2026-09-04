# SafarLink - Logistics Marketplace App

A modern React Native logistics marketplace application built with Expo, allowing users to create and fulfill shipment requests across regions.

## 🚀 Features

### User Authentication
- **Welcome Screen** - Beautiful onboarding experience
- **Sign Up/Login** - Phone number and password authentication
- **OTP Verification** - Secure verification system
- **Multi-language Support** - English & Arabic with RTL support

### Core Features
- **Home Marketplace** - Browse available shipment requests
- **Create Requests** - Post new shipment requests with details
- **Real-time Chat** - Message with other users
- **Request Management** - Track and manage your requests
- **User Profile** - Manage account and preferences

### User Experience
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Optimized for all screen sizes
- **Smooth Animations** - Polished transitions and interactions
- **Accessible UI** - WCAG compliant components

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **Styling**: React Native StyleSheet (mobile-optimized)
- **Icons**: Lucide React Native
- **HTTP Client**: Axios

## 📁 Project Structure

```
app/
├── index.tsx                 # Initial routing
├── _layout.tsx              # Root layout
├── (auth)/                  # Authentication screens
│   ├── welcome.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── otp.tsx
└── (app)/                   # App screens
    ├── (tabs)/              # Tab-based navigation
    │   ├── home.tsx         # Marketplace
    │   ├── requests.tsx     # My requests
    │   ├── chat.tsx         # Conversations
    │   └── profile.tsx      # User profile
    ├── create-request.tsx   # Create new request
    ├── request/[id].tsx     # Request details
    ├── chat/[id].tsx        # Chat conversation
    └── settings.tsx         # Account settings

lib/
├── cn.ts                    # Utility functions
├── store.ts                 # Zustand state management
└── theme.ts                 # Design tokens & theme
```

## 🎨 Design System

### Colors
- **Primary**: `#1798E5` (Blue) - Main brand color
- **Accent**: `#F89A1C` (Orange) - Secondary highlight
- **Success**: `#10B981` - Positive actions
- **Error**: `#EF4444` - Destructive actions
- **Warning**: `#F59E0B` - Cautionary states

### Spacing Scale
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 32px

### Border Radius
- `sm`: 6px
- `md`: 10px
- `lg`: 14px
- `xl`: 20px
- `2xl`: 28px

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- pnpm or npm
- Expo CLI (optional: `pnpm install -g expo-cli`)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev          # Web preview
pnpm android      # Android
pnpm ios          # iOS
```

3. Open the app:
   - For web: Browser will auto-open at `http://localhost:19000`
   - For mobile: Scan QR code with Expo Go app

## 📱 Platform Support

- ✅ iOS (11+)
- ✅ Android (5+)
- ✅ Web (Browser)
- ✅ macOS
- ✅ Windows

## 🔄 Navigation Flow

```
Welcome → Login/Register → OTP → Home (Marketplace)
                                  ├── Create Request
                                  ├── View Request Details
                                  ├── Chat
                                  ├── My Requests
                                  ├── Profile
                                  └── Settings
```

## 📝 Key Screens

### Home Marketplace
- Browse available shipment requests
- Filter by available/my requests tabs
- Quick access to create new requests
- Real-time request cards with sender info

### Request Details
- Full request information
- Sender profile and rating
- Route visualization
- Package details (weight, description)
- Message and offer actions

### Chat
- Real-time messaging interface
- User avatars and status
- Message timestamps
- Unread message badges

### Profile
- User statistics (ratings, requests, reputation)
- Language and theme preferences
- Account settings
- Help and support options

## 🌍 Internationalization

The app supports English and Arabic with:
- Full RTL layout support
- Translated strings throughout
- Locale-specific formatting

Switch languages in the Profile screen or via the settings menu.

## 🔐 Security

- Phone number verification via OTP
- Session management with Zustand
- Secure password handling
- Input validation with Zod

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe, Paypal)
- [ ] Real-time location tracking
- [ ] Push notifications
- [ ] Image uploads for packages
- [ ] Advanced filtering and search
- [ ] Ratings and reviews system
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 📞 Support

For support or questions, please contact the development team.

## 📄 License

SafarLink © 2024. All rights reserved.
