import { useLatestSensor, useSensorHistory } from "@/hooks/use-sensors";
import { CloudRain, Activity, Move, Waves, AlertTriangle } from "lucide-react";
import { RiskBadge } from "@/components/risk-badge";
import { SensorCard } from "@/components/sensor-card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: latest, isLoading: isLatestLoading } = useLatestSensor();
  const { data: history, isLoading: isHistoryLoading } = useSensorHistory();

  if (isLatestLoading && !latest) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-card/50" />
        ))}
      </div>
    );
  }

  // Use latest data or default values if null (no data yet)
  const sensorData = latest || {
    rainfall: 0,
    soilMoisture: 0,
    tiltAngle: 0,
    loadCellWeight: 0,
    riskPercentage: 0,
    riskLevel: "SAFE",
    timestamp: new Date().toISOString()
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sensor Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring of environmental conditions</p>
        </div>
        <div className="flex items-center gap-4 bg-card/50 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="px-4 py-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Status</div>
            <RiskBadge level={sensorData.riskLevel} percentage={sensorData.riskPercentage} size="lg" />
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="px-4 py-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Last Updated</div>
            <div className="text-sm font-mono text-foreground">
              {latest ? format(new Date(sensorData.timestamp), "HH:mm:ss") : "--:--:--"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SensorCard
          title="Rainfall"
          value={sensorData.rainfall}
          unit="mm"
          icon={CloudRain}
          color="text-white"
          delay={0}
          backgroundImage="/rain-bg.jpg"
        />
        <SensorCard
          title="Soil Moisture"
          value={sensorData.soilMoisture}
          unit="%"
          icon={Waves}
          color="text-white"
          delay={100}
          backgroundImage="/soil-bg.jpg"
        />
        <SensorCard
          title="Tilt Angle"
          value={sensorData.tiltAngle}
          unit="°"
          icon={Move}
          color="text-white"
          delay={200}
          backgroundImage="/tilt-bg.jpg"
        />
        <SensorCard
          title="LOAD CELL (WEIGHT)"
          value={sensorData.loadCellWeight}
          unit="kg"
          icon={Activity}
          color="text-white"
          delay={300}
          backgroundImage="/load-bg.jpg"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2 glass-panel border-white/5">
          <CardHeader>
            <CardTitle>Historical Trends</CardTitle>
            <CardDescription>Sensor data variation over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isHistoryLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history || []}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(str) => format(new Date(str), "HH:mm")}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelFormatter={(label) => format(new Date(label), "MMM d, HH:mm:ss")}
                  />
                  <Area
                    type="monotone"
                    dataKey="soilMoisture"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMoisture)"
                    name="Soil Moisture (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rainfall"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRain)"
                    name="Rainfall (mm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
