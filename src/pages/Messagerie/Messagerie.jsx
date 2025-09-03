import { useEffect, useRef } from "react";
import { useState } from "react";
import { data } from "react-router-dom";
import { io } from "socket.io-client";
// // socket.on('message', (text) => {
// //     const element = document.createElement('li');
// //     element.innerHTML = text;
// //     document.querySelector('ul').appendChild(element);
// // });
const Messagerie = () =>{
    const [messages, setMessages] = useState([]);
    const[msgToSend, setMsgToSend] = useState("");
    const [userToken, setUserToken] = useState(null);
    const socketRef = useRef(null);
    useEffect(()=>{
        let isMounted = true;
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        console.log("Token from Browser acquired");
        
        
        const fetchUserData = async () => {
            
            //acquisition userInfo grace au token pour identifier l'user
            const res = await fetch("http://localhost:8080/user-info", {
                headers: { Authorization: `Bearer ${token}` }});
            const user = await res.json();
            if(isMounted) setUserToken(user);
            
        };
        fetchUserData();
        return ()=>{
            isMounted = false;
        };
            
    }, []);
    
    useEffect(()=>{
        
        if(!userToken) return;
    
        const socket = io('http://localhost:8080');
        console.log("Un socket a été créé");
        
        //Lancement connexion socket{}
        socket.emit('register', userToken);
        console.log("token user envoyé");     
        
        //Récéption de messages
        socket.on('message', (msg)=>{
            setMessages((prev) => [...prev, msg]);
        });
        
        socketRef.current = socket;
        
        return () => {
            console.log(`l'état du socket: ${socket}`);
            socketRef.disconnect(); 
            console.log("Connexion socket interrompue");
        };

    }, [userToken]);
            
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: '#181A20',
        }}>
            <div style={{
                width: '400px', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '24px', display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <img src={userToken?.avatar || 'https://i.pravatar.cc/40'} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{userToken?.name || 'Utilisateur'}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>Welcome back.</div>
                    </div>
                </div>
                {/* Messages */}
                <div style={{ flex: 1, minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 16, background: '#F5F6FA', borderRadius: 12, padding: 12 }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            display: 'flex', justifyContent: msg.from === userToken?.name ? 'flex-end' : 'flex-start', marginBottom: 8
                        }}>
                            <div style={{
                                background: msg.from === userToken?.name ? '#4F8CFF' : '#E5E7EB',
                                color: msg.from === userToken?.name ? '#fff' : '#222',
                                borderRadius: '16px', padding: '8px 16px', maxWidth: '70%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}>
                                {msg.text || msg}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Input Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                        value={msgToSend}
                        onChange={(e) => setMsgToSend(e.target.value)}
                        placeholder="Type a new message here"
                        type="text"
                        style={{
                            flex: 1, padding: '10px 16px', borderRadius: 16, border: '1px solid #E5E7EB', outline: 'none', fontSize: 15
                        }}
                    />
                    <button
                        onClick={() => { socketRef.current.emit('message', msgToSend); setMsgToSend(''); }}
                        style={{
                            background: '#4F8CFF', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20
                        }}
                        title="Send"
                    >
                        &#9658;
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Messagerie;