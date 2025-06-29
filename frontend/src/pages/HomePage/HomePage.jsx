import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './HomePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import HomeCarrosel from '../../components/HomeCarrosel/HomeCarrosel';
import HomeColecaoDestaque from '../../components/HomeColecaoDestaque/HomeColecaoDestaque';
import HomeProdutos from '../../components/HomeProdutos/HomeProdutos';
import HomeOferta from '../../components/HomeOferta/HomeOferta';
import BannerPersonalizados from '../../components/BannerPersonalizados/BannerPersonalizados';




const HomePage = () => {
  return (
    <>
    <HomeCarrosel/>
    <HomeColecaoDestaque/>
    <BannerPersonalizados/>
    <HomeProdutos/>
    <HomeOferta/>
    
    
    </>
  );
};

export default HomePage;