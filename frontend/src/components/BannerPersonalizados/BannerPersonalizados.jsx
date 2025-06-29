import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  BsPalette, 
  BsStarFill, 
  BsArrowRight, 
  BsPencilSquare, 
  BsCalendar3, 
  BsClipboard2, 
  BsTag,
  BsBrush,
  BsLightning,
  BsGift
} from 'react-icons/bs';
import './BannerPersonalizados.css';

const BannerPersonalizados = () => {
  return (
    <section className="banner-personalizados">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <div className="banner-content">
              <div className="banner-badge">
                <BsStarFill className="me-2" />
                ✨ Novidade
              </div>
              <h2 className="banner-title">
                Produtos Personalizados
              </h2>
              <p className="banner-description">
                Crie produtos únicos com seu nome, cores e estilo pessoal. 
                Cadernos, agendas, planners e muito mais com a sua identidade!
              </p>
              <div className="banner-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <BsBrush />
                  </div>
                  <span>Design Personalizado</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <BsLightning />
                  </div>
                  <span>Entrega Rápida</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <BsGift />
                  </div>
                  <span>Presente Perfeito</span>
                </div>
              </div>
              <Link to="/produtos-personalizados" className="text-decoration-none">
                <Button className="banner-cta" size="lg">
                  🛍️ Criar Meu Produto
                  <BsArrowRight className="ms-2" />
                </Button>
              </Link>
            </div>
          </Col>
          <Col lg={6}>
            <div className="banner-visual">
              <div className="product-showcase">
                <div className="product-item">
                  <div className="product-icon">
                    <BsPencilSquare />
                  </div>
                  <span>Cadernos</span>
                </div>
                <div className="product-item">
                  <div className="product-icon">
                    <BsCalendar3 />
                  </div>
                  <span>Agendas</span>
                </div>
                <div className="product-item">
                  <div className="product-icon">
                    <BsClipboard2 />
                  </div>
                  <span>Planners</span>
                </div>
                <div className="product-item">
                  <div className="product-icon">
                    <BsTag />
                  </div>
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
