# Test Sidebar - Modern Next.js Application

A sophisticated Next.js application featuring a modern sidebar navigation system, authentication, and a beautiful UI built with the latest web technologies.

## 🚀 Features

- **Modern Sidebar Navigation**: Collapsible sidebar with nested navigation items, project switching, and user management
- **Authentication System**: Complete auth flow with Supabase integration (login, signup, password reset)
- **Responsive Design**: Mobile-first design with adaptive sidebar behavior
- **Dark/Light Theme**: Theme switching with system preference detection
- **Modern UI Components**: Built with Radix UI primitives and custom Tailwind CSS styling
- **TypeScript**: Full type safety throughout the application
- **Performance Optimized**: Uses Next.js 15 with Turbopack for fast development and builds

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design system
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Authentication**: [Supabase](https://supabase.com/) for auth and database
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- **Package Manager**: [pnpm](https://pnpm.io/) (recommended)

## 📁 Project Structure

```
test-sidebar/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix-based)
│   ├── app-sidebar.tsx   # Main sidebar component
│   └── auth-*.tsx        # Authentication components
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client configuration
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-sidebar
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production with Turbopack
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Other Platforms

The application can be deployed to any platform that supports Next.js:

```bash
pnpm build
pnpm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.