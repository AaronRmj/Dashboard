import React, { useState } from "react";
import axios from "axios";
import { MdErrorOutline, MdCheckCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DynamicInput from "../../../components/ui/DynamicInput";

const CodeValidation = ({ email, onSuccess }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/validate-code", {
        email,
        code,
      });

      setIsSuccess(true);
      setMessage(response.data.message);
      setTimeout(() => {
        onSuccess(email, code); // Attendre 2s 
      }, 2000);
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.response?.data?.error || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
    
      <button
        type="button"
        onClick={() => navigate("..")}
        className="absolute -top-8 right-0 text-gray-500 hover:text-gray-800  hover:scale-105 text-3xl font-bold p-2"
        title="Retour à la connexion"
      >
        ×
      </button>

      <form onSubmit={handleValidate} className="space-y-4">
        <h2 className="text-xl text-gray-500 font-bold text-center mb-5">Validation du Code</h2>

        <p className="text-sm mt-7">
          Votre Email : <strong>{email}</strong>
        </p>

        <DynamicInput
          type="text"
          placeholder="Code reçu par email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input"
          required
        />

       
        {message && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm ${
              isSuccess
                ? "bg-green-100 text-green-600 border-green-300"
                : "bg-red-100 text-red-600 border-red-300"
            }`}
          >
            {isSuccess ? (
              <MdCheckCircle className="text-lg" />
            ) : (
              <MdErrorOutline className="text-lg" />
            )}
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 text-white text-sm mt-5 flex justify-center items-center"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-opacity-50 mr-2"></span>
          ) : null}
          {loading ? "Validation..." : "Valider"}
        </button>
      </form>
    </div>
  );
};

export default CodeValidation;
