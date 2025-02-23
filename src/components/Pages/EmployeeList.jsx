import React from "react";
import { useState,useEffect } from "react";

const EmployeeList = () =>{

    //Initialisation de l'état local 'employees' avec un tableau vide
    const [employees, setEmployees] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // Utilisation de useEffect pour récupérer les données après le montage du composant
    useEffect(() => {   
        
        //fonction asynchrone pour recuperer les données depuis une API externe
        const fetchEmployees = async () => {
            try{

                // Stockena anaty data ny données
                const response = await fetch('https://dummyjson.com/users');    
                const data = await response.json();


                //Stockena anaty imagesData ny sary
                const imagesResponse = await fetch('https://randomuser.me/api/?results=30');
                const imagesData = await imagesResponse.json();

                //fusionner les données (images + data)
                const employeesWithImages = data.users.map((employee,index) => ({
                    //repeter les proprietes de employee qui sont: nom,age,salaire etc
                    ...employee,    

                     //ra tsisy le image dia image random no affichena
                    image: imagesData.results[index]?.picture.large || "https://picsum.photos/150" 
                }));

                //MAJ etat
                setEmployees(employeesWithImages);

            }
            // Gestion des erreurs potentielles
            catch (error){
                console.log('erreur lors de la recuperation des données', error);
            }
            finally{
                setLoading(false);
            }
        }

        //appel de la fonction 
        fetchEmployees();

    }, []);

        return(
            <section>
                <h1 className="font-bold px-4 text-2xl">Team</h1>
                {loading ? (
                    <div className="flex justify-center items-center h-screen">
                        <div className="h-16 w-16 inline-block rounded-full border-4 border-t-transparent border-gray-400 border-solid spinner-border animate-spin"></div>
                    </div>
                ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {employees.map(employee => (
                        <div key={employee.id} className="p-4">
                            <div className="bg-white rounded-xl p-12 h-[500px] text-center shadow-lg space-y-2 overflow-hidden">
                                <div className="flex justify-center flex-1">
                                    <img src={employee.image} alt={employee.image} className="rounded-full" />
                                </div>
                                <h2 className="font-bold">{employee.firstName} {employee.lastName}</h2>
                                <h3 className="text-gray-500 text-sm font-thin sm:text-xl"> {employee.company.title} </h3>
                                <h4 className="text-xs sm:text-lg lg:text-sm ">Username: {employee.username} </h4>
                                <h4 className="text-xs sm:text-lg lg:text-sm ">Password: {employee.password} </h4>
                                <h4 className="text-xs sm:text-lg lg:text-sm "> {employee.address.address} </h4>
                                <h4 className="text-xs sm:text-lg lg:text-sm "> {employee.phone} </h4>
                                <h4 className="text-xs sm:text-lg lg:text-sm  text-gray-500 mt-auto"> {employee.email} </h4>
                            </div>
                        </div>
                    ))}


                </div>
                )
            }
            </section>

        )
    }
        export default EmployeeList;
