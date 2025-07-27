import {
    Users,
    Car,
    Copy,
    Bell,
    LayoutDashboard,
    User as UserIcon,
    TreePalm,
  } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavbarProps {
  isExpanded: boolean;
}

export const Navbar = ({ isExpanded }: NavbarProps) => {
    const pathname = usePathname();
    const menuItems = [
        {
          key: '/',
          icon: <LayoutDashboard size={20} />,
          label: 'Dashboard',
          href: '/',
        },
        {
          key: '/support',
          icon: <Users size={20} />,
          label: 'Support Requests',
          href: '/support',
        },
        {
          key: '/drivers',
          icon: <UserIcon size={20} />,
          label: 'Drivers',
          href: '/drivers',
        },
        {
          key: '/rides',
          icon: <Car size={20} />,
          label: 'Rides',
          href: '/rides',
        },
        {
          key: '/insurances',
          icon: <Copy size={20} />,
          label: 'Insurances',
          href: '/insurances',
        },
        {
          key: '/featured',
          icon: <TreePalm size={20} />,
          label: 'Featured Locations',
          href: '/featured',
        },
        {
          key: '/notifications',
          icon: <Bell size={20} />,
          label: 'Notifications',
          href: '/notifications',
        },
      ];
    return (
        <div className='flex items-center justify-center w-full'>
        <nav className="mt-4">
                <ul className="flex flex-col">
                  {menuItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className={`flex items-center ${isExpanded ? 'px-6' : 'px-3 justify-center'} py-3 text-gray-700 hover:bg-gray-100 transition-all duration-300 rounded-r-lg mb-1 ${pathname === item.href ? 'bg-gray-200 font-semibold' : ''}`}
                        title={!isExpanded ? item.label : undefined}
                      >
                        <span className={`${isExpanded ? 'mr-3' : ''} flex-shrink-0`}>{item.icon}</span>
                        {isExpanded && (
                          <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
        </nav>
        </div>
    )
}