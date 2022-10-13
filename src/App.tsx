import React from 'react';
import theme from './lib/theme/base.module.scss';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Main} from './Main';
import {Buttons} from './pages/Buttons';
import cn from 'classnames';
import styles from './App.module.scss';

function App() {
  return (
    <BrowserRouter>
      <div className={cn(theme.root, styles.root)}>
        <Routes>
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/" element={<Main />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
