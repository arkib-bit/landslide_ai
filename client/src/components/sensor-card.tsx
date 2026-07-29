import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SensorCardProps {
  title: string;
  value: number | boolean;
  unit?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  color?: string;
  delay?: number;
  backgroundImage?: string;   // ✅ NEW
}

export function SensorCard({
  title,
  value,
  unit,
  icon: Icon,
  trend = "stable",
  color = "text-primary",
  delay = 0,
  backgroundImage
}: SensorCardProps) {
  return (
    <div
      className="group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card
        className={cn(
          "glass-panel border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden relative",
          backgroundImage
            ? "text-white"
            : "bg-gradient-to-br from-card to-card/50 hover:from-card/80 hover:to-card"
        )}
      >

        <div className={cn("absolute top-0 right-0 p-24 opacity-[0.03] transition-transform duration-700 group-hover:scale-110", color)}>
          <Icon className="w-full h-full" />
        </div>
        {backgroundImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center brightness-90 contrast-110"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-black/35" />
          </>
        )}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {title}
          </CardTitle>
          <div
            className={cn(
              "p-2 rounded-lg transition-all duration-300",
              backgroundImage
                ? "bg-black/50 backdrop-blur-sm shadow-md"
                : "bg-white/5 group-hover:bg-white/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
                backgroundImage ? "text-white" : color
              )}
            />
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div
            className="text-3xl font-bold font-mono tracking-tight flex items-baseline gap-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{ WebkitTextStroke: "0.5px black" }}
          >
            {
              typeof value === "number"
                ? value.toFixed(2)
                : value === true
                  ? "🌧 Rain"
                  : "☀️ Sunny"
            }
            {typeof value === "number" && unit && (
              <span
                className="text-sm font-normal ml-1 font-sans text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
                style={{ WebkitTextStroke: "0.3px black" }}
              >
                {unit}
              </span>
            )}
          </div>
          <div className="h-1 w-full bg-secondary mt-4 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-out rounded-full opacity-60 group-hover:opacity-100",
                backgroundImage
                  ? typeof value === "boolean"
                    ? value
                      ? "bg-blue-500"
                      : "bg-yellow-400"
                    : title === "Soil Moisture"
                      ? "bg-emerald-500"
                      : title === "Tilt Angle"
                        ? "bg-amber-500"
                        : title === "LOAD CELL (WEIGHT)"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                  : color.replace("text-", "bg-")
              )}
              style={{
                width:
                  typeof value === "number"
                    ? `${Math.min(Math.max(value, 0), 100)}%`
                    : value
                      ? "100%"
                      : "0%"
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
