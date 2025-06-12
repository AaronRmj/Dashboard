import React from 'react';
import Sidebar from './sidebar/Sidebar'
import Header from './header/Header'

const Layout = ({ children }) => {
  return (

      <div className='bg-gray-100 h-[200vh] flex'>

          <Sidebar className="" />
          <Header />
          <div className='md:ml-60 mt-17 flex-1'>
                {children}
          </div>
      </div>
  );
};

export default Layout;
