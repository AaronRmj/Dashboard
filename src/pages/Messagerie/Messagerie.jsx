import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8080";

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const MessageBubble = ({ m }) => {
  const self = m.self;
  const containerStyle = {
    display: "flex",
    justifyContent: self ? "flex-end" : "flex-start",
    marginBottom: 8,
    alignItems: "flex-end" // garde la bulle alignée verticalement
  };
  const bubbleStyle = {
    maxWidth: "65%",
    minWidth: 80,
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 16,
    background: self ? "#0b76ff" : "#e5e7eb",
    color: self ? "#fff" : "#111827",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    overflowWrap: "break-word", // ne casse pas caractère par caractère
    wordBreak: "break-word",
    whiteSpace: "normal",       // autorise retour automatique mais pas vertical
    lineHeight: 1.3,
    fontSize: 14,
    textAlign: "left",
    direction: "ltr",
    letterSpacing: "normal"
  };
  const metaStyle = { fontSize: 11, color: self ? "rgba(255,255,255,0.8)" : "#6b7280", marginTop: 6, textAlign: self ? "right" : "left" };

  return (
    <div style={containerStyle}>
      <div>
        <div style={bubbleStyle}>{m.text}</div>
        <div style={metaStyle}>{m.sender ? `${m.sender} · ${formatTime(m.ts)}` : formatTime(m.ts)}</div>
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
  const pendingRef = useRef(new Set()); // <-- NEW: messages envoyés localement en attente d'écho
  const messageKeySetRef = useRef(new Set()); // pour dédoublonner
  const messageKeyQueueRef = useRef([]);      // FIFO pour limiter la taille du set

  // get token / user info
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    // fetch user-info
    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/user-info`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("user-info failed");
        const user = await res.json();
        if (mounted) {
          setUserToken({ ...user, rawToken: token });
        }
      } catch (err) {
        console.warn("fetch user-info failed", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // socket lifecycle
  useEffect(() => {
    if (!userToken) return;

    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      auth: { token: userToken.rawToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      // register on server side as before (server expects 'register')
      socket.emit("register", userToken);
    };
    const onDisconnect = (reason) => {
      setConnected(false);
    };
    const onMessage = (payload) => {
      // server emits string like "User :name; SocketId:(id) said message"
      // keep payload generic: could be string or object
      let msgText = "";
      let sender = "";
      if (typeof payload === "string") {
        msgText = payload;
        // try to parse sender
        const idx = payload.indexOf(" said ");
        if (idx > -1) {
          sender = payload.slice(0, idx);
          msgText = payload.slice(idx + 6);
        }
      } else if (payload && payload.text) {
        msgText = payload.text;
        sender = payload.sender || "";
      } else {
        msgText = String(payload);
      }

      const trimmed = msgText && String(msgText).trim();
      if (!trimmed) return; // ignore empty

      const isSelf = socket.id && sender.includes(socket.id);

     // clé unique simple pour dédoublonnage (sender + texte)
     const key = `${sender || "__"}::${trimmed}`;
     if (messageKeySetRef.current.has(key)) {
       // message déjà traité => ignore
       return;
     }
     // enregistrer dans le set + queue (limite mémoire)
     messageKeySetRef.current.add(key);
     messageKeyQueueRef.current.push(key);
     if (messageKeyQueueRef.current.length > 300) {
       const old = messageKeyQueueRef.current.shift();
       messageKeySetRef.current.delete(old);
     }

      // If this is the server echo for a pending message we sent, remove from pending and add it once
      if (isSelf && pendingRef.current.has(trimmed)) {
        pendingRef.current.delete(trimmed);
        const messageObj = { id: Date.now() + Math.random(), text: msgText, sender: userToken?.name || undefined, ts: Date.now(), self: true };
        setMessages((p) => [...p, messageObj]);
        return;
      }

      const messageObj = { id: Date.now() + Math.random(), text: msgText, sender: sender || undefined, ts: Date.now(), self: isSelf };
      setMessages((p) => [...p, messageObj]);
    };

    const onTyping = (data) => {
      // data: { user: name, typing: boolean }
      setTypingUsers((prev) => {
        const s = new Set(prev);
        if (data.typing) s.add(data.user);
        else s.delete(data.user);
        return s;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("typing", onTyping);

    // cleanup
    return () => {
      try {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("message", onMessage);
        socket.off("typing", onTyping);
        socket.disconnect();
      } catch (e) {
        console.warn("socket cleanup error", e);
      }
    };
  }, [userToken]);

  // auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight + 100;
    }
  }, [messages, typingUsers]);

  // send message
  const sendMessage = () => {
    if (!msgToSend || !socketRef.current) return;
    const text = msgToSend.trim();
    if (!text) return;
    // mark as pending and emit; we DON'T append an optimistic local bubble
    pendingRef.current.add(text);
    socketRef.current.emit("message", text);
    setMsgToSend("");
    // notify stopped typing
    socketRef.current.emit("typing", { user: userToken?.name || "Vous", typing: false });
  };

  const onInputChange = (v) => {
    setMsgToSend(v);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { user: userToken?.name || "Vous", typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) socketRef.current.emit("typing", { user: userToken?.name || "Vous", typing: false });
    }, 1000);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", height: "80vh" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <div style={{ fontWeight: 600 }}>Messagerie</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 13, color: connected ? "#10b981" : "#f97316" }}>{connected ? "Connecté" : "Déconnecté"}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{userToken ? userToken.name : "Invité"}</div>
        </div>
      </div>

      <div ref={listRef} style={{ flex: 1, padding: 12, overflowY: "auto", background: "#f7fafc" }}>
        {messages.length === 0 && <div style={{ color: "#6b7280", textAlign: "center", marginTop: 20 }}>Aucun message — commencez la conversation</div>}
        {messages.map((m) => <MessageBubble key={m.id} m={m} />)}
        {typingUsers.size > 0 && <div style={{ color: "#6b7280", fontSize: 13 }}>{[...typingUsers].join(", ")} est en train d'écrire…</div>}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: 8 }}>
        <textarea
          value={msgToSend}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Écrire un message... (Entrée pour envoyer)"
          rows={1}
          style={{ flex: 1, resize: "none", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
        />
        <button
          onClick={sendMessage}
          disabled={!msgToSend.trim()}
          style={{
            background: msgToSend.trim() ? "#0b76ff" : "#94b8ff66",
            color: "#fff",
            border: "none",
            padding: "10px 14px",
            borderRadius: 8,
            cursor: msgToSend.trim() ? "pointer" : "not-allowed"
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Messagerie;