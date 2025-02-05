import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/Pages/Dashboard'
import Customers from './components/Pages/Customers'


function App() {

  return (
    <Router className="font-primary bg-gray-100">
        {/*Header et Sidebar sont en dehors de Routes car elles sont visibles peu importe la page actuelle*/}
        <Header/> 
        <Sidebar/>       
        <Routes>
            <Route path='/' element={ <Dashboard/> }/>
            <Route path='/Customers' element={ <Customers/> }/>
        
        </Routes>
          
          
        
    </Router>
  )
}

export default App;
