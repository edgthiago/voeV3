import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <Container>
          <Row className="footer-main">
            {/* Brand Section */}
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <div className="footer-brand">
                <img src="../../img/voePapel/voePapel.jpeg" alt="Voe Papel" />
                <h3 className="brand-text">Voe Papel</h3>
              </div>
              <p className="footer-description">
                Sua papelaria online completa! ✨ Encontre tudo para escola, escritório e arte com qualidade premium.
              </p>
              <div className="footer-social">
                <a href="https://facebook.com/voepapel" className="social-link" target="_blank" rel="noopener noreferrer" title="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://instagram.com/voepapel" className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="https://twitter.com/voepapel" className="social-link" target="_blank" rel="noopener noreferrer" title="Twitter">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="https://youtube.com/@voepapel" className="social-link" target="_blank" rel="noopener noreferrer" title="YouTube">
                  <i className="bi bi-youtube"></i>
                </a>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-3 mb-lg-0">
              <h5 className="footer-heading">
                <i className="bi bi-info-circle me-2"></i>
                Links
              </h5>
              <ul className="footer-links">
                <li><Link to="/sobre"><i className="bi bi-arrow-right me-2"></i>Sobre</Link></li>
                <li><Link to="/contato"><i className="bi bi-arrow-right me-2"></i>Contato</Link></li>
                <li><Link to="/termos"><i className="bi bi-arrow-right me-2"></i>Termos</Link></li>
                <li><Link to="/produtos-personalizados"><i className="bi bi-arrow-right me-2"></i>Personalizados</Link></li>
              </ul>
            </Col>

            {/* Categories */}
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <h5 className="footer-heading">
                <i className="bi bi-grid me-2"></i>
                Categorias
              </h5>
              <ul className="footer-links">
                <li><Link to="/produtos?categoria=escolar"><i className="bi bi-book me-2"></i>Escolar</Link></li>
                <li><Link to="/produtos?categoria=arte"><i className="bi bi-palette me-2"></i>Arte</Link></li>
                <li><Link to="/produtos?categoria=escritorio"><i className="bi bi-briefcase me-2"></i>Escritório</Link></li>
                <li><Link to="/produtos?categoria=cadernos"><i className="bi bi-journal me-2"></i>Cadernos</Link></li>
              </ul>
            </Col>

            {/* Contact & Support */}
            <Col lg={4} md={6}>
              <h5 className="footer-heading">
                <i className="bi bi-headset me-2"></i>
                Contato
              </h5>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <strong>Telefone</strong>
                    <span>(85) 99999-9999</span>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <strong>E-mail</strong>
                    <span>contato@voepapel.com.br</span>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="bi bi-clock-fill"></i>
                  <div>
                    <strong>Horário</strong>
                    <span>Seg-Sex: 8h às 18h</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <Container>
            <Row className="align-items-center">
              <Col md={6} className="text-center text-md-start">
                <p className="copyright">
                  <i className="bi bi-c-circle me-1"></i>
                  2025 <strong>Voe Papel</strong>. Todos os direitos reservados.
                </p>
              </Col>
              <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
                <div className="payment-methods">
                  <span className="payment-label">Pagamento:</span>
                  <div className="payment-icons">
                    <div className="payment-icon" title="PIX">
                      <i className="bi bi-qr-code"></i>
                      <span>PIX</span>
                    </div>
                    <div className="payment-icon" title="Cartão">
                      <i className="bi bi-credit-card"></i>
                      <span>Cartão</span>
                    </div>
                    <div className="payment-icon" title="Boleto">
                      <i className="bi bi-file-earmark-text"></i>
                      <span>Boleto</span>
                    </div>
                  </div>
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
