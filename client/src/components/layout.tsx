import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Map as MapIcon,
  Bell,
  Menu,
  Activity,
  Radio,
  FileText
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import landslideBg from "@assets/landslide1_1771696476654.jpeg";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Live Map", icon: MapIcon },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/emergency-broadcast", label: "Emergency Broadcast", icon: Radio },
    { href: "/dispatch", label: "Dispatch", icon: FileText },
  ];

  const getBackground = () => {
    switch (location) {
      case "/":
        return `url(${landslideBg})`;
      case "/map":
        return "url('/map-bg.avif')";
      case "/alerts":
        return "url('/alert-bg.avif')";
      default:
        return "none";
    }
  };

  return (
    <SidebarProvider>
      <div
        className="min-h-screen w-full flex flex-col md:flex-row text-foreground bg-cover bg-center bg-no-repeat transition-all duration-700 brightness-110 contrast-110"
        style={{ backgroundImage: getBackground() }}
      >
        {location !== "/" && location !== "/emergency-broadcast" && (
          <div
            className={`absolute inset-0 pointer-events-none ${location === "/alerts"
              ? "bg-black/60"
              : location === "/map"
                ? "bg-black/50"
                : "bg-black/40"
              }`}
          />
        )}
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Activity className="w-6 h-6 text-primary" />
            <span>GeoSense</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card border-r border-border/50">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${location === item.href
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"}
                  `}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-border/40 bg-card/30 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">ASTEROID AI</span>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${location === item.href
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1"
                  : "hover:bg-white/5 text-muted-foreground hover:text-foreground hover:translate-x-1"}
              `}>
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${location === item.href ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border/40">
            <div className="flex items-center gap-3 px-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
