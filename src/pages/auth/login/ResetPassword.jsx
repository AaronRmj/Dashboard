import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DynamicInput from "../../../components/ui/DynamicInput";
import { CiUnlock } from "react-icons/ci";
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";

const ResetPassword = ({ email, code, role }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/reset-password", {
        email,
        code,
        newPassword,
        confirmPassword,
        role,
      });

      const { success, message } = response.data;
      setIsSuccess(success);
      setMessage(message);

      if (success) {
        setShowPopup(true);
        setTimeout(() => {
          navigate("..");
        }, 2000);
      }
    } catch (err) {
      setIsSuccess(false);
      setShowPopup(false);
      setMessage(err.response?.data?.error || "Erreur serveur");
    }
  };

  return (
    <form onSubmit={handleReset} className="relative">
      <button
        type="button"
        onClick={() => navigate("..")}
        className="absolute -top-5 right-1 text-gray-500 hover:text-gray-700"
        title="Retour à la connexion"
      >
        <AiOutlineClose className="text-2xl" />
      </button>

      <h1 className="text-xl font-bold text-center mt-2 mb-5">
        Réinitialisation du mot de passe
      </h1>

      <DynamicInput
        icon={CiUnlock}
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <DynamicInput
        icon={CiUnlock}
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {message && !isSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-md text-red-500 bg-red-100 mt-3 mb-4">
          <AiOutlineExclamationCircle className="text-xl" />
          <span>{message}</span>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mt-5"
      >
        Réinitialiser
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
            <AiOutlineCheckCircle className="text-green-600 text-4xl mb-2 animate-bounce" />
            <p className="text-center text-green-700 font-semibold mb-2">
              Mot de passe réinitialisé avec succès !
            </p>
            <div className="w-10 h-10 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-2">Redirection en cours...</p>
          </div>
        </div>
      )}
    </form>
  );
};

export default ResetPassword;
