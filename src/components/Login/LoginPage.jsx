import React, { useState } from "react";
import Logo from "./Logo";
import DynamicInput from "./DynamicInput";
import RememberMe from "./RememberMe";
import ForgetPassword from "./ForgetPassword";
import CreateAccount from "./CreateAccount";
import { CiUser } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";
import Illustration from "./Illustration";
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleLogin = (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Veuillez remplir les informations !");
            return;
        }

        // Logique d'authentification
        alert(`Username: ${username}, Password: ${password}`);
        setError("");
        navigate("/dashboard");
    };

    return (
        <div className=" bg-gradient-to-r from-blue-50 to-gray-100 h-screen flex justify-center items-center">

            <div className="grid grid-cols-2 shadow-xl bg-white rounded-lg w-3/4 relative">
                {/*section formulaire */}
                <div className="p-8 flex flex-col justify-center h-full">
                    <Logo/>
                    <h2 className="text-3xl font-bold text-gray-900 mb-7">Log in to your Account</h2>
                    <form onSubmit={handleLogin} className="space-y-3">
                        <div className="space-y-0">
                            <DynamicInput
                                icon={CiUser}
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                />
                            <DynamicInput
                            icon={CiUnlock}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-lg absolute top-4 left-8  w-full">{error}</p>}

                        <div className="flex justify-between items-center mt-4 text-gray-500 text-sm">
                            <RememberMe />
                            <ForgetPassword />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 text-white text-sm"
                            >
                            Log in
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <CreateAccount />
                    </div>
                </div>
                <div className="h-full object-cover">
                    <Illustration />
                </div>
                
            </div>
            
        </div>
    );
};

export default LoginPage;
