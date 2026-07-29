import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function EmergencyBroadcastPage() {
    const [locationState] = useLocation();
    const [locationName, setLocationName] = useState("");
    const [riskLevel, setRiskLevel] = useState("");
    const [message, setMessage] = useState("");

    // 🔥 AUTO FILL FROM URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const loc = params.get("location");
        const risk = params.get("risk");

        if (loc) setLocationName(loc);
        if (risk) setRiskLevel(risk);

        // ❌ Removed auto message generation
    }, []);


    const handleBroadcast = async () => {
        if (!locationName || !message) {
            window.alert("Please fill all fields");
            return;
        }

        await fetch("/api/emergency-broadcast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                locationName,
                message
            }),
        });

        window.alert("Broadcast sent successfully!");
        setMessage("");
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

            {/* 🌍 Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/broadcast-bg.jpg')" }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Emergency Broadcast System
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Multi-channel alert delivery to residents.
                    </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Location
                    </label>
                    <input
                        type="text"
                        value={locationName}
                        readOnly
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
                    />
                </div>

                {/* Risk Level */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Risk Level
                    </label>
                    <input
                        type="text"
                        value={riskLevel}
                        readOnly
                        className={`w-full px-4 py-3 rounded-lg border text-white font-semibold ${riskLevel === "HIGH"
                            ? "bg-red-500"
                            : riskLevel === "MODERATE"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                    />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                        placeholder="Type emergency message..."
                        rows={4}
                    />
                </div>

                {/* Button */}
                <button
                    onClick={handleBroadcast}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold text-lg shadow-lg hover:scale-[1.02] transition-transform duration-200"
                >
                    🚀 Broadcast Now
                </button>
            </div>
        </div>
    );
}