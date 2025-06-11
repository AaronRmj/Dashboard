import React from "react";
import {useState} from "react";
import Button from "../../components/ui/Button";
import { IoCloseOutline } from "react-icons/io5";
import Label from "../../components/ui/Label";


const Customers = () =>{
    const [inVoice, setInVoiceOpen] = useState(false);

    const [formData, setFormData] = useState({
        Client:{
            Nom:"",
            Telephone:"",
            Adresse:"",
            Email:"",
        },
        Produit:{
            Quantite:"",
            Date:"",
            CodeProduit:"",
            NumEmploye:""   
        },
    })
    


    const handleChange = (e) =>{
        const {name,value} = e.target;
        setFormData((prev) =>{
            // Si `name` est un des éléments dans le tableau, exécute ce bloc
            if (["Nom","Adresse", "Email"].includes(name)){
                return { ...prev, Client:{...prev.Client, [name]:value }};
            }
            
            if (["Telephone"].includes(name)){
                return {...prev, Client:{...prev.Client, [name]:value}};
            }

            if (["Date"].includes(name)){
                return{...prev, Produit:{...prev.Produit, [name]:value}}
            }

            if (["Quantite", "CodeProduit", "NumEmploye"].includes(name))
                return { ...prev, Produit:{...prev.Produit, [name]:parseInt(value, 10) || 0 }};
            return {...prev, [name]:value};
        })
    }

    const handleInvoice = () =>{
        setInVoiceOpen(true);
    }

    const closePopup = () =>{
        setInVoiceOpen(false)
    }

    //refa alefa ilay formulaire
    const onSubmit = async (e) =>{
        e.preventDefault();
        
        const dataToSend = {
          Client: formData.Client,
          Produits: [formData.Produit] //avadika tableau satria zay no raisin ny backend
        }

        try{
            const response = await fetch('http://localhost:8080/Vente',{
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),

            })
            if (!response.ok) {
                throw new Error("Erreur lors de la création de la facture");
            }

            const data = await response.json();
            console.log("facture crée avec succes", data);
            alert("Facture crée avec succès!");
            setInVoiceOpen(false);
        }
        catch (error) {
            console.error("Erreur de la soumission",error);
            alert('Echec de l\'envoie des données');
        }
    }

    return(
        <section className="h-screen">
            {!inVoice ? (
                
                //ra false ilay inVoice dia tsisy retour
                <section className="mx-auto space-x-6 lg:max-w-md w-2xs h-screen flex justify-between items-center" onClick={handleInvoice}>
                    <Button label="Create New Invoice"/>
                </section>
            ) : (

                //ra true ilay inVoice ilay return formulaire
                <section  className="p-3 overflow-hidden flex justify-center">
                    <form onSubmit={onSubmit} className="bg-white p-7 lg:max-w-xl rounded-xl shadow-lg relative">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">Nouvelle facture</h2>
                            <IoCloseOutline className="text-2xl" onClick={closePopup} />
                        </div>
                        <h1 className="text-2xl font-bold">FACTURE #</h1>
                        <h3 className="font-bold mb-5">Détails</h3>
                            <div className="grid grid-cols-1">
                                <Label
                                 text="Nom du Client" 
                                 placeholder="ex: Jon snow"
                                 name="Nom"
                                 value={formData.Client.Nom}
                                 onChange={handleChange}  
                                 />
                            </div>
                              <Label
                                  text="Email du Client"
                                  placeholder="ex : GameOfThrones@gmail.com"
                                  name="Email"
                                  value={formData.Client.Email}
                                  onChange={handleChange}
                                  />
                            <div>
                                <label className="block text-gray-700 font-thin mb-1">Numéro / Adresse du Client</label>
                                <Label
                                    placeholder="ex: +261383008728"
                                    name="Telephone"
                                    value={formData.Client.Telephone}
                                    onChange={handleChange}
                                    
                                    />
                                    
                                <Label placeholder="ex: Winterfell, nord"
                                    name="Adresse"
                                    value={formData.Client.Adresse}
                                    onChange={handleChange}
                                    />
                            </div>
                            {/* <label className="text-lg">Issued on </label>  */}
                            
                            <h1 className="my-5 font-bold">Article de facture</h1>
                            <table className="my-10 flex-1">
                                <thead>
                                    <tr className="text-left">
                                        <th className="font-thin">Code Produit</th>
                                        <th className="font-thin">Date de règlement</th>
                                        <th className="font-thin">Quantité</th>
                                        <th className="font-thin">Num Employé</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-left">
                                        <td><Label
                                            inputClassName="border-none"
                                            placeholder="6"
                                            name="CodeProduit"
                                            type="number"
                                            value={formData.Produit.CodeProduit}
                                            onChange={handleChange}
                                            />
                                            
                                        </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            type="date"
                                            name="Date"
                                            value={formData.Produit.Date}
                                            onChange={handleChange}
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            placeholder="2"
                                            name="Quantite"
                                            type="number"
                                            value={formData.Produit.Quantite}
                                            onChange={handleChange}
                                                        
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none" 
                                            placeholder="3"
                                            type="number"
                                            name="NumEmploye"
                                            value={formData.Produit.NumEmploye}
                                            onChange={handleChange}
                                        />
                                        </td>
                                    </tr>
                                </tbody>
                                {/* <div className="flex w-60 justify-between absolute lg:right-25 mb-72">
                                        <button className="text-blue-800">+ Add item</button>
                                        <p>Total Amount</p>
                                        <p>$40</p>
                                </div> */}
                            </table>
                            <div>
                                <Button label="Create Invoice" type="submit"/>
                            </div>
                    </form>
                </section>
            )}
        </section>
    )
}
export default Customers