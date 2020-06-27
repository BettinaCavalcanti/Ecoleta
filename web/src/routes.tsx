import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import Home from './Home';
import CreatePoint from './CreatePoint';
import Success from './pages/Success';

const Routes = () => {
    return (
        <BrowserRouter>
          <Route component={Home} path="/" exact /> 
          <Route component={CreatePoint} path="/criar-ponto" />
          <Route component={Success} path="/sucesso" />
        </BrowserRouter>
    );
}

export default Routes;