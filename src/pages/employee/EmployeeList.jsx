import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import DynamicInput from "../../components/ui/DynamicInput";
import { IoCloseOutline } from "react-icons/io5";
import { CiUser, CiUnlock, CiPhone, CiMoneyBill } from "react-icons/ci";
import { MdOutlineEmail, MdAddBusiness, MdErrorOutline, MdCheckCircle } from "react-icons/md";
import { FaRegAddressCard } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [popup, setPopupOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    username: "",
    motdepasse: "",
    adresse: "",
    email: "",
    tel: "",
    poste: "",
    salaire: "",
    photo: null,
  });
  const [error, setError] = useState("");

  const openPopup = () => setPopupOpen(true);
  const closePopup = () => {
    setPopupOpen(false);
    setError("");
    setPreview(null);
    setFormData({
      nom: "",
      username: "",
      motdepasse: "",
      adresse: "",
      email: "",
      tel: "",
      poste: "",
      salaire: "",
      photo: null,
    });
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/Employe", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Erreur :", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.nom ||
      !formData.username ||
      !formData.motdepasse ||
      !formData.adresse ||
      !formData.email ||
      !formData.tel ||
      !formData.poste ||
      !formData.salaire ||
      !formData.photo
    ) {
      setError("Tous les champs sont obligatoires, y compris la photo.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const res = await fetch("http://localhost:8080/ajouter-employe", {
        method: "POST",
        body: data,
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Erreur lors de l'ajout.");
        return;
      }

      setEmployees((prev) => [...prev, result]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closePopup();
          window.location.reload(); 
      }, 4000);
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredEmployees = employees.filter((emp) =>
    (emp.Nom && emp.Nom.toLowerCase().includes(searchTerm)) ||
    (emp.UserName && emp.UserName.toLowerCase().includes(searchTerm)) ||
    (emp.Poste && emp.Poste.toLowerCase().includes(searchTerm))
  );

  return (
    <section className="h-full relative">
      {success && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 text-green-700 px-6 py-3 rounded-md shadow-md flex items-center gap-3 animate-fadeInDown">
          <MdCheckCircle className="text-xl" />
          <span>Employé ajouté avec succès !</span>
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!popup ? (
        <section>
          <div className="flex m-4 items-center">
            <h1 className="font-bold px-4 text-2xl w-full">Team</h1>
            <Button onClick={openPopup} className="px-1" label="Ajouter un nouvel employé" />
          </div>


          {/* Barre de recherche */}
          <div className="flex justify-center my-4 mt-7 mb-5">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou poste..."
              value={searchTerm}
              onChange={handleSearch}
              className="border border-gray-300 rounded px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.IdEmploye}
                  className="bg-white hover:-translate-y-2 transition duration-300 rounded-xl p-6 max-w-sm w-full mx-auto text-center shadow-md flex flex-col justify-between border border-gray-200"
                >
                  <div>
                    <img
                      src={`http://localhost:8080/uploads/${employee.Photo}`}
                      alt="Profil"
                      className="rounded-full w-35 h-35 mx-auto object-cover mb-4 border-2 border-gray-400"
                    />
                    <div className="text-left space-y-1 mt-4 text-sm text-gray-700">
                      <p><span className="font-semibold">Nom(s) :</span> {employee.Nom}</p>
                      <p><span className="font-semibold">Prénom(s) :</span> {employee.UserName}</p>
                      <p><span className="font-semibold">Téléphone :</span> {employee.Tel}</p>
                      <p><span className="font-semibold">Poste :</span> {employee.Poste}</p>
                      <p><span className="font-semibold">Adresse :</span> {employee.Adresse}</p>
                      <p><span className="font-semibold">Matricule :</span> {employee.Matricule}</p>
                    </div>
                  </div>

                  <div className="mt-6 relative group w-fit mx-auto">
                    <img
                      src={`http://localhost:8080/uploads/${employee.QRCodePath}`}
                      alt="QR Code"
                      className="w-24 h-24 border border-gray-300 rounded transition duration-300 group-hover:brightness-75"
                    />
                    <a
                      href={`http://localhost:8080/telecharger-qr/${employee.QRCodePath.split('/').pop()}`}
                      className="absolute top-7 left-8 bg-white text-blue-600 rounded-full hover:scale-106 hover:bg-sky-200  p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      title="Télécharger le QR Code"
                    >
                      <FiDownload className="text-xl " />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-3">Aucun résultat trouvé.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="h-screen bg-gradient-to-r from-blue-50  flex justify-center  items-center">
          <div className="relative bg-white shadow-lg rounded-lg w-3/4 p-8">
            <div className="absolute top-4 right-6">
              <IoCloseOutline className="text-2xl cursor-pointer" onClick={closePopup} />
            </div>

            <div className="flex items-center justify-center mb-8 gap-30">
              <h1 className="text-xl font-bold text-gray-700">Ajout d'un nouvel employé</h1>
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 border-gray-200 border-2 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <CiUser className="text-gray-300 text-6xl" />
                  )}
                </div>
                <label
                  htmlFor="photo"
                  className="-mt-5 z-10 bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition"
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
                  onChange={handleInputChange}
                />
              </div>
                            <h1 className="text-xl font-bold text-gray-700">Ajout d'un nouvel employé</h1>

            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <DynamicInput icon={CiUser} type="text" placeholder="Nom" name="nom" onChange={handleInputChange} />
                <DynamicInput icon={CiUser} type="text" placeholder="Prénom" name="username" onChange={handleInputChange} />
                <DynamicInput icon={CiUnlock} type="password" placeholder="Mot de passe" name="motdepasse" onChange={handleInputChange} />
                <DynamicInput icon={FaRegAddressCard} type="text" placeholder="Adresse" name="adresse" onChange={handleInputChange} />
              </div>

              <div className="space-y-4">
                <DynamicInput icon={MdOutlineEmail} type="email" placeholder="Email" name="email" onChange={handleInputChange} />
                <DynamicInput icon={CiPhone} type="text" placeholder="Téléphone" name="tel" onChange={handleInputChange} />
                <DynamicInput icon={MdAddBusiness} type="text" placeholder="Poste" name="poste" onChange={handleInputChange} />
                <DynamicInput icon={CiMoneyBill} type="text" placeholder="Salaire" name="salaire" onChange={handleInputChange} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-100 text-red-500 px-4 py-2 rounded-md text-md border border-red-300 mt-4 justify-center">
                <MdErrorOutline className="text-lg" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6">
              <Button className="w-full" onClick={handleSubmit} label="Confirmer l'ajout" />
            </div>
          </div>
        </section>
      )}
    </section>
  );
};

export default EmployeeList;
