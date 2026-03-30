import { useState, type ReactNode } from 'react';
import { Menu, X, Smartphone } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface MobileHeaderProps {
    title: string;
    roleIcon?: ReactNode;
}

export function MobileHeader({ title, roleIcon = <Smartphone size={18} /> }: MobileHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        // Toggle sidebar and overlay
        const sidebar = document.querySelector('.gx-sidebar');
        const overlay = document.querySelector('.gx-mobile-overlay');
        sidebar?.classList.toggle('mobile-open');
        overlay?.classList.toggle('active');
    };

    return (
        <>
            <div className="gx-mobile-header">
                <div className="gx-mobile-header-left">
                    <button
                        className="gx-mobile-menu-btn"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="gx-mobile-logo">
                        {roleIcon} {title}
                    </div>
                </div>
                <ThemeToggle />
            </div>
            <div
                className="gx-mobile-overlay"
                onClick={toggleMenu}
                aria-hidden="true"
            />
        </>
    );
}
