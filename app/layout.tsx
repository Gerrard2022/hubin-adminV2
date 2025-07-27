import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: 'Hubin Admin',
  description: 'Hubin Admin Dashboard',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 
 return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, backgroundColor: '#f9f9f9' }}>
          <nav
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '1rem',
              zIndex: 1000,
            }}
          >          
          </nav>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
