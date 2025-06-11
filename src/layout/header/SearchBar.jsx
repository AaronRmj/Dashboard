import React from "react";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";


const SearchBar = () =>{
    // État pour gérer l'affichage de la barre de recherche
    const [isOpen, setIsOpen] = useState(false);

    // Fonction pour gérer l'ouverture/fermeture de la barre
    const toggleSearch = () =>{
        setIsOpen(!isOpen);
    };

    return(
        <div className="flex items-center w-full lg:ml-25">
            {/*icone de recherche*/}
            <button
                onClick={toggleSearch}
                className="p-2 rounded-full"
            >
            <IoSearchOutline />
            </button>
            
            {isOpen && ( // Si isOpen est True alors ces instructions seront exéxutées
                <div className="absolute">
                    <input
                    type="text"
                    placeholder="Search .........."
                    className="bg-gray-100 rounded-md focus:outline-none w-110 px-4 focus:ring-2 focus:ring-blue-500  py-2 text-sm border-gray-200"
                    />
                </div>
            )}
        </div>  
    )
}


export default SearchBar;