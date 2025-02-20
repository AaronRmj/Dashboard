import React from "react";
import {useState, useEffect} from 'react'

const ProductsStock = () =>{
        //initialisation etat product avec un tab vide
        const [products, setProducts] = useState([]);

        //useEffect synchronise components avec system externe (API izy eto)
        useEffect(() =>{
            
            const fetchProduct = async () =>{   //fetchProduct est une fonction asynchrone
                try{
                    //fetch des données
                    const response = await fetch('https://fakestoreapi.com/products');
                    
                    //analyse du fichier json retourné
                    const data = await response.json();
                    
                    //MAJ de l'etat
                    setProducts(data);
                }
                //intercepter les erreurs
                catch (error) {
                    console.log('recuperation des données impossible', error);
                }
            }
            fetchProduct();
        }, [])
    
    return(   
        <section>
            {products.map(product => (      //enveloppena anaty section fona na expression logique aza
                <div key={product.id} >
                    <img src={product.image} alt="pd-img" className="h-7" />
                    <h1>{product.name}</h1>
                    <h3>{product.category}</h3>
                    <p>{product.price}</p>
                </div>
            ))}
        </section>

        )
}


export default ProductsStock;