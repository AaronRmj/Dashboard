import React from "react";
import { useState,useEffect } from "react";
import Button from "../../components/ui/Button";
const EmployeeList = () =>{

    //Initialisation de l'état local 'employees' avec un tableau vide
    const [employees, setEmployees] = useState([]); 
    const [openPopup, setOpenPopup] = useState(false);
    const popup = () =>{
        setOpenPopup(!false);
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
            <section>
                <div className="flex m-4">
                    <h1 className="font-bold px-4 text-2xl w-full">Team</h1>
                    <Button className="px-1" label="Ajouter un nouvel employé" />
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

        )
    }
        export default EmployeeList;