import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LayoutAdmin = ({ children, titulo, icone = "bi-speedometer2", voltarPara = "/admin/colaborador" }) => {
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <i className={`bi ${icone} me-2`}></i>
              {titulo}
            </h2>
            <Link to={voltarPara} className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar ao Dashboard
            </Link>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default LayoutAdmin;
