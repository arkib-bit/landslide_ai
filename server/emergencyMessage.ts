export function generateEmergencyMessage(area: string, riskLevel: string) {
    let precautions = "";

    if (riskLevel === "LOW") {
        precautions = `
• Stay alert during rainfall
• Monitor slope conditions
• Keep emergency numbers saved
    `;
    }
    else if (riskLevel === "MEDIUM") {
        precautions = `
• Avoid steep slopes and riverbanks
• Keep emergency kit ready
• Monitor official updates
    `;
    }
    else if (riskLevel === "HIGH") {
        precautions = `
• Move to safer ground immediately
• Avoid landslide-prone areas
• Do NOT travel unnecessarily
• Follow evacuation instructions
    `;
    }

    return `
🚨 LANDSLIDE ALERT – ${riskLevel} RISK 🚨

Location: ${area}

${precautions}

📞 Emergency Helplines:
Police: 100
Ambulance: 108
Indian Red Cross Society (Manipur): +91 0385 2912738

Stay Alert. Stay Safe.
  `;
}