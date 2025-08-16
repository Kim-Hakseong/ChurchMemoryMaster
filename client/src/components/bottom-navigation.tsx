import { Baby, Users, GraduationCap, Calendar, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const tabs = [
    {
      path: "/kindergarten",
      icon: Baby,
      label: "유치부",
    },
    {
      path: "/elementary",
      icon: Users,
      label: "초등부",
    },
    {
      path: "/home",
      icon: Home,
      label: "메인화면",
    },
    {
      path: "/youth",
      icon: GraduationCap,
      label: "중고등부",
    },
    {
      path: "/calendar",
      icon: Calendar,
      label: "캘린더",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-2 py-3 z-40" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Link key={tab.path} href={tab.path}>
              <a className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}>
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
