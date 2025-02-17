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
            <section className="">
                   {employees.map(employee => (
                    <div key={employee.id} className="w-64 p-4">
                        <h1>{employee.name}</h1>
                        <h1>{employee.email}</h1>
                        <h1>{employee.phone}</h1>
                    </div>
                   ))}


            </section>
        )

}

export default EmployeeList