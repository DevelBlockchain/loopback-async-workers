import {
    Home,
    Lock,
    CreditCard,
    Send,
    Shield,
    File
} from 'react-feather';

export const MENUITEMS = [
    { title: 'Dashboard', icon: Home, type: 'link', path: '/dashboard', active: false },
    { title: 'Send', icon: Send, type: 'link', path: '/dashboard/send', active: false },
    { title: 'Contracts', icon: File, type: 'link', path: '/dashboard/contracts', active: false },
    //{ title: 'Receive', icon: Inbox, type: 'link', path: '/dashboard/receive', active: false },
    { title: 'Wallet', icon: CreditCard, type: 'link', path: '/dashboard/wallet', active: false },
    //{ title: 'Users', icon: User, type: 'link', path: '/dashboard/users', active: false },
    { title: 'Access Tokens', icon: Lock, type: 'link', path: '/dashboard/tokens', active: false },
    { title: '2FA', icon: Shield, type: 'link', path: '/dashboard/2fa', active: false },
]
