# TwoMates E-commerce Platform

A modern e-commerce platform built with React, TypeScript, Supabase, and integrated with Printful for print-on-demand products and PayPal for payments.

*Updated: October 2025*

## Features

- 🛍️ Modern e-commerce interface
- 🎨 Print-on-demand products via Printful integration
- 💳 PayPal payment processing
- 👤 User authentication and account management
- 🛒 Shopping cart functionality
- 📱 Responsive design with dark/light theme
- 🔄 Real-time inventory management

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Printful Configuration
VITE_PRINTFUL_API_KEY=your_printful_api_key_here

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
VITE_PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
VITE_PAYPAL_ENVIRONMENT=sandbox

# OAuth Provider Redirect URI (optional)
VITE_PROVIDER_REDIRECT_URI=http://localhost:5173
```

### Getting API Keys

1. **Supabase**: Create a project at [supabase.com](https://supabase.com)
2. **Printful**: Get API key from [Printful Developer Portal](https://developers.printful.com/)
3. **PayPal**: Create an app at [PayPal Developer](https://developer.paypal.com/)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Printful Product Sync

To sync products from Printful to your database:

```bash
npm run sync-printful
```

## Order Flow

1. **Cart Management**: Users add products to cart
2. **Checkout**: Shipping information collection
3. **Payment**: PayPal integration for secure payments
4. **Order Processing**: Automatic order creation in Printful
5. **Fulfillment**: Printful handles printing and shipping

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: PayPal SDK
- **Print-on-Demand**: Printful API
- **Build Tool**: Vite
- **State Management**: React Context
- **Styling**: Tailwind CSS with custom theme

## Technologies

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query)
- [Supabase](https://supabase.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Headless UI](https://headlessui.com/)

## Deployment

This application can be deployed to any platform that supports static site hosting, such as Vercel, Netlify, or GitHub Pages.

## License

[MIT](LICENSE)
