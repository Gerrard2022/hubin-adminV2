import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ConfigProvider } from 'antd';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import './globals.css';

export const metadata = {
  title: 'Hubin Admin',
  description: 'Hubin Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
                  <SignInButton
                    mode="modal"
                    style={{
                      backgroundColor: '#1890ff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                    }}
                  >
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
