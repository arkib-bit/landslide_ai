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
                className="absolute inset-0 bg-cover bg-center brightness-110 contrast-110"
                style={{ backgroundImage: "url('/broadcast-bg.jpg')" }}
            />

            {/* 🔥 Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* 📡 Content */}
            <div className="relative z-10 w-full max-w-3xl p-10 space-y-8 bg-slate-900/80 border border-slate-700 shadow-xl">
                <h1 className="text-2xl font-semibold text-white tracking-wide">
                    Emergency Broadcast System
                </h1>

                <div>
                    <label className="block mb-2 font-semibold text-white">Location</label>
                    <input
                        type="text"
                        value={locationName}
                        readOnly
                        className="w-full p-3 rounded bg-white/90 text-black border border-gray-300"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold text-white">Risk Level</label>
                    <input
                        type="text"
                        value={riskLevel}
                        readOnly
                        className="w-full p-3 bg-slate-800 text-white border border-slate-600 focus:border-red-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold text-white">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3 rounded bg-white/90 text-black border border-gray-300"
                        placeholder="Type emergency message..."
                    />
                </div>

                <button
                    onClick={handleBroadcast}
                    className="w-full bg-red-700 text-white py-3 tracking-wide font-medium hover:bg-red-800 transition-colors border border-red-600"
                >
                    Broadcast Now
                </button>

            </div>
        </div>
    );
}