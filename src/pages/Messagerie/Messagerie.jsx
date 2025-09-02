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
            
    return(
        <div>
            <ul>
                {messages.map((msg, index)=> (<li key={index}>{msg}</li>))}
            </ul>
                <input 
                    value={msgToSend}
                    onChange={(e) => setMsgToSend(e.target.value)}
                    placeholder="Votre message"
                    type="text"
                    />
                <button onClick={() => {socketRef.current.emit('message',msgToSend);}}> Envoyer </button>
        </div>
    )
}

export default Messagerie;