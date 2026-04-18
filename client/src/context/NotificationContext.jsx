import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext(null);

const STORAGE_KEY = "bc_notifications";
const MAX = 50;

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)));
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(load);
  const socketRef = useRef(null);

  const add = useCallback((notif) => {
    setNotifications(prev => {
      const next = [{ ...notif, id: Date.now() + Math.random(), read: false, ts: new Date().toISOString() }, ...prev].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      save(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const socket = io("http://localhost:5000", {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    // Join personal room so targeted notifications reach this client
    socket.on("connect", () => {
      if (user?.id) socket.emit("joinRoom", user.id);
    });

    // Emergency alert from admin
    socket.on("newAlert", (alert) => {
      add({
        type: "alert",
        title: "🚨 Emergency Blood Request",
        body: `${alert.bloodGroup} needed at ${alert.hospital}${alert.location ? ` · ${alert.location}` : ""}`,
        link: "/alerts",
        urgency: alert.urgency,
        alertId: alert._id,
      });
      // browser notification
      if (Notification.permission === "granted") {
        new Notification("🚨 Emergency Blood Request", {
          body: `${alert.bloodGroup} needed at ${alert.hospital}`,
          icon: "/favicon.ico",
        });
      }
    });

    // Certificate issued
    socket.on("certificateIssued", (cert) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (cert.donorId && cert.donorId !== user.id) return;
      add({
        type: "certificate",
        title: "🏅 Certificate Issued",
        body: `Your donation certificate (${cert.certificateId || ""}) is ready to download.`,
        link: "/certificates",
      });
      if (Notification.permission === "granted") {
        new Notification("🏅 Certificate Ready", {
          body: "Your donation certificate is ready to download.",
          icon: "/favicon.ico",
        });
      }
    });

    socket.on("alertResolved", () => {});

    // Donor match notification
    socket.on("donorMatchNotification", (payload) => {
      add({
        type: "donorMatch",
        title: "🩸 Blood Request Match",
        body: `${payload.bloodGroup} needed at ${payload.hospital}, ${payload.city}`,
        link: "/my-requests",
        requestId: payload.requestId,
        urgency: payload.urgency
      });
      if (Notification.permission === "granted") {
        new Notification("🩸 Blood Request Match", {
          body: `${payload.bloodGroup} needed at ${payload.hospital}, ${payload.city}`,
          icon: "/favicon.ico"
        });
      }
    });

    // Request status updated by admin (approved, assigned, completed, rejected)
    socket.on("requestStatusUpdate", (payload) => {
      add({
        type: "requestUpdate",
        title: payload.title,
        body: payload.body,
        link: "/my-requests",
        requestId: payload.requestId,
        status: payload.status,
      });
      if (Notification.permission === "granted") {
        new Notification(payload.title, {
          body: payload.body,
          icon: "/favicon.ico",
        });
      }
    });

    // Donor eligibility restored after 90-day cooldown
    socket.on("donorEligible", () => {      add({
        type: "eligibility",
        title: "🩸 You're Eligible to Donate!",
        body: "Your 90-day cooldown is complete. Schedule your next donation today.",
        link: "/dashboard"
      });
      if (Notification.permission === "granted") {
        new Notification("🩸 You're Eligible to Donate!", {
          body: "Your 90-day cooldown is complete. Schedule your next donation today.",
          icon: "/favicon.ico"
        });
      }
    });

    // Inventory low-stock alert (admin only — all clients receive, UI can filter by role)
    socket.on("lowStockAlert", (payload) => {
      if (!payload?.bloodGroup || payload.currentUnits === undefined || !payload.threshold || !payload.timestamp) return;
      add({
        type: "low_stock",
        title: "⚠️ Low Stock Alert",
        body: `${payload.bloodGroup} is low — ${payload.currentUnits} units remaining (threshold: ${payload.threshold})`,
        link: "/admin/inventory"
      });
      if (Notification.permission === "granted") {
        new Notification("⚠️ Low Stock Alert", {
          body: `${payload.bloodGroup} is low — ${payload.currentUnits} units remaining`,
          icon: "/favicon.ico"
        });
      }
    });

    return () => { socket.disconnect(); };
  }, [add]);

  // Fetch persisted notifications from server on mount and merge with local ones
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(serverNotifs => {
        if (!Array.isArray(serverNotifs) || serverNotifs.length === 0) return;
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n._id || n.id));
          const newOnes = serverNotifs
            .filter(n => !existingIds.has(n._id))
            .map(n => ({
              _id: n._id,
              id: n._id,
              type: n.type,
              title: "🩸 Blood Request Match",
              body: n.message,
              link: "/my-requests",
              read: n.read,
              ts: n.createdAt
            }));
          if (newOnes.length === 0) return prev;
          const merged = [...newOnes, ...prev].slice(0, MAX);
          save(merged);
          return merged;
        });
      })
      .catch(() => {}); // silently ignore fetch errors
  }, []);

  // request browser notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unread, add, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
