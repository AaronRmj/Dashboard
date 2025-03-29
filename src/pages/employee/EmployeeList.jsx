import React from "react";
import { useState,useEffect } from "react";
import Button from "../../components/ui/Button";
import DynamicInput from "../../components/ui/DynamicInput";
import {IoCloseOutline}  from "react-icons/io5";
import { CiUser } from "react-icons/ci";    //satria ato no ampiasaina
import { CiUnlock } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { MdAddBusiness } from "react-icons/md";
import { Link } from "react-router-dom";
import { CiPhone } from "react-icons/ci";
import { FaRegAddressCard } from "react-icons/fa";
import { CiMoneyBill } from "react-icons/ci";




const EmployeeList = () =>{

    //Initialisation de l'état local 'employees' avec un tableau vide
    const [employees, setEmployees] = useState([]); 
    const [popup, setPopupOpen] = useState(false);
    const openPopup = () =>{
        console.log("hello world");
        setPopupOpen(true);
    }
    const closePopup = () =>{
        setPopupOpen(false);
    }
    // Utilisation de useEffect pour récupérer les données après le montage du composant
    useEffect(() => {   
        
        const fetchEmployees = async () => {
            try{

                //fetch envoye une requette GET a l API du backend
            const response = await fetch("http://localhost:8080/Employe");
            if (!response.ok){
                    //générer message d'erreur manuellement
                    throw new Error('Erreur lors de la recuperation des employés');
            }
            const data = await response.json();
            setEmployees(data);

            }
            // Gestion des erreurs potentielles
            catch (error){
                console.log('erreur lors de la recuperation des données', error);
            }
            
        }

        //appel de la fonction 
        fetchEmployees();

    }, []);

        return(
            <section className="h-screen">
                {!popup ? (
                    <section>
                        <div className="flex m-4">
                            <h1 className="font-bold px-4 text-2xl w-full">Team</h1>
                            <Button onClick={openPopup} className="px-1" label="Ajouter un nouvel employé" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                            {employees.map(employee => (
                                <div key={employee.IdEmploye} className="p-4">
                                    <div className="bg-white hover:-translate-y-3 duration-300 rounded-xl p-12 h-[500px] text-center shadow-lg space-y-2 overflow-hidden">
                                        {/* <div className="flex justify-center flex-1">
                                            <img src={employee.image} alt={employee.image} className="rounded-full" />
                                        </div> */}
                                        <h2 className="font-bold">{employee.Nom}</h2>
                                        <h3 className="text-gray-500 text-sm font-thin sm:text-xl"> {employee.UserName} </h3>
                                        <h4 className="text-xs sm:text-lg lg:text-sm ">{employee.Mdp} </h4>
                                        <h4 className="text-xs sm:text-lg lg:text-sm ">{employee.Poste} </h4>
                                        <h4 className="text-xs sm:text-lg lg:text-sm "> {employee.Salaire} </h4>
                                        <h4 className="text-xs sm:text-lg lg:text-sm "> {employee.Tel} </h4>
                                        <h4 className="text-xs sm:text-lg lg:text-sm "> {employee.Adresse} </h4>
                                        <h4 className="text-xs sm:text-lg lg:text-sm  text-gray-500 mt-auto"> {employee.Email} </h4>
                                    </div>
                                </div>
                            ))}


                        </div>
                    </section>
                ) : (
                    <section className="h-screen bg-gradient-to-r from-blue-50 to-gray-100 flex justify-center items-center">
                        <div className="bg-white shadow-lg rounded-lg">
                            <div className="flex items-center justify-between ml-65 mr-10">
                                <h1 className="text-2xl my-6">Ajout d' un nouvel employé</h1>
                                <IoCloseOutline className="text-2xl" onClick={closePopup} />
                            </div>
                            
                            <section className="grid grid-cols-2 my-2">
                                <div className="mx-20 w-full space-y-3">
                                    <DynamicInput 
                                            icon={CiUser}
                                            type="text"
                                            placeholder="Nom de l'employé"
                                            />
                                        <DynamicInput 
                                            icon={CiUser}
                                            type="text"
                                            placeholder="Nom d'utilisateur"
                                            />
                                        <DynamicInput 
                                            icon={CiUnlock}
                                            type="password"
                                            placeholder="Mot de passe"
                                            />
                                        <DynamicInput
                                            icon={FaRegAddressCard}
                                            type="text"
                                            placeholder="Adresse"
                                            /> 
                                </div>
                                <div className="w-full space-y-3 mb-4 mr-20">
                                    <DynamicInput 
                                            icon={MdOutlineEmail}
                                            type="text"
                                            placeholder="Email"
                                            />
                                        <DynamicInput 
                                            icon={CiPhone}
                                            type="text"
                                            placeholder="Télephone"
                                            />
                                        <DynamicInput 
                                            icon={MdOutlineEmail}
                                            type="email"
                                            placeholder="Poste"
                                            />
                                        <DynamicInput
                                            icon={CiMoneyBill}
                                            type="text"
                                            placeholder="Salaire"
                                            />
                                </div>
                            </section>
                                <div className="flex justify-center mb-5 mx-45">
                                    <Button className="px-6 w-full" label="Confirmer l'ajout" />
                                </div>
                            
                        </div>
                    </section>

                    )
                }
            </section>
        );
    }
        export default EmployeeList