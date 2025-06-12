import React from "react";
import {useState} from "react";
import Button from "../../components/ui/Button";
import { IoCloseOutline } from "react-icons/io5";
import Label from "../../components/ui/Label";


const Customers = () =>{
    const [inVoice, setInVoiceOpen] = useState(false);
    const [sucess, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        Client:{
            Nom:"",
            Telephone:"",
            Adresse:"",
            Email:"",
        },
        Produit:[
            {
                Quantite:"",
                Date:"",
                CodeProduit:"",
                NumEmploye:""
            }   
        ]
    })
    

    const ProduitChange = (index, name, value) => {
        console.log(index, name);
        setFormData((prev) => {
            const UpdatedProduits = [...prev.Produit];
            UpdatedProduits[index] = {...UpdatedProduits[index], [name] : value};
            return {...prev, Produit : UpdatedProduits}
        });
        console.log(formData);
    };

    const ClientChange = (e) =>{
        const {name,value} = e.target;
        setFormData((prev) => ({...prev, Client:{...prev.Client, [name]:value}}));
        console.log(formData);
    }
    
    const addRow = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            Produit: [
                ...prevFormData.Produit,
                {
                    Quantite:"",
                    Date:"",
                    CodeProduit:"",
                    NumEmploye:""   
                }
            ]
        }));
    };

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
          Produits: formData.Produit
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
                const erreur = await response.json();
                throw new Error(`${erreur.error}`);
            }
            
            const data = await response.json();
            alert(data.message);
            setInVoiceOpen(false);
        }
        catch (error) {
            alert(error);
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
                                 onChange={ClientChange}  
                                 />
                            </div>
                              <Label
                                  text="Email du Client"
                                  placeholder="ex : GameOfThrones@gmail.com"
                                  name="Email"
                                  value={formData.Client.Email}
                                  onChange={ClientChange}
                                  />
                            <div>
                                <label className="block text-gray-700 font-thin mb-1">Numéro / Adresse du Client</label>
                                <Label
                                    placeholder="ex: +261383008728"
                                    name="Telephone"
                                    value={formData.Client.Telephone}
                                    onChange={ClientChange}
                                    
                                    />
                                    
                                <Label placeholder="ex: Winterfell, nord"
                                    name="Adresse"
                                    value={formData.Client.Adresse}
                                    onChange={ClientChange}
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
                                {formData.Produit.map((item, index) => (
                                    <tr key = {index} className="text-left">
                                        <td><Label
                                            inputClassName="border-none"
                                            placeholder="6"
                                            name="CodeProduit"
                                            type="number"
                                            value={item.CodeProduit}
                                            onChange={(e)=> ProduitChange(index, e.target.name , e.target.value )}
                                            />
                                            
                                        </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            type="date"
                                            name="Date"
                                            value={item.Date}
                                            onChange={(e)=> ProduitChange(index, e.target.name , e.target.value)}
                                         />
                                         </td>
                                        <td><Label 
                                            inputClassName="border-none"
                                            placeholder="2"
                                            name="Quantite"
                                            type="number"
                                            value={item.Quantite}
                                            onChange={(e)=> ProduitChange(index, e.target.name , e.target.value)}         
                                         />
                                        </td>
                                        <td><Label
                                            inputClassName="border-none"
                                            placeholder="1"
                                            name="NumEmploye"
                                            type="number"
                                            value={item.NumEmploye}
                                            onChange={(e)=> ProduitChange(index, e.target.name , e.target.value)}
                                        />   
                                        </td>      
                                    </tr>)
                                    )
                                }
                                </tbody>
                                
                            </table>

                                <div>
                                    <Button label="Ajouter items" onClick={addRow} type="button"/>
                                </div>

                            <div>
                                <Button label="Effectuer Vente" type="submit"/>
                            </div>
                    </form>
                </section>
            )}
        </section>
    )
}
export default Customers