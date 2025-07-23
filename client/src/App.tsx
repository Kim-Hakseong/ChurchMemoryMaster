import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalStorage } from "@/lib/storage";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Calendar from "@/pages/calendar";
import AgeGroup from "@/pages/age-group";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AgeGroup />} />
      <Route path="/age-group/:group" component={AgeGroup} />
      <Route path="/calendar" component={Calendar} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // 앱 시작시 초기 데이터 로드
  LocalStorage.initializeData();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="w-full min-h-screen bg-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(135deg, hsl(251, 82%, 67%, 0.05), transparent, hsl(166, 73%, 45%, 0.05))'}}></div>
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
