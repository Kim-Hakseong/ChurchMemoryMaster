import { Baby, Users, GraduationCap, Calendar, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const tabs = [
    { path: "/home",          icon: Home,           label: "메인" },
    { path: "/kindergarten",  icon: Baby,           label: "유치" },
    { path: "/elementary",    icon: Users,          label: "초등" },
    { path: "/youth",         icon: GraduationCap,  label: "중고등" },
    { path: "/calendar",      icon: Calendar,       label: "캘린더" },
  ];

  return (
    <div
      data-bottom-nav
      className="fixed left-1/2 z-40 pointer-events-none"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        transform: 'translateX(-50%)',
      }}
    >
      <nav
        className="liquid-glass pointer-events-auto flex items-center"
        style={{
          padding: '6px',
          borderRadius: '32px',
          gap: '2px',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path
            || (tab.path === '/kindergarten' && location === '/');

          const className = `flex items-center justify-center transition-all duration-200 relative z-10 ${isActive ? 'nav-tab-active-glass' : ''}`;
          const style = {
            width: '52px',
            height: '44px',
            borderRadius: '22px',
            color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
          };

          // 활성 탭은 navigation 대신 커스텀 이벤트 발행
          // → age-group 페이지에서 카드 뒤집기 모드 토글에 사용
          if (isActive) {
            return (
              <button
                key={tab.path}
                type="button"
                aria-label={tab.label}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('age-group-tab-reclick', { detail: { path: tab.path } })
                  );
                }}
                className={className}
                style={style}
              >
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </button>
            );
          }

          return (
            <Link key={tab.path} href={tab.path}>
              <a aria-label={tab.label} className={className} style={style}>
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
