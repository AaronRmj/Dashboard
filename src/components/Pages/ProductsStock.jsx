import React from "react";
import {useState, useEffect} from 'react'
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";


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

                    //shorten productName to 15 characters or less
                    const modifiedData = data.map((product) => ({
                        ...product,
                        title: product.title.length > 15 ? product.title.slice(0,15) + "..." : product.title
                    }))
                    
                    //MAJ de l'etat
                    setProducts(modifiedData);
                }
                //intercepter les erreurs
                catch (error) {
                    console.log('recuperation des données impossible', error);
                }
            }
            fetchProduct();
        }, [])
    
    return(   
        //container pour bien centrer 
        <section className="container mx-auto">
            {/* Pour mobile design */}
            <div className="block md:hidden">
                {
                    products.map((product , index) => (
                        <div className="bg-white relative m-5 rounded-lg shadow-md flex space-x-7 items-center px-7 py-4">
                            <div className="">
                                <img src={product.image} alt="pd-img" className="h-16 w-16" />
                            </div>
                            <div>
                                <h1 className="font-bold text-md"> {product.title} </h1>
                                <h2 className="text-gray-500 text-sm"> {product.category} </h2>
                                <p className="text-blue-600 text-lg"> {product.price}$ </p>
                                <p className="text-sm">Count: {product.rating.count} </p>
                            </div>
                            <div className="space-y-2 absolute right-6">
                                <CiEdit className="h-6 w-6"/>
                                <RiDeleteBin6Line className="h-6 w-6"/>
                            </div>
                        </div>
                    ))
                }
            </div>
            {/*Pour grand ecran*/}
            <section className="bg-white rounded-xl lg:m-5 p-4">
        <div className="hidden md:block overflow-hidden rounded-xl">
          <table className="w-full border-collapse border-gray-300">
            <thead className="bg-gray-100">
              <tr className=" text-left">
                            <th className="p-2">Product</th>
                            <th  className="p-2">Category</th>
                            <th  className="p-2">Price</th>
                            <th  className="p-2">Items</th>
                            <th  className="p-2 text-center">Action</th>
                        </tr>                                
                    </thead>
                    <tbody className="">
                        {products.map((product, index) => (
                            <tr className="space-y-5 border-b-1 border-gray-200">
                                <td className="py-3 px-6 flex items-center gap-4 text-sm font-bold"><img src={product.image} className="h-12 w-12 mr-6" alt="pd-img" /> {product.title} </td>
                                <td className="text-gray-500 text-sm"> {product.category} </td>
                                <td className="text-blue-600 text-sm">  {product.price}$  </td>
                                <td className="text-center">  {product.rating.count}  </td>
                                <td className="md:flex justify-center space-x-2 cursor-pointer"><CiEdit className="text-gray-600 h-5 w-5"/><RiDeleteBin6Line className="h-5 w-5 text-red-500"/></td>
                            </tr>
                        ))}

                    </tbody>
                </table>
                </div>
            </section>    
        </section>

        
)
};

export default ProductsStock