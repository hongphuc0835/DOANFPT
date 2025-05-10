import React, { useState } from 'react';
import UsersService from './UsersService';
import Sidebar from '../menu/Sidebar';
import ContentHeader from '../menu/ContentHeader';
import './UserDetails.css';

const UserDetails = () => {


  return (
    <div className="main">
      <Sidebar />
      <div className="content">
        <ContentHeader />
        <div className="userdetails">

        </div>
      </div>
    </div>
  );
};

export default UserDetails;
