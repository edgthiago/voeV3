import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsPalette, BsStarFill, BsArrowRight } from 'react-icons/bs';
import './BannerPersonalizados.css';

const BannerPersonalizados = () => {
  return (
    <section className="banner-personalizados">
      <Container>
        <Row className="align-items-center min-vh-50">
          <Col lg={6}>
            <div className="banner-content">
              <div className="banner-badge">
                <BsStarFill className="me-2" />
                Novidade
              </div>
              <h2 className="banner-title">
                <BsPalette className="me-3" />
                Produtos Personalizados
              </h2>
              <p className="banner-description">
                Crie produtos únicos com seu nome, cores e estilo pessoal. 
                Cadernos, agendas, planners e muito mais com a sua cara!
              </p>
              <div className="banner-features">
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <span>Design Personalizado</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Entrega Rápida</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💝</span>
                  <span>Presente Perfeito</span>
                </div>
              </div>
              <Link to="/produtos-personalizados">
                <Button className="banner-cta" size="lg">
                  Criar Meu Produto
                  <BsArrowRight className="ms-2" />
                </Button>
              </Link>
            </div>
          </Col>
          <Col lg={6}>
            <div className="banner-visual">
              <div className="product-showcase">
                <div className="product-item">
                  <div className="product-icon">📝</div>
                  <span>Cadernos</span>
                </div>
                <div className="product-item">
                  <div className="product-icon">📅</div>
                  <span>Agendas</span>
                </div>
                <div className="product-item">
                  <div className="product-icon">📋</div>
                  <span>Planners</span>
                </div>
                <div className="product-item">
                  <div className="product-icon">🏷️</div>
                  <span>Etiquetas</span>
                </div>
              </div>
              <div className="banner-decoration">
                <div className="decoration-circle"></div>
                <div className="decoration-dots"></div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BannerPersonalizados;
