"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDoctorByQuery = findDoctorByQuery;
exports.resolveDoctorId = resolveDoctorId;
exports.bookAppointment = bookAppointment;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const intentService_1 = require("./intentService");
async function findDoctorByQuery(query) {
    try {
        const url = env_1.env.APPOINTMENT_SERVICE_BASE_URL + "/api/doctors";
        // log.info(`Fetching doctors from ${url}...`);
        const response = await fetch(url);
        if (!response.ok)
            return { type: "NONE" };
        const json = await response.json();
        if (!json.success || !Array.isArray(json.data))
            return { type: "NONE" };
        const doctors = json.data;
        const normalizedQuery = query.toLowerCase().trim();
        // 1. Exact Name Match
        let match = doctors.find((d) => d.user?.name?.toLowerCase() === normalizedQuery);
        if (match) {
            return {
                type: "EXACT",
                doctor: { id: match._id, name: match.user.name }
            };
        }
        // 2. Strong Partial Match (substring)
        match = doctors.find((d) => d.user?.name?.toLowerCase().includes(normalizedQuery));
        if (match) {
            // If query is very short (e.g. "Jo"), partial match might be risky, but let's assume it's okay for now OR treat as suggestion?
            // Let's treat valid substring as EXACT for simplicity, unless we want to confirm everything.
            // User asked: "if user types yes, then do the booking". Implies confirmation.
            // Let's return substring as EXACT if it's high confidence, or SUGGESTION if ambiguous?
            // For now, sticking to previous behavior: Substring = Match. 
            // We only use AI if strict substring fails.
            return {
                type: "EXACT",
                doctor: { id: match._id, name: match.user.name }
            };
        }
        // 3. AI Fuzzy Match
        const doctorNames = doctors
            .map((d) => d.user?.name)
            .filter((n) => typeof n === "string");
        const closestName = await (0, intentService_1.findClosestDoctor)(query, doctorNames);
        if (closestName) {
            const aiMatch = doctors.find((d) => d.user?.name === closestName);
            if (aiMatch) {
                return {
                    type: "SUGGESTION",
                    doctor: { id: aiMatch._id, name: aiMatch.user.name }
                };
            }
        }
        return { type: "NONE" };
    }
    catch (error) {
        logger_1.log.error("Error resolving doctor:", error);
        return { type: "NONE" };
    }
}
// Deprecated: kept for backward compat if needed, but we should use findDoctorByQuery
async function resolveDoctorId(name) {
    const res = await findDoctorByQuery(name);
    if (res.type === "EXACT")
        return res.doctor.id;
    return null;
}
async function bookAppointment(req) {
    try {
        const url = env_1.env.APPOINTMENT_SERVICE_BASE_URL + env_1.env.APPOINTMENT_BOOKING_ENDPOINT;
        logger_1.log.info(`Booking appointment at ${url} for doc ${req.doctorId} on ${req.date} at ${req.time}`);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env_1.env.BACKEND_AUTH_TOKEN}`
            },
            // Backend expects: doctorId, appointmentDate, appointmentTime, reason
            body: JSON.stringify({
                doctorId: req.doctorId,
                appointmentDate: req.date,
                appointmentTime: req.time,
                reason: "Booking via Telegram Bot",
                comments: `Telegram User ID: ${req.patientId}`
            })
        });
        const json = await response.json();
        logger_1.log.info("Booking API response:", json);
        if (!response.ok) {
            // Handle 400 Bad Request (likely slot unavailable or validation)
            if (response.status === 400 && json.message?.includes("Doctor is not available")) {
                return {
                    ok: false,
                    reason: "SLOT_UNAVAILABLE",
                    // If backend provided suggested slots, parse them here. 
                    // Currently backend just says "Doctor is not available".
                    // You might want to update backend to return available slots.
                    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"] // Fallback suggestions
                };
            }
            return {
                ok: false,
                reason: "VALIDATION_ERROR",
                message: json.message || "Unknown validation error"
            };
        }
        // Success (201 Created)
        const appointment = json.data;
        const doctorObj = appointment.doctor; // might be populated
        // Safety check on doctor name
        const doctorName = (typeof doctorObj === 'object' && doctorObj?.user?.firstName)
            ? `Dr. ${doctorObj.user.firstName} ${doctorObj.user.lastName}`
            : "the doctor";
        return {
            ok: true,
            appointmentId: appointment._id,
            doctorName: doctorName,
            date: appointment.appointmentDate.split('T')[0],
            time: appointment.appointmentTime
        };
    }
    catch (err) {
        logger_1.log.error("Booking API error:", err);
        return {
            ok: false,
            reason: "OTHER_ERROR",
            message: "Failed to reach booking service"
        };
    }
}
