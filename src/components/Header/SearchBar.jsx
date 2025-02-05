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
        <div className="flex items-center w-full">
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
                    placeholder="Search"
                    className="border w-3/4 pl-7 rounded-full focus:outline-none"
                    />
                </div>
            )}
        </div>
    )
}


export default SearchBar;