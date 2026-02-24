import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAlerts } from "@/hooks/use-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { Bell, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Alert } from "@shared/schema";
import { ws } from "@shared/routes";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const { data: initialAlerts, isLoading } = useAlerts();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Sync initial data
  useEffect(() => {
    if (initialAlerts) {
      setAlerts(initialAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  }, [initialAlerts]);

  // WebSocket connection
  useEffect(() => {
    const socket = io(window.location.origin, {
      path: "/socket.io",
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket for alerts');
    });

    socket.on('newAlert', (alert: any) => {
      try {
        // Validate incoming alert matches schema structure roughly
        // In a real app we'd fully parse it with zod, but here we just append for UI speed
        setAlerts(prev => [alert, ...prev]);

        // Also invalidate query to keep sync
        queryClient.invalidateQueries({ queryKey: [api.alerts.list.path] });
      } catch (e) {
        console.error("Failed to parse incoming alert", e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const filteredAlerts = alerts.filter(alert =>
    alert.message.toLowerCase().includes(search.toLowerCase()) ||
    alert.locationName.toLowerCase().includes(search.toLowerCase())
  );

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "HIGH": return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case "MODERATE": return <Bell className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getBorderColor = (level: string) => {
    switch (level) {
      case "HIGH": return "border-l-4 border-l-red-500 bg-red-500/5";
      case "MODERATE": return "border-l-4 border-l-amber-500 bg-amber-500/5";
      default: return "border-l-4 border-l-emerald-500 bg-emerald-500/5";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
          <p className="text-muted-foreground mt-1">Real-time notifications and anomaly detection</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-9 bg-card/50 border-white/10 focus:border-primary/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-card/30 backdrop-blur-sm shadow-2xl flex flex-col">
        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</span>
          <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono font-bold">
            {alerts.length} Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth" ref={scrollRef}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-lg bg-card/50 animate-pulse" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <Bell className="w-12 h-12 mb-4" />
              <p>No alerts found</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    onClick={() =>
                      navigate(
                        `/emergency-broadcast?location=${encodeURIComponent(
                          alert.locationName
                        )}&risk=${alert.riskLevel}`
                      )
                    }
                    className={cn(
                      "border-0 shadow-lg transition-all duration-200 hover:translate-x-1 cursor-pointer",
                      getBorderColor(alert.riskLevel)
                    )}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="mt-1 p-2 rounded-full bg-background border border-border shadow-sm">
                        {getAlertIcon(alert.riskLevel)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-foreground">{alert.locationName}</h4>
                          <span className="text-xs font-mono text-muted-foreground">
                            {format(new Date(alert.timestamp), "MMM d, HH:mm:ss")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="pt-2">
                          <RiskBadge level={alert.riskLevel} size="sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
