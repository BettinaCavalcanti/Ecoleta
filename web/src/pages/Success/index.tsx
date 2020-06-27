import React from 'react';
import { Link } from 'react-router-dom'; // troca de conteúdo durante a troca de rota
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './styles.css';
import logo from '../../assets/logo.svg';

const Success = () => {
  return(
      <div id="page-success">  
          <header>
              <img src={logo} alt="Ecoleta"/>
              <Link to="/">
                  <FiArrowLeft />
                  Voltar para home
              </Link>
          </header>
          <div className="content">
            <div className="icon-success">
              <FiCheckCircle color='#2FB86E' size='80'/>
            </div>
            <main>
              <h1>
                Ponto de coleta cadastrado com sucesso!
              </h1>
            </main>
        </div>
      </div>
    );
}

export default Success;