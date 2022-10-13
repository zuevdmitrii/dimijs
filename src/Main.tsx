import React from 'react';
import {Link} from 'react-router-dom';

export const Main = ()=>{
  return (
    <>
      <h1>This is playground for dimijs components</h1>
      <ul>
        <li><Link to='/buttons'>Buttons</Link></li>
      </ul>
    </>
  );
};

