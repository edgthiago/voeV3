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
          <Col lg={6} className="order-2 order-lg-1">
            <div className="banner-content">
              <div className="banner-badge">
                <BsStarFill className="me-2" />
                ✨ Exclusivo
              </div>
              <h2 className="banner-title">
                Produtos <span className="text-gradient">Personalizados</span>
              </h2>
              <p className="banner-description">
                Transforme suas ideias em realidade! Crie produtos únicos com seu nome, cores e estilo pessoal. 
                Cadernos, agendas, planners e muito mais com a sua identidade especial.
              </p>
              
              <div className="banner-stats">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Produtos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15k+</div>
                  <div className="stat-label">Clientes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">5⭐</div>
                  <div className="stat-label">Avaliação</div>
                </div>
              </div>
              
              <div className="banner-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <BsBrush />
                  </div>
                  <div className="feature-content">
                    <span className="feature-title">Design Premium</span>
                    <span className="feature-desc">Personalização completa</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <BsLightning />
                  </div>
                  <div className="feature-content">
                    <span className="feature-title">Entrega Rápida</span>
                    <span className="feature-desc">Até 5 dias úteis</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <BsGift />
                  </div>
                  <div className="feature-content">
                    <span className="feature-title">Presente Perfeito</span>
                    <span className="feature-desc">Embalagem especial</span>
                  </div>
                </div>
              </div>
              
              <div className="banner-cta-container">
                <Link to="/produtos-personalizados" className="text-decoration-none">
                  <Button className="banner-cta" size="lg">
                    <BsPalette className="me-2" />
                    Criar Meu Produto
                    <BsArrowRight className="ms-2" />
                  </Button>
                </Link>
                <div className="cta-info">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    Satisfação garantida ou seu dinheiro de volta
                  </small>
                </div>
              </div>
            </div>
          </Col>
          
          <Col lg={6} className="order-1 order-lg-2">
            <div className="banner-visual">
              <div className="product-showcase">
                <div className="product-item featured">
                  <div className="product-icon">
                    <BsPencilSquare />
                  </div>
                  <div className="product-content">
                    <span className="product-name">Cadernos</span>
                    <span className="product-desc">Personalizados</span>
                  </div>
                  <div className="product-badge">Popular</div>
                </div>
                
                <div className="product-item">
                  <div className="product-icon">
                    <BsCalendar3 />
                  </div>
                  <div className="product-content">
                    <span className="product-name">Agendas</span>
                    <span className="product-desc">2025</span>
                  </div>
                </div>
                
                <div className="product-item">
                  <div className="product-icon">
                    <BsClipboard2 />
                  </div>
                  <div className="product-content">
                    <span className="product-name">Planners</span>
                    <span className="product-desc">Exclusivos</span>
                  </div>
                </div>
                
                <div className="product-item">
                  <div className="product-icon">
                    <BsTag />
                  </div>
                  <div className="product-content">
                    <span className="product-name">Etiquetas</span>
                    <span className="product-desc">Coloridas</span>
                  </div>
                </div>
              </div>
              
              <div className="banner-decoration">
                <div className="decoration-circle-1"></div>
                <div className="decoration-circle-2"></div>
                <div className="decoration-dots"></div>
                <div className="decoration-lines"></div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BannerPersonalizados;
