import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
