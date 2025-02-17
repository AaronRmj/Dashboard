import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const Layout = ({ children }) => {
  return (
      <div className='bg-gray-100 flex'>
          <Sidebar className="" />
          <Header />
          <div className='md:ml-60'>
                {children}
          </div>
      </div>
  );
};

export default Layout;
