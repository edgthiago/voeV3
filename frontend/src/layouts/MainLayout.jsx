import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function MainLayout({ children }) {
  const location = useLocation();

  // Rotas que não devem exibir o Header nem Footer
  const rotasSemLayout = ['/entrar', '/cadastro'];

  const ocultarLayout = rotasSemLayout.includes(location.pathname);

  return (
    <>
      {!ocultarLayout && <Header />}
      
      <div className="conteudo-principal">
        {children}
      </div>

      {!ocultarLayout && <Footer />}
    </>
  );
}