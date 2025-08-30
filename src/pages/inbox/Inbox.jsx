import { useEffect, useRef } from "react";
import { useState } from "react";
import { io } from "socket.io-client";
// // socket.on('message', (text) => {
// //     const element = document.createElement('li');
// //     element.innerHTML = text;
// //     document.querySelector('ul').appendChild(element);
// // });
const Inbox = () =>{
    const [messages, setMessages] = useState([]);
    const[msgToSend, setMsgToSend] = useState("");
    const socketRef = useRef(null);
    const debug = socketRef.current;
    useEffect(()=>{
        console.log("mount")
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        console.log("Token from Browser acquired");
        
        if(socketRef.current == null)
        {
            socketRef.current = io('http://localhost:8080');
            console.log("Un socket a été créé");

        }

        const fetchUser = async () => {

            //acquisition userInfo grace au token pour identifier l'user
            const res = await fetch("http://localhost:8080/user-info", {
            headers: { Authorization: `Bearer ${token}` }});
            const user = await res.json();
            
            //Lancement connexion socket{}
            socketRef.current.emit('register', user);
            console.log("token user envoyé");     
        };
        fetchUser();
    
        //Récéption de messages
        socketRef.current.on('message', (msg)=>{
            setMessages((prev) => [...prev, msg]);
        });
        
        
        return () => {
            console.log(`l'état du socket: ${socketRef.current}`);
            if(socketRef.current)
            {
                socketRef.current.disconnect(); 
                console.log("Connexion socket interrompue"); 
            }
           console.log("unmount");
        };
    }, []);
   
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


export default Inbox;