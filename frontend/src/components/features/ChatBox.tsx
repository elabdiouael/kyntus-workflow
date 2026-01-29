"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Wifi, WifiOff } from "lucide-react";
import { Client } from "@stomp/stompjs"; // Pour WebSocket
import SockJS from "sockjs-client"; // Fallback
import styles from "./ChatBox.module.css";

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Stomp Client Ref
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Charger l'User depuis LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("kyntus_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 2. Connexion WebSocket (STOMP)
  useEffect(() => {
    if (!user) return; // On attend que l'user soit chargé

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str), // Pour debugger f console
      onConnect: () => {
        setIsConnected(true);
        
        // S'abonner au canal public
        client.subscribe("/topic/public", (message) => {
          const receivedMsg = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMsg]);
        });

        // Envoyer un message "JOIN" (Optionnel selon ton backend)
        client.publish({
          destination: "/app/chat.addUser",
          body: JSON.stringify({ sender: user.username, type: "JOIN" }),
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      }
    });

    client.activate();
    clientRef.current = client;

    // Cleanup quand on quitte
    return () => {
      if (client.active) client.deactivate();
    };
  }, [user]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 3. Envoyer un Message
  const handleSend = () => {
    if (!msg.trim() || !clientRef.current || !isConnected) return;

    const chatMessage = {
      sender: user.username,
      content: msg,
      type: "CHAT",
      // On peut ajouter timestamp ici ou laisser le back le faire
      timestamp: new Date().toISOString() 
    };

    clientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(chatMessage),
    });

    setMsg("");
  };

  return (
    <>
      {/* BOUTON TOGGLE (ORB) */}
      {!isOpen && (
          <div className={styles.toggleBtn} onClick={() => setIsOpen(true)}>
              <MessageSquare size={26} className={styles.toggleIcon} strokeWidth={2} />
              {/* Badge vert si connecté, rouge si déconnecté */}
              <div 
                className={styles.badge} 
                style={{ background: isConnected ? "#39ff14" : "#ff0055" }}
              ></div>
          </div>
      )}

      {/* FENÊTRE CHAT */}
      {isOpen && (
        <div className={styles.chatWindow}>
            
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    {isConnected ? (
                        <Wifi size={14} color="#39ff14" />
                    ) : (
                        <WifiOff size={14} color="#ff0055" />
                    )}
                    <span style={{marginLeft: 8}}>TEAM LINK</span>
                </div>
                <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className={styles.messagesArea}>
                {messages.length === 0 && (
                   <div style={{textAlign:"center", color:"#555", marginTop: 20, fontSize: "0.8rem"}}>
                      Canal sécurisé établi.<br/>Soyez le premier à écrire.
                   </div>
                )}

                {messages.map((m, index) => {
                    const isMe = m.sender === user?.username;
                    // Ignorer les messages de type JOIN/LEAVE si tu ne veux pas les afficher
                    if(m.type === "JOIN") return <div key={index} style={{textAlign:"center", fontSize:"0.7rem", color:"#666", margin:"5px 0"}}>{m.sender} a rejoint le canal</div>;
                    
                    return (
                        <div key={index} className={`${styles.msgRow} ${isMe ? styles.me : styles.other}`}>
                            {!isMe && <span className={styles.senderName}>{m.sender}</span>}
                            <div className={styles.bubble}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
                <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder={isConnected ? "Message..." : "Connexion..."}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!isConnected}
                />
                <button 
                    className={styles.sendBtn} 
                    onClick={handleSend}
                    disabled={!isConnected}
                    style={{opacity: isConnected ? 1 : 0.5}}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      )}
    </>
  );
}