import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer">
        {/* Newsletter Section */}
        <div className="newsletter-section">
          <Container>
            <Row className="align-items-center">
              <Col lg={6}>
                <div className="newsletter-content">
                  <h4 className="newsletter-title">
                    <i className="bi bi-envelope-heart-fill me-2"></i>
                    Receba nossas ofertas especiais!
                  </h4>
                  <p className="newsletter-description">
                    Cadastre-se e seja o primeiro a saber sobre promoções, novidades e produtos exclusivos.
                  </p>
                </div>
              </Col>
              <Col lg={6}>
                <div className="newsletter-form">
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control newsletter-input" 
                      placeholder="Digite seu melhor e-mail"
                      aria-label="E-mail para newsletter"
                    />
                    <Button className="btn-newsletter">
                      <i className="bi bi-send-fill me-2"></i>
                      Cadastrar
                    </Button>
                  </div>
                  <div className="newsletter-benefits">
                    <span className="benefit-item">
                      <i className="bi bi-gift-fill"></i>
                      Ofertas exclusivas
                    </span>
                    <span className="benefit-item">
                      <i className="bi bi-lightning-fill"></i>
                      Primeiros a saber
                    </span>
                    <span className="benefit-item">
                      <i className="bi bi-award-fill"></i>
                      Conteúdo premium
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <Container>
          <Row className="footer-main">
            {/* Brand Section */}
            <Col lg={4} md={6} className="mb-4 mb-lg-0">
              <div className="footer-brand">
                <div className="brand-logo">
                  <img src="../../img/voePapel/voePapel.jpeg" alt="Voe Papel" />
                  <div className="brand-info">
                    <h3 className="brand-text">Voe Papel</h3>
                    <span className="brand-tagline">Papelaria Premium</span>
                  </div>
                </div>
              </div>
              <p className="footer-description">
                🌸 Transformamos suas ideias em realidade com produtos de papelaria únicos e personalizados. 
                Qualidade premium para seus projetos escolares, profissionais e artísticos.
              </p>
              
              {/* Stats Section */}
              <div className="footer-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Produtos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">10k+</span>
                  <span className="stat-label">Clientes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5⭐</span>
                  <span className="stat-label">Avaliação</span>
                </div>
              </div>

              <div className="footer-social">
                <h6 className="social-heading">Nos siga nas redes</h6>
                <div className="social-links">
                  <a href="https://facebook.com/voepapel" className="social-link facebook" target="_blank" rel="noopener noreferrer" title="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://instagram.com/voepapel" className="social-link instagram" target="_blank" rel="noopener noreferrer" title="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="https://twitter.com/voepapel" className="social-link twitter" target="_blank" rel="noopener noreferrer" title="Twitter">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="https://youtube.com/@voepapel" className="social-link youtube" target="_blank" rel="noopener noreferrer" title="YouTube">
                    <i className="bi bi-youtube"></i>
                  </a>
                  <a href="https://tiktok.com/@voepapel" className="social-link tiktok" target="_blank" rel="noopener noreferrer" title="TikTok">
                    <i className="bi bi-tiktok"></i>
                  </a>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-4 mb-lg-0">
              <h5 className="footer-heading">
                <i className="bi bi-compass me-2"></i>
                Navegação
              </h5>
              <ul className="footer-links">
                <li><Link to="/"><i className="bi bi-house-door"></i>Início</Link></li>
                <li><Link to="/produtos"><i className="bi bi-grid-3x3-gap"></i>Produtos</Link></li>
                <li><Link to="/produtos-personalizados"><i className="bi bi-palette2"></i>Personalizados</Link></li>
                <li><Link to="/sobre"><i className="bi bi-info-circle"></i>Sobre Nós</Link></li>
                <li><Link to="/contato"><i className="bi bi-chat-dots"></i>Contato</Link></li>
              </ul>
            </Col>

            {/* Categories */}
            <Col lg={3} md={6} className="mb-4 mb-lg-0">
              <h5 className="footer-heading">
                <i className="bi bi-collection me-2"></i>
                Categorias
              </h5>
              <div className="categories-grid">
                <Link to="/produtos?categoria=escolar" className="category-card">
                  <i className="bi bi-book-half"></i>
                  <div>
                    <span className="category-name">Material Escolar</span>
                    <span className="category-count">120+ itens</span>
                  </div>
                </Link>
                <Link to="/produtos?categoria=arte" className="category-card">
                  <i className="bi bi-palette-fill"></i>
                  <div>
                    <span className="category-name">Arte & Craft</span>
                    <span className="category-count">85+ itens</span>
                  </div>
                </Link>
                <Link to="/produtos?categoria=escritorio" className="category-card">
                  <i className="bi bi-briefcase-fill"></i>
                  <div>
                    <span className="category-name">Escritório</span>
                    <span className="category-count">150+ itens</span>
                  </div>
                </Link>
                <Link to="/produtos?categoria=cadernos" className="category-card">
                  <i className="bi bi-journal-text"></i>
                  <div>
                    <span className="category-name">Cadernos</span>
                    <span className="category-count">90+ itens</span>
                  </div>
                </Link>
              </div>
            </Col>

            {/* Contact & Support */}
            <Col lg={3} md={6}>
              <h5 className="footer-heading">
                <i className="bi bi-headset me-2"></i>
                Atendimento
              </h5>
              
              <div className="contact-card">
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-whatsapp"></i>
                  </div>
                  <div className="contact-info">
                    <strong>WhatsApp</strong>
                    <span>(85) 99999-9999</span>
                    <small>Resposta rápida</small>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-envelope-at"></i>
                  </div>
                  <div className="contact-info">
                    <strong>E-mail</strong>
                    <span>contato@voepapel.com.br</span>
                    <small>24h para resposta</small>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-clock"></i>
                  </div>
                  <div className="contact-info">
                    <strong>Horário de Funcionamento</strong>
                    <span>Segunda à Sexta: 8h às 18h</span>
                    <span>Sábado: 8h às 14h</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <i className="bi bi-shield-check"></i>
                  <span>Compra Segura</span>
                </div>
                <div className="trust-badge">
                  <i className="bi bi-truck"></i>
                  <span>Entrega Rápida</span>
                </div>
                <div className="trust-badge">
                  <i className="bi bi-arrow-repeat"></i>
                  <span>Troca Fácil</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <Container>
            <Row className="align-items-center">
              <Col lg={4} md={6} className="text-center text-md-start mb-3 mb-md-0">
                <p className="copyright">
                  <i className="bi bi-c-circle me-1"></i>
                  {currentYear} <strong>Voe Papel</strong>. Todos os direitos reservados.
                </p>
                <div className="legal-links">
                  <Link to="/termos">Termos de Uso</Link>
                  <Link to="/privacidade">Privacidade</Link>
                  <Link to="/cookies">Cookies</Link>
                </div>
              </Col>
              
              <Col lg={4} md={6} className="text-center mb-3 mb-md-0">
                <div className="payment-methods">
                  <span className="payment-label">Formas de Pagamento</span>
                  <div className="payment-icons">
                    <div className="payment-icon pix" title="PIX - Aprovação instantânea">
                      <i className="bi bi-qr-code"></i>
                      <span>PIX</span>
                    </div>
                    <div className="payment-icon card" title="Cartão - Em até 12x">
                      <i className="bi bi-credit-card-2-front"></i>
                      <span>Cartão</span>
                    </div>
                    <div className="payment-icon boleto" title="Boleto - Vencimento em 3 dias">
                      <i className="bi bi-receipt"></i>
                      <span>Boleto</span>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col lg={4} className="text-center text-lg-end">
                <div className="certifications">
                  <div className="cert-item">
                    <i className="bi bi-shield-fill-check"></i>
                    <span>SSL Seguro</span>
                  </div>
                  <div className="cert-item">
                    <i className="bi bi-award-fill"></i>
                    <span>LGPD</span>
                  </div>
                  <div className="cert-item">
                    <i className="bi bi-patch-check-fill"></i>
                    <span>Loja Verificada</span>
                  </div>
                </div>
                
                <div className="back-to-top">
                  <button 
                    className="btn-back-to-top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    title="Voltar ao topo"
                  >
                    <i className="bi bi-arrow-up-circle-fill"></i>
                    <span>Topo</span>
                  </button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </footer>
    </>
  );
};

export default Footer;
