# TwoMates

A modern web application built with React, TypeScript, and Vite, designed to help users manage tasks efficiently.

## Features

- Clean, modern UI built with React 19 and Tailwind CSS
- Type-safe development with TypeScript
- Responsive design for mobile and desktop
- Supabase integration for backend services
- React Router for navigation
- React Query for data fetching

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/twomates.git
cd twomates
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Set up environment variables
   - Copy `.env` to `.env.local` and update values as needed

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally

### Project Structure

```
twomates/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images and other assets
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers
│   ├── lib/         # Utility functions and libraries
│   ├── pages/       # Page components
│   ├── App.tsx      # App component
│   └── main.tsx     # Application entry point
├── .env             # Environment variables (copy to .env.local)
├── index.html       # HTML entry point
└── vite.config.ts   # Vite configuration
```

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
