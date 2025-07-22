import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Baby, GraduationCap, Users } from "lucide-react";
import { Link } from "wouter";

const navItems = [
  { path: "/age-group/kindergarten", icon: Baby, label: "유치부", id: "kindergarten" },
  { path: "/age-group/elementary", icon: Users, label: "초등부", id: "elementary" },
  { path: "/age-group/youth", icon: GraduationCap, label: "중‧고등부", id: "youth" },
  { path: "/calendar", icon: Calendar, label: "캘린더", id: "calendar" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-3 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.id === "kindergarten" && location === "/");
          const Icon = item.icon;
          
          return (
            <Link key={item.id} href={item.path} className="relative">
              <motion.button
                className={`nav-button ${
                  isActive ? "nav-button-active" : "nav-button-inactive"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`} />
                <span className={`text-xs font-medium ${
                  isActive ? "text-primary" : "text-gray-500"
                }`}>
                  {item.label}
                </span>
              </motion.button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
