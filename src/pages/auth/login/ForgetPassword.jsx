import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdCheckCircle, MdErrorOutline } from "react-icons/md";

const ForgetPassword = ({ email, setError }) => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");

    const handleClick = async (e) => {
        e.preventDefault();

        if (!email) {
            setError("Veuillez entrer votre email.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Email non trouvé.");
                return;
            }

            setSuccessMessage("Code envoyé vers votre email");
            setTimeout(() => {
                setSuccessMessage("");
                navigate("/forgot-password", { state: { email } });
            }, 3000); // 3 s avat de redirex

        } catch (err) {
            console.error(err);
            setError("Erreur serveur. Réessayez plus tard.");
        }
    };

    return (
        <>
            {successMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 text-green-700 px-6 py-3 rounded-md shadow-md flex items-center gap-3 animate-fadeInDown">
                    <MdCheckCircle className="text-xl" />
                    <span>{successMessage}</span>
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <a
                href="#"
                onClick={handleClick}
                className="text-sm text-blue-700   hover:text-gray-500 hover:scale-102 transition-all duration-[600ms]"
            >
                Mot de passe oublié?
            </a>
        </>
    );
};

export default ForgetPassword;
