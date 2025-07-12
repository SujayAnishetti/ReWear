#Problem Statement - ReWear

#Team Name - Mustard

- Sujay Anishetti - sujayanishetti22@gmail.com
- Sai Ajit BHavaraju - saiajit.b@gmail.com
- Yashwanth Adarsh Pavani - yashwanthadarsh2005@gmail.com
- Akhil Vipparla - akhil.vipparla@gmail.com



- Video demo : https://drive.google.com/drive/folders/1SPOpvccZ2YQziVh8Jr2CPfTS7_5N0Cgk?usp=sharing 


# ReWear - Sustainable Fashion Exchange Platform

A modern web application for exchanging and trading pre-owned clothing items using a points-based system. Built with React, TypeScript, Supabase, and Razorpay payment integration.

![ReWear Logo](https://img.shields.io/badge/ReWear-Sustainable%20Fashion-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-orange)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-purple)

## 🌟 Features

### 👕 Core Functionality
- **Item Listing**: Upload and list clothing items with photos, descriptions, and point values
- **Browse & Search**: Discover items by category, condition, and size
- **Points System**: Earn and spend points to exchange items
- **User Profiles**: Manage your wardrobe, points balance, and transaction history
- **Swap Requests**: Send and manage swap requests between users

### 💳 Payment Integration
- **Razorpay Gateway**: Secure payment processing for purchasing points
- **Multiple Packages**: Choose from 4 different point packages (100-1000 points)
- **Webhook Integration**: Automatic points addition after successful payments
- **Demo Mode**: Test the platform without real payments

### 🔐 Authentication & Security
- **Supabase Auth**: Secure user authentication and registration
- **Row Level Security**: Database-level security policies
- **Profile Management**: User profiles with ratings and swap history

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Tailwind CSS**: Beautiful, modern styling
- **Dark/Light Mode**: Adaptive color schemes
- **Loading States**: Smooth user experience with loading indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Razorpay account (optional for demo mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   
   # Optional: Razorpay for real payments
   VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
   VITE_RAZORPAY_KEY_SECRET=your_test_secret_key
   ```

4. **Set up database**
   - Go to your Supabase Dashboard
   - Run the SQL from `supabase/migrations/20250712092525_quick_peak.sql`
   - Run the additional migration: `supabase/migrations/20250712092526_add_points_purchase.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🧪 Demo Credentials

Test the platform with these pre-configured accounts:

- **Demo User**: `demo@rewear.com` / `password123`
- **Admin User**: `admin@rewear.com` / `admin123`

## 💰 Points Packages

| Package | Points | Price (INR) | Description |
|---------|--------|-------------|-------------|
| Basic | 100 | ₹199 | Perfect for getting started |
| Popular | 250 | ₹449 | Most popular choice |
| Premium | 500 | ₹799 | Best value for money |
| VIP | 1000 | ₹1499 | For serious fashion enthusiasts |

## 🔧 Configuration

### Supabase Setup

1. **Create a new Supabase project**
2. **Get your project URL and anon key** from Settings → API
3. **Run database migrations** in the SQL Editor
4. **Configure Row Level Security** (already included in migrations)

### Razorpay Integration (Optional)

1. **Create Razorpay account** at [dashboard.razorpay.com](https://dashboard.razorpay.com/)
2. **Get API keys** from Settings → API Keys
3. **Add environment variables** (see above)
4. **Set up webhooks** (see `RAZORPAY_WEBHOOK_SETUP.md`)

## 📁 Project Structure

```
project/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── lib/               # Utility functions and API calls
│   ├── pages/             # Page components
│   └── main.tsx           # App entry point
├── supabase/
│   ├── functions/         # Edge Functions
│   └── migrations/        # Database migrations
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables** in Vercel dashboard
4. **Deploy automatically**

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
VITE_RAZORPAY_KEY_SECRET=your_live_secret_key
```

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Authentication**: Secure user sessions
- **Payment Security**: Razorpay's bank-level security
- **Webhook Verification**: Secure payment confirmation
- **Input Validation**: Client and server-side validation

## 📊 Database Schema

### Core Tables
- **profiles**: User information and points
- **items**: Clothing items for exchange
- **transactions**: Points and item transactions
- **swap_requests**: User-to-user swap requests
- **categories**: Item categories

### Key Features
- **Points System**: Track user point balances
- **Transaction History**: Complete audit trail
- **User Ratings**: Community feedback system
- **Item Status**: Track item availability

## 🎯 Use Cases

### For Users
- **Declutter**: List unwanted clothing items
- **Discover**: Find unique fashion pieces
- **Earn**: Get points for your listings
- **Shop**: Use points to get new items

### For Admins
- **Monitor**: Track all transactions and users
- **Manage**: Handle disputes and issues
- **Analytics**: View platform statistics

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement changes
   - Test thoroughly
   - Submit pull request

2. **Database Changes**
   - Create migration file
   - Test locally
   - Deploy to staging
   - Deploy to production

3. **Payment Integration**
   - Test with Razorpay test keys
   - Verify webhook functionality
   - Deploy with live keys

## 🆘 Troubleshooting

### Common Issues

**White Screen on Load**
- Check environment variables
- Verify Supabase connection
- Check browser console for errors

**Payment Issues**
- Verify Razorpay keys
- Check webhook configuration
- Review Edge Function logs

**Database Errors**
- Run migrations
- Check RLS policies
- Verify user permissions

### Getting Help

1. **Check the documentation** in `/docs` folder
2. **Review environment setup** in `ENVIRONMENT_SETUP.md`
3. **Check Razorpay setup** in `RAZORPAY_WEBHOOK_SETUP.md`
4. **Open an issue** on GitHub

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the backend infrastructure
- **Razorpay** for payment processing
- **React** and **TypeScript** for the frontend framework
- **Tailwind CSS** for styling
- **Vercel** for deployment

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Open an issue on GitHub

---

**ReWear** - Making fashion sustainable, one swap at a time! 🌱👕
