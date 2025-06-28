import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <>
      <footer className="footer ">
        <Container>
          <Row className="footer-main py-5">
            <Col lg={4} md={6} className="mb-4 mb-lg-0">
              <div className="footer-brand mb-4">
                <img src="../../img/voePapel/voePapel.jpeg" alt="Voe Papel" style={{height: '80px', borderRadius: '12px'}} />
              </div>
              <p className="footer-text">
                <strong>Voe Papel</strong> - Sua papelaria online completa! Encontre tudo para escola, escritório e arte com qualidade e preços especiais. Desperte sua criatividade conosco! ✨
              </p>
              <div className="footer-social mt-4">
                <a href="https://facebook.com/voepapel" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <img src="../img/Path face.svg" alt="Facebook" />
                </a>
                <a href="https://instagram.com/voepapel" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <img src="../img/Instagran.svg" alt="Instagram" />
                </a>
                <a href="https://twitter.com/voepapel" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <img src="../img/Path twitter.svg" alt="Twitter" />
                </a>
                <a href="https://youtube.com/@voepapel" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://tiktok.com/@voepapel" className="footer-social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </Col>

            <Col lg={2} md={6} className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Informações</h5>
              <ul className="footer-links">
                <li><Link to="/sobre">Sobre a Voe Papel</Link></li>
                <li><Link to="/contato">Contato</Link></li>
                <li><Link to="/termos">Termos e Condições</Link></li>
                <li><Link to="/devolucoes">Trocas e Devoluções</Link></li>
              </ul>
            </Col>

            <Col lg={2} md={6} className="mb-4 mb-lg-0">
              <h5 className="footer-heading">Categorias</h5>
              <ul className="footer-links">
                <li><Link to="/produtos?categoria=escolar">📚 Material Escolar</Link></li>
                <li><Link to="/produtos?categoria=arte">🎨 Arte & Criatividade</Link></li>
                <li><Link to="/produtos?categoria=escritorio">💼 Escritório</Link></li>
                <li><Link to="/produtos?categoria=cadernos">📔 Cadernos & Agendas</Link></li>
              </ul>
            </Col>

            <Col lg={4} md={6}>
              <h5 className="footer-heading">Contato</h5>
              <div className="footer-contact">
                <p className="footer-text mb-2">
                  <strong>📍 Endereço:</strong><br />
                  Rua Anhanga, 1224 - Apt 202<br />
                  Parque Potira<br />
                  CEP: 60871-520
                </p>
                <p className="footer-text mb-2">
                  <strong>📞 Telefone:</strong><br />
                  (85) 99999-9999
                </p>
                <p className="footer-text mb-0">
                  <strong>📧 E-mail:</strong><br />
                  contato@voepapel.com.br
                </p>
              </div>
            </Col>
          </Row>
        </Container>

        <div className="footer-bottom py-3">
          <Container>
            <Row className="align-items-center m-0">
              <Col md={6} className="text-center text-md-start">
                <p className="mb-0">© 2025 Voe Papel. Todos os direitos reservados.</p>
              </Col>
              <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
                <div className="payment-methods">
                  <span className="payment-text me-3">Aceitamos:</span>
                  <div className="payment-icons">
                    {/* PIX */}
                    <div className="payment-icon">
                      <div className="payment-circle pix">
                        <span>₽</span>
                      </div>
                      <span>PIX</span>
                    </div>
                    
                    {/* Cartão de Crédito */}
                    <div className="payment-icon">
                      <div className="payment-circle card">
                        <span>💳</span>
                      </div>
                      <span>Cartão</span>
                    </div>
                    
                    {/* Boleto */}
                    <div className="payment-icon">
                      <div className="payment-circle boleto">
                        <span>📄</span>
                      </div>
                      <span>Boleto</span>
                    </div>
                    
                    {/* Entrega */}
                    <div className="payment-icon">
                      <div className="payment-circle delivery">
                        <span>🚚</span>
                      </div>
                      <span>Entrega</span>
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
