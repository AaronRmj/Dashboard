import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

import { FiChevronDown, FiX } from "react-icons/fi";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/user-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Erreur chargement utilisateur :", error);
      }
    };

    fetchUserInfo();

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return <p className="text-sm text-gray-500">Chargement...</p>;

  let role;

  return (
    <div className="relative w-full max-w-md mx-auto">
 
  <div
    onClick={() => setShowMore((v) => !v)}
    className="flex relative items-center justify-between bg-white rounded-sm px-6 py-[1.05px] shadow-sm cursor-pointer w-full transition duration-300"
  >
    <div className="flex items-center space-x-4">
      {user.photoUrl ? (
        <img
          src={user.photoUrl}
          alt="Profil"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <FaUserCircle className="w-8 h-8 text-gray-400" />
      )}
      <div className="flex flex-col mr-15 ">
        <span className=" text-sm break-words text-gray-800 font-semibold">{user.name}</span>
        {user.role === "employe" && user.username && (
          <span className="text-xs text-gray-500 break-words">{user.username}</span>
        )}
        {user.role === "admin" && user.entreprise && (
          <span className="text-xs text-gray-600 break-words uppercase">{user.entreprise}</span>
        )}
      </div>
    </div>
    <FiChevronDown
      size={20}
      className={`text-gray-500 animate-pulse transition-transform duration-300 ml-18 ${showMore ? "rotate-180" : ""}`}
    />
  </div>

  {/* Info general */}
  {showMore && (
    <div
      ref={panelRef}
      className="absolute top-11 left-40 transform -translate-x-1/2 bg-white rounded-sm shadow-xl border border-gray-200 w-80 p-6 z-50 transition-all duration-500 scale-100 opacity-100"
    >
      <button
        onClick={() => setShowMore(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
      >
        <FiX size={20} />
      </button>

      <div className="flex flex-col items-center mb-6">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt="Profil"
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-300 shadow-md"
          />
        ) : (
          <FaUserCircle className="w-28 h-28 text-gray-400" />
        )}
        <p className="mt-3 text-base font-semibold text-gray-700">{user.name}</p>
        
        {/* Username seulement pour employé */}
        {user.role === "employe" && user.username && (
          <p className="text-sm text-gray-500">{user.username}</p>
        )}

        <p className="text-sm text-green-500 mt-3 ">
          Connecté en tant qu'{" "}
          <span className="font-medium">{user.role}</span>
        </p>

        {/* Input changement photo */}
        <div className="mt-6 cursor-pointer">
          <label className="relative">
            <span className="inline-block bg-sky-600 text-white text-sm font-medium px-7 py-2 rounded-lg shadow hover:bg-sky-700 transition duration-200">
              Changer ou Insérer une photo
            </span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("photo", file);
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                try {
                  const res = await axios.post("http://localhost:8080/update-photo", formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                      Authorization: `Bearer ${token}`
                    }
                  });
                  console.log("Photo mise à jour :", res.data);
                  setUser((prev) => ({ ...prev, photoUrl: res.data.photoUrl }));
                } catch (err) {
                  console.error("Erreur mise à jour photo :", err);
                }
              }}
            />
          </label>
        </div>
      </div>

      
      <div className="flex flex-col items-center space-y-4 text-sm text-gray-700 leading-relaxed text-center">
        <p><span className="font-semibold">Entreprise :</span> {user.entreprise || "-"}</p>
        <p><span className="font-semibold">Rôle :</span> {user.role || "-"}</p>
        {user.role === "employe" && (
          <>
            <p><span className="font-semibold">Poste :</span> {user.poste || "-"}</p>
            <p><span className="font-semibold">Matricule :</span> {user.matricule || "-"}</p>
          </>
        )}
        <p><span className="font-semibold">Email :</span> {user.email || "-"}</p>
      </div>
    </div>
  )}
</div>

  );
};

export default UserInfo;
