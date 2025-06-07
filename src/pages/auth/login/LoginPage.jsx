import React, { useState } from "react";
import Logo from "./Logo";
import DynamicInput from "../../../components/ui/DynamicInput";
import RememberMe from "./RememberMe";
import ForgetPassword from "./ForgetPassword";
import CreateAccount from "./CreateAccount";
import { CiUser, CiUnlock } from "react-icons/ci";
import { MdErrorOutline, MdCheckCircle } from "react-icons/md";
import Illustration from "./Illustration";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Veuillez remplir les informations !");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      localStorage.setItem("token", data.token);

      setError("");
      setPopupVisible(true); 
      setTimeout(() => {
        setPopupVisible(false);
        navigate("/dashboard");
      }, 4000); // 4 s avat redirex 
    } catch (err) {
      console.error(err);
      setError("Erreur réseau, réessayez plus tard.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 h-screen flex justify-center items-center">
     {popupVisible && (
  <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 text-green-700 px-6 py-4 rounded-md shadow-md w-80 text-center animate-fadeInDown">
    <div className="flex items-center justify-center gap-2 mb-1">
      <MdCheckCircle className="text-xl" />
      <span className="font-semibold">Connexion réussie</span>
    </div>
    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
      <span>Veuillez patienter  </span>
      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
)}

      <div className="grid grid-cols-2 shadow-xl bg-white rounded-lg w-6/7 relative">
        <div className="p-8 flex flex-col justify-center h-full">
          <div className="flex justify-center items-center mb-4 ml-25">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-7 text-center">
            Connexion à votre compte
          </h2>
          <form onSubmit={handleLogin} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 bg-red-100 text-red-500 px-4 py-2 rounded-md text-md border border-red-300 mb-2">
                <MdErrorOutline className="text-lg" />
                <span>{error}</span>
              </div>
            )}

            <DynamicInput
              icon={CiUser}
              type="text"
              placeholder="Adresse email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <DynamicInput
              icon={CiUnlock}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between items-center mt-2 text-gray-800 text-sm">
              <RememberMe
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <ForgetPassword email={username} setError={setError} />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 text-white text-sm mt-5 "
            >
              Se connecter
            </button>
          </form>

          
            <CreateAccount />
          
        </div>

        {/* Illustration */}
        <div className="object-cover">
          <Illustration />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
