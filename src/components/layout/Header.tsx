import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AccessTier, Role } from '../../types/auth';
import { MOCK_USERS } from '../../mock/users';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'border-b-2 border-indigo-700 pb-1 text-sm font-semibold text-indigo-700'
    : 'pb-1 text-sm text-gray-700 hover:text-indigo-700';

// Menu mobile: link dạng block, active nền indigo thay vì gạch chân
const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'block rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700'
    : 'block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-700';

const Header = () => {
  const { user, loginAsMock } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(-2)
    .join('');

  const navItems = [
    { to: '/landscape', label: 'Research Landscape' },
    { to: '/dashboard', label: 'Journal & Keywords' },
    { to: '/library', label: 'Saved Library' },
    ...(user.role === Role.ADMIN ? [{ to: '/admin', label: 'Admin Console' }] : []),
  ];

  const showUpgrade = user.accessTier === AccessTier.BASIC && user.role !== Role.ADMIN;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-indigo-800">
          Academic Clarity
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Hiện CTA upgrade cho user BASIC (trừ Admin, vì Admin luôn full quyền - BR-26) */}
          {showUpgrade && (
            <Link
              to="/pricing"
              className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 sm:inline-block"
            >
              Upgrade
            </Link>
          )}

          <Link to="/notifications" className="text-gray-500 hover:text-indigo-700" aria-label="Notifications">
            🔔
          </Link>

          {/* Dev-only: chuyển user để test nhanh các tổ hợp role/tier - xoá khi tích hợp backend thật */}
          <select
            aria-label="Dev user switcher"
            className="hidden rounded-md border border-gray-200 text-xs text-gray-700 lg:block"
            value={user.id}
            onChange={(e) => loginAsMock(e.target.value)}
          >
            {MOCK_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} · {u.role} · {u.accessTier}
              </option>
            ))}
          </select>

          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-xs font-semibold text-white"
          >
            {initials}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-50 hover:text-indigo-700 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="space-y-1 border-t border-gray-200 px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {showUpgrade && (
            <Link
              to="/pricing"
              onClick={() => setMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 sm:hidden"
            >
              Upgrade to Premium
            </Link>
          )}

          {/* Dev switcher cho màn hình nhỏ (bản desktop ẩn dưới lg) */}
          <select
            aria-label="Dev user switcher"
            className="mt-2 w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-700 lg:hidden"
            value={user.id}
            onChange={(e) => loginAsMock(e.target.value)}
          >
            {MOCK_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} · {u.role} · {u.accessTier}
              </option>
            ))}
          </select>
        </nav>
      )}
    </header>
  );
};

export default Header;
