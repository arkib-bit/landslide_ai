import { useEffect, useState } from "react";

export default function DispatchPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [selectedAlertId, setSelectedAlertId] = useState("");
    const [locationName, setLocationName] = useState("");
    const [riskLevel, setRiskLevel] = useState("");
    const [message, setMessage] = useState("");
    const [dispatchTo, setDispatchTo] = useState("");
    const [incidentCoords] = useState(() => ({
        lat: 24.844539,      // Langol Hills
        lng: 93.9037217
    }));
    // 🔥 Fetch alerts when page loads
    useEffect(() => {
        const fetchAlerts = async () => {
            const res = await fetch("/api/alerts");
            const data = await res.json();
            setAlerts(data);

            if (data.length > 0) {
                const latestAlert = data[0]; // alerts already sorted by newest
                setLocationName(latestAlert.locationName);
                setRiskLevel(latestAlert.riskLevel);
                setMessage(latestAlert.message);
            }
        };

        fetchAlerts();
    }, []);

    // 🔥 When selecting alert → auto fill
    const handleSelectAlert = (id: string) => {
        setSelectedAlertId(id);

        const selected = alerts.find((a) => a.id.toString() === id);

        if (selected) {
            setLocationName(selected.locationName);
            setRiskLevel(selected.riskLevel);
            setMessage(selected.message);
        }
    };

    const handleDispatch = async () => {
        if (!locationName || !dispatchTo) {
            alert("Please select incident and authority");
            return;
        }

        const response = await fetch("/api/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                locationName,
                riskLevel,
                latitude: incidentCoords.lat,
                longitude: incidentCoords.lng,
                message,
                dispatchTo
            }),
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "Dispatch_Report.pdf";
        a.click();
    };
    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

                {/* LEFT PANEL — DISPATCH CONTROL */}
                <div className="bg-white text-black rounded-2xl shadow-2xl p-6 space-y-6">

                    <h2 className="text-xl font-bold">Dispatch Control</h2>

                    {/* Selected Incident */}
                    <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-sm font-semibold">Selected Incident</p>
                        <p className="font-bold text-lg">{locationName || "Select an alert"}</p>
                        <p className="text-sm text-gray-500">
                            Risk: {riskLevel}
                        </p>
                    </div>

                    {/* Available Responders */}
                    <div className="space-y-4">
                        {[
                            {
                                name: "Lamphel Police Station",
                                type: "Police",
                                personnel: 20,
                                baseLat: 24.8198974,
                                baseLng: 93.9249237
                            },
                            {
                                name: "AR Transit Camp",
                                type: "Government",
                                personnel: 15,
                                baseLat: 24.8161502,
                                baseLng: 93.9496386
                            },
                            {
                                name: "Indian Red Cross Society Office, Imphal",
                                type: "Medical",
                                personnel: 12,
                                baseLat: 24.810177,
                                baseLng: 93.9371405
                            }
                        ]
                            .map((responder) => {

                                const distance = calculateDistance(
                                    incidentCoords.lat,
                                    incidentCoords.lng,
                                    responder.baseLat,
                                    responder.baseLng
                                );

                                const roadFactor = 1.8;   // simulate real road distance
                                const roadDistance = distance * roadFactor;

                                const emergencySpeed = 24; // realistic hill area speed (km/h)
                                const eta = Math.round((roadDistance / emergencySpeed) * 60);

                                return (
                                    <div key={responder.name} className="border rounded-xl p-4 shadow-sm">
                                        <h3 className="font-semibold">{responder.name}</h3>

                                        <p className="text-sm text-gray-500">
                                            {responder.type} • {responder.personnel} Personnel
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            📏 Distance: {roadDistance.toFixed(2)} km
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            ⏱ ETA: {eta} minutes
                                        </p>

                                        <button
                                            onClick={() => setDispatchTo(responder.name)}
                                            className="mt-3 w-full py-2 rounded bg-blue-600 text-white"
                                        >
                                            Dispatch Responder
                                        </button>
                                    </div>
                                );
                            })}

                    </div>
                </div>


                {/* RIGHT PANEL — REPORT GENERATION */}
                <div className="bg-white text-black rounded-2xl shadow-2xl p-6 space-y-6">

                    <h2 className="text-xl font-bold">Dispatch Report</h2>

                    <div>
                        <label className="text-sm font-medium">Location</label>
                        <input
                            value={locationName}
                            readOnly
                            className="w-full p-3 border rounded bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Risk Level</label>
                        <input
                            value={riskLevel}
                            readOnly
                            className="w-full p-3 border rounded bg-gray-100"
                        />
                    </div>



                    <div>
                        <label className="text-sm font-medium">Selected Authority</label>
                        <input
                            value={dispatchTo}
                            readOnly
                            className="w-full p-3 border rounded bg-gray-100"
                        />
                    </div>

                    <button
                        onClick={handleDispatch}
                        className="w-full py-3 rounded bg-red-600 text-white font-semibold text-lg"
                    >
                        🚨 Generate Official Dispatch Report
                    </button>

                </div>

            </div>
        </div>
    );
}