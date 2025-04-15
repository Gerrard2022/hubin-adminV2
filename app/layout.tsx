import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ConfigProvider } from 'antd';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import './globals.css';
import { initializeCronJob } from './cron-init';

export const metadata = {
  title: 'Hubin Admin',
  description: 'Hubin Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize the cron job when the app starts
  if (typeof window === 'undefined') {
    // Only run on the server side
    initializeCronJob();
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, backgroundColor: '#f9f9f9' }}>
          <StyledComponentsRegistry>
            <ConfigProvider>
              <nav
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: '1rem',
                  zIndex: 1000,
                }}
              >
                <SignedOut>
                  <SignInButton mode="modal">
                    Sign In
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: {
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        },
                      },
                    }}
                  />
                </SignedIn>
              </nav>
              <main style={{ padding: '2rem' }}>{children}</main>
            </ConfigProvider>
          </StyledComponentsRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
