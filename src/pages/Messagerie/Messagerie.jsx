import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8080";

const formatRelativeTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const secondes = Math.floor(diff / 1000);
  if (secondes < 5) return "à l'instant";
  if (secondes < 60) return `il y a ${secondes} sec`;
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return `il y a ${jours} j`;
};

const formatFullDate = (d) =>
  new Date(d).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

const MessageBubble = ({ m }) => {
  const self = m.self;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: self ? "flex-end" : "flex-start",
        marginBottom: 16,
        alignItems: "flex-end",
        gap: 12
      }}
    >
      {!self && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #0b76ff"
          }}
        >
          <img
            src={m.photo || "https://via.placeholder.com/40"}
            alt="avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ maxWidth: "72%" }}>
        <div
          style={{
            background: self ? "#0b76ff" : "#ffffff",
            color: self ? "#fff" : "#111827",
            padding: "14px 18px",
            borderRadius: 22,
            boxShadow: self
              ? "0 4px 12px rgba(11,118,255,0.25)"
              : "0 2px 10px rgba(0,0,0,0.08)",
            fontSize: 15,
            lineHeight: 1.5,
            wordBreak: "break-word",
            transition: "all 0.2s ease"
          }}
        >
          {m.text}
        </div>
        <div
          style={{
            fontSize: 12,
            color: self ? "rgba(148, 133, 133, 0.75)" : "#6b7280",
            marginTop: 6,
            textAlign: self ? "right" : "left"
          }}
        >
          {m.sender && (
            <span style={{ fontWeight: 500 }}>{m.sender} · </span>
          )}
          <span title={formatFullDate(m.ts)}>
            {formatRelativeTime(m.ts)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Messagerie = () => {
  const [messages, setMessages] = useState([]);
  const [msgToSend, setMsgToSend] = useState("");
  const [userToken, setUserToken] = useState(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingRef = useRef(new Set());
  const messageKeySetRef = useRef(new Set());
  const messageKeyQueueRef = useRef([]);

  useEffect(() => {
    let mounted = true;
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/user-info`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("user-info failed");
        const user = await res.json();
        if (mounted) setUserToken({ ...user, rawToken: token });
      } catch (err) {
        console.warn("fetch user-info failed", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userToken) return;
    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      auth: { token: userToken.rawToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register", userToken);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("message", (payload) => {
      let msgText = "";
      let sender = "";
      let photo = "";

      if (typeof payload === "object") {
        msgText = payload.text;
        sender = payload.sender || "";
        photo = payload.photo || "";
      } else msgText = String(payload);

      const trimmed = msgText && String(msgText).trim();
      if (!trimmed) return;

      const isSelf = socket.id && sender === userToken?.name;
      const key = `${sender || "__"}::${trimmed}`;
      if (messageKeySetRef.current.has(key)) return;
      messageKeySetRef.current.add(key);
      messageKeyQueueRef.current.push(key);
      if (messageKeyQueueRef.current.length > 300) {
        const old = messageKeyQueueRef.current.shift();
        messageKeySetRef.current.delete(old);
      }

      const messageObj = {
        id: Date.now() + Math.random(),
        text: msgText,
        sender: sender || undefined,
        photo: photo || undefined,
        ts: Date.now(),
        self: isSelf
      };
      setMessages((p) => [...p, messageObj]);
    });

    socket.on("typing", (data) => {
      setTypingUsers((prev) => {
        const s = new Set(prev);
        if (data.typing) s.add(data.user);
        else s.delete(data.user);
        return s;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userToken]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight + 100;
  }, [messages, typingUsers]);

  const sendMessage = () => {
    if (!msgToSend || !socketRef.current) return;
    const text = msgToSend.trim();
    if (!text) return;
    pendingRef.current.add(text);
    socketRef.current.emit("message", text);
    setMsgToSend("");
    socketRef.current.emit("typing", { user: userToken?.name || "Vous", typing: false });
  };

  const onInputChange = (v) => {
    setMsgToSend(v);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { user: userToken?.name || "Vous", typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current)
        socketRef.current.emit("typing", { user: userToken?.name || "Vous", typing: false });
    }, 1000);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "24px auto",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "85vh",
        border: "1px solid #e5e7eb",
        fontFamily: "'Inter', sans-serif",
        background: "#f4f7fa"
      }}
    >
      {/* --- Header */}
      <div
        style={{
          padding: 20,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          fontWeight: 600,
          fontSize: 17,
          color: "#111827",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
        }}
      >
        <div>Message de Groupe</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              fontSize: 13,
              color: connected ? "#10b981" : "#f97316",
              fontWeight: 600
            }}
          >
            {connected ? "Connecté" : "Déconnecté"}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {userToken ? userToken.name : "Invité"}
          </div>
        </div>
      </div>

      {/* --- Messages */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          padding: 20,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              color: "#6b7280",
              textAlign: "center",
              marginTop: 20,
              fontStyle: "italic"
            }}
          >
            Aucun message — commencez la conversation
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
        {typingUsers.size > 0 && (
          <div
            style={{
              color: "#6b7280",
              fontSize: 13,
              marginTop: 4,
              fontStyle: "italic"
            }}
          >
            {[...typingUsers].join(", ")} est en train d'écrire…
          </div>
        )}
      </div>

      {/* --- Input */}
      <div
        style={{
          padding: 16,
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          gap: 12,
          alignItems: "center",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.03)"
        }}
      >
        <textarea
          value={msgToSend}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Écrire un message... (Entrée pour envoyer)"
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            padding: 14,
            borderRadius: 16,
            border: "1px solid #d1d5db",
            fontSize: 15,
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
            transition: "border 0.2s, box-shadow 0.2s"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!msgToSend.trim()}
          style={{
            background: msgToSend.trim() ? "#0b76ff" : "#94b8ff66",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: 16,
            cursor: msgToSend.trim() ? "pointer" : "not-allowed",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: msgToSend.trim()
              ? "0 4px 12px rgba(11,118,255,0.3)"
              : "none",
            transition: "all 0.2s"
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Messagerie;
