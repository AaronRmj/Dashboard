import React, { useState } from "react";
import DynamicInput from "../../../components/ui/DynamicInput";
import Button from "../../../components/ui/Button";
import { CiUser, CiUnlock } from "react-icons/ci";
import {
  MdOutlineEmail,
  MdAddBusiness,
  MdErrorOutline,
  MdCheckCircle,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import useForm from "../../../hooks/useForm";

const SignupPage = () => {
  const { formData, handleChange, handleSubmit, errors } = useForm({
    nom: "",
    email: "",
    password: "",
    entreprise: "",
    photo: "",
  });

  const [preview, setPreview] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    const result = await handleSubmit("http://localhost:8080/signup");
    if (result) {
      setPopupVisible(true);
      setTimeout(() => {
        setPopupVisible(false);
        navigate("..");
      }, 4000); // 4 s avant redirection
    }
  };

  return (
    <section className="h-screen bg-gradient-to-r from-blue-50 to-gray-100 flex justify-center items-center mb-5 relative">

      {/*  POPUP */}
      {popupVisible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 text-green-700 px-6 py-3 rounded-md shadow-md flex items-center gap-3 animate-fadeInDown">
         
          <MdCheckCircle className="text-xl" />
          <span>Inscription réussie ! Redirection en cours  </span> <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid grid-cols-2 w-3/4 shadow-md bg-white rounded-lg overflow-hidden">
        <div className="p-10 space-y-7 h-full">
          <div className="pt-4">
            <h1 className="text-center text-3xl font-thin tracking-wide">
              Créer un compte
            </h1>
            <h3 className="text-center">
              Unifiez vos tâches, améliorez votre performance
            </h3>
          </div>

          <div className="w-full space-y-4">
            {errors.submit && (
              <div className="flex items-center gap-2 bg-red-100 text-red-400 px-4 py-2 rounded-md text-md border border-red-300 mt-2">
                <MdErrorOutline className="text-lg" />
                <span>{errors.submit}</span>
              </div>
            )}

            <DynamicInput
              icon={CiUser}
              type="text"
              placeholder="Nom d'utilisateur"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
            />
            <DynamicInput
              icon={MdOutlineEmail}
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <DynamicInput
              icon={CiUnlock}
              type="password"
              placeholder="Mot de passe"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <DynamicInput
              icon={MdAddBusiness}
              type="text"
              placeholder="Nom d'entreprise"
              name="entreprise"
              value={formData.entreprise}
              onChange={handleChange}
            />
          </div>

          <Button label="Sign up" onClick={handleSignup} />

          <div className="flex justify-between text-sm text-gray-400 w-full px-1">
            <span className="font-bold">Vous avez un compte ?</span>
            <Link to=".." className="text-blue-600">
              Se connecter
            </Link>
          </div>
        </div>

        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-3">
          <h1 className="text-xl text-black text-center max-w-lg">
            Inscription réservé aux administrateurs d’entreprise .
          </h1>
          <div className="relative w-60 h-60 border-gray-200 border-3 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md mt-12">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <CiUser className="text-gray-300 text-7xl" />
            )}
          </div>

          <label
            htmlFor="photo"
            className="relative -top-8 z-10 bg-blue-600 text-white w-13 h-13 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition border-2 border-gray-300 shadow"
            title="Ajouter une photo"
          >
            +
          </label>

          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
                handleChange({
                  target: {
                    name: "photo",
                    value: file,
                  },
                });
              }
            }}
          />

          <p className="mt-6 text-lg font-semibold text-gray-400 text-center">
            Sélectionnez votre photo de profil d’administrateur
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
