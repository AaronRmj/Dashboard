import React from "react";
import { useState,useEffect } from "react";

const EmployeeList = () =>{

    //Initialisation de l'état local 'employees' avec un tableau vide
    const [employees, setEmployees] = useState([]); 
    
    // Utilisation de useEffect pour récupérer les données après le montage du composant
    useEffect(() => {   
        
        //fonction asynchrone pour recuperer les données depuis une API externe
        const fetchEmployees = async () => {
            try{

                // Envoi d'une requête HTTP GET à l'API
                const response = await fetch('https://jsonplaceholder.typicode.com/users');
                
                //analyse la réponse JSON pour obtenir les données des employés.
                const data = await response.json();

                // Mise à jour de l'état 'employees' avec les données récupérées
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
                <h1 className="font-bold px-4 text-2xl">Team</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {employees.map(employee => (
                        <div key={employee.id} className="p-4">
                            <div className="bg-white rounded-xl p-12 text-center space-y-4">
                                <h1 className="font-bold">{employee.name}</h1>
                                <h3 className="text-gray-400 font-light text-xs">{employee.email}</h3>
                                <h1>{employee.phone}</h1>
                            </div>
                        </div>
                    ))}


                </div>
            </section>
        )

}

export default EmployeeList