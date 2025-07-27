
import Image from "next/image";
import { UserButton, SignedIn, } from "@clerk/nextjs";

export const TopNav = () => {
    return (
        <div className="flex items-center justify-center fixed top-0 w-full">
        <div className="flex items-center justify-between w-[99%] rounded-md mt-1 mb-4 bg-white">
            <div className="flex items-center space-x-2 px-4 py-4">
                <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                        src="/logo.jpg"
                        alt="Hubin Logo"
                        fill
                        className="object-contain rounded-full"
                    />
                </div>
                <span className={`font-bold text-black transition-opacity duration-300 whitespace-nowrap`}>
                    HUBIN ADMIN
                </span>
            </div>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      marginRight: '1rem',
                    },
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
        </div>
        </div>
    )
}