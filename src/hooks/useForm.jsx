import { useState } from "react";

const useForm = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    const isEmpty = Object.entries(formData).some(([key, val]) => {
      if (key === "photo") return false;
      return val.trim() === "";
    });

    if (isEmpty) {
      newErrors.submit = "Tous les champs doivent être remplis.";
      setErrors(newErrors);
      return false;
    }

    if (!/^[a-zA-ZÀ-ÿ\s]{3,}$/.test(formData.nom.trim())) {
      newErrors.submit = "Le nom doit contenir au moins 3 lettres (sans caractères spéciaux).";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.submit = "L'adresse email est invalide.";
    }

    if (formData.password.length < 6) {
      newErrors.submit = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (!/^[a-zA-Z0-9\s\-]{3,}$/.test(formData.entreprise.trim())) {
      newErrors.submit = "Le nom d'entreprise est invalide (au moins 3 caractères, sans caractères spéciaux).";
    }

   if (!/^\+?\d[\d\s]{6,20}$/.test(formData.telephone.trim())) {
  newErrors.submit = "Le numéro de téléphone est invalide (ex: +261 .. ... ..).";
}

    if (formData.adresse.trim().length < 5) {
      newErrors.submit = "L'adresse doit contenir au moins 5 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (url) => {
    if (!validate()) return null;

    try {
      const data = new FormData();
      data.append("nom", formData.nom);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("entreprise", formData.entreprise);
      data.append("telephone", formData.telephone);
      data.append("adresse", formData.adresse);
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const response = await fetch(url, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ submit: result.error || "Erreur lors de l'inscription." });
        return null;
      }

      return result;
    } catch (error) {
      setErrors({ submit: "Erreur de connexion au serveur." });
      return null;
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    errors,
  };
};

export default useForm;
