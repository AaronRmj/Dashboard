import React, { useState, useRef } from "react";
import Button from "../../components/ui/Button";
import { IoCloseOutline } from "react-icons/io5";
import Label from "../../components/ui/Label";
import { MdCheckCircle, MdErrorOutline, MdOutlineInventory } from "react-icons/md";

const StockSuppliers = () => {
  const [inVoice, setInVoiceOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    InfoFournisseur: "",
    Telephone: "",
    Email: "",
    Date: "",
    Produit: {
      NomProduit: "",
      Quantite: "",
      Pachat: "",
      Pvente: ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["NomProduit", "Quantite", "Pachat", "Pvente"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        Produit: {
          ...prev.Produit,
          [name]:
            name === "NomProduit"
              ? value
              : value === ""
              ? ""
              : name === "Quantite"
              ? parseInt(value)
              : parseFloat(value)
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleInvoice = () => setInVoiceOpen(true);

  const closePopup = () => {
    setInVoiceOpen(false);
    setError("");
    setSuccess(false);
    setFile(null);
    setPreview(null);
    setFormData({
      InfoFournisseur: "",
      Telephone: "",
      Email: "",
      Date: "",
      Produit: {
        NomProduit: "",
        Quantite: "",
        Pachat: "",
        Pvente: ""
      }
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !formData.InfoFournisseur ||
      !formData.Telephone ||
      !formData.Email ||
      !formData.Date ||
      !formData.Produit.NomProduit ||
      formData.Produit.Quantite === "" ||
      formData.Produit.Pachat === "" ||
      formData.Produit.Pvente === ""
    ) {
      setError("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    const formToSend = new FormData();
    formToSend.append("InfoFournisseur", formData.InfoFournisseur);
    formToSend.append("Telephone", formData.Telephone);
    formToSend.append("Email", formData.Email);
    formToSend.append("Date", formData.Date);

    const produitsArray = [
      {
        NomProduit: formData.Produit.NomProduit,
        Quantite: parseInt(formData.Produit.Quantite) || 0,
        Pachat: parseFloat(formData.Produit.Pachat) || 0,
        Pvente: parseFloat(formData.Produit.Pvente) || 0
      }
    ];
    formToSend.append("produits", JSON.stringify(produitsArray));

    if (file) {
      formToSend.append("file", file);
    }

    try {
      const response = await fetch("http://localhost:8080/Achat", {
        method: "POST",
        body: formToSend
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi de l'achat");

      await response.json();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closePopup();
      }, 4000);
    } catch (error) {
      console.error("Erreur :", error);
      setError("La quantité et les prix  doivent être supérieurs à 0.");
    }
  };

  return (
    <section className="h-screen relative bg-gray-50">
      {/* Messages succes / erreur */}
      {success && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 text-green-700 px-6 py-3 rounded-md shadow-md flex items-center gap-3 animate-fadeInDown">
          <MdCheckCircle className="text-xl" />
          <span>Achat enregistré avec succès !</span>
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="fixed top-10 left-4/7 -translate-x-1/2 z-50 bg-red-100 border border-red-300 text-red-700 px-6 py-3 rounded-md shadow-md flex items-center  gap-3 animate-fadeInDown">
          <MdErrorOutline className="text-xl" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-2 font-bold cursor-pointer">
            X
          </button>
        </div>
      )}

      {!inVoice ? (
        <section className="mx-auto space-x-6 lg:max-w-md w-2xs h-screen flex justify-center items-center">
          <Button label="Acheter Produits" onClick={handleInvoice} />
        </section>
      ) : (
        <section className="p-3 overflow-hidden flex justify-center">
          <form
            onSubmit={onSubmit}
            className="bg-white p-7 lg:max-w-3xl rounded-xl shadow-lg relative w-full max-w-xl mt-7"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Nouvel Achat</h2>
              <IoCloseOutline className="text-2xl cursor-pointer" onClick={closePopup} />
            </div>

            <h3 className="font-bold mb-5">Détails Fournisseur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Label
                text="Entreprise Fournisseur"
                name="InfoFournisseur"
                value={formData.InfoFournisseur}
                onChange={handleChange}
              />
              <Label text="Téléphone" name="Telephone" value={formData.Telephone} onChange={handleChange} />
              <Label text="Email" name="Email" value={formData.Email} onChange={handleChange} />
              <Label text="Date d'achat" name="Date" type="date" value={formData.Date} onChange={handleChange} />
            </div>

            <h3 className="font-bold mt-5 mb-3">Produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Label text="Nom Produit" name="NomProduit" value={formData.Produit.NomProduit} onChange={handleChange} />
              <Label
                text="Quantité"
                name="Quantite"
                type="number"
                min="1"
                value={formData.Produit.Quantite}
                onChange={handleChange}
              />
              <Label
                text="Prix Achat Unitaire"
                name="Pachat"
                type="number"
                min="0"
                step="0.01"
                value={formData.Produit.Pachat}
                onChange={handleChange}
                placeholder={"en Ariary"}
              />
              <Label
                text="Prix Vente Unitaire"
                name="Pvente"
                type="number"
                min="0"
                step="0.01"
                value={formData.Produit.Pvente}
                onChange={handleChange}
                placeholder={"en Ariary"}
              />
            </div>

<div className="mt-4 flex items-center justify-center max-w-xl gap-48">
  {/* Image produit avec bouton + */}
  <div className="ml-20">
    <label className="block text-gray-700 font-thin mb-1">Image Produit</label>
    <div
      className="relative w-45 h-32 border border-gray-300 rounded-md bg-gray-50 shadow-sm flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={openFileDialog}
      title="Ajouter ou changer l'image produit"
    >
      {preview ? (
        <img src={preview} alt="Aperçu produit" className="w-full h-full object-cover" />
      ) : (
        <MdOutlineInventory className="text-gray-400 text-7xl" />
      )}
      <button
        type="button"
        onClick={openFileDialog}
        className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl shadow-md hover:bg-blue-700 focus:outline-none"
        aria-label="Ajouter une photo"
      >
        +
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  </div>

  {/* Affichage Nap */}
  <div className="p-4 bg-gray-100 rounded-md max-w-xs">
    <p className="font-semibold text-gray-700 whitespace-nowrap">
      Nette à payer (Ariary) :{" "}
      <span className="text-blue-600">
        {(formData.Produit.Quantite > 0 && formData.Produit.Pachat > 0
          ? (formData.Produit.Quantite * formData.Produit.Pachat).toLocaleString("fr-FR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : 0) + " Ar"}
      </span>
    </p>
  </div>
</div>


            <div className="mt-5">
              <Button label="Enregistrer Achat" type="submit" />
            </div>
          </form>
        </section>
      )}
    </section>
  );
};

export default StockSuppliers;
