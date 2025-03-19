import React from "react";
import {useState} from "react";

//definit les valeurs par defaut pour chaque champ du formulaire
const useForm = (initialValues) =>{
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});

    //Gestion des changements dans les champs du formulaire
    const handleChange = (e) =>{
        /*Destructuration, e.target ilay element HTML kitiana, name ilay nom any dia value ilay valeur any
        au lieu de
        const name = e.target.name;
        const value = e.target.value;
        */
        const {name, value} = e.target;
        setFormData({
            ...formData,
            //passer dynamiquement name et value
            [name]:value,   //Mettre à jour la valeur du champ correspondant
        })
    }
    

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (url) =>{
        try{
            const response = await fetch(url,{
                method: 'POST',
                //Indique que les données envoyées sont au format JSON.
                headers: {
                    "Content-type": "application/json",
                },
                //mamadika an formData ho lasa chaine json
                body: JSON.stringify(formData),
                
            });
            
            if (!response.ok) throw new Error("Erreur de la soumission");

            return await response.json();

        }
        catch (error){
            setErrors({submit: "Echec de l'envoie du formulaire"});
        }

}

    return{
        formData,
        handleChange,
        handleSubmit,
        errors
    }
}
export default useForm;