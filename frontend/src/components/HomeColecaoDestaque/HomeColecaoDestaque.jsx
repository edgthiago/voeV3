import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './HomeColecaoDestaque.modules.css'

const HomeColecaoDestaque = () => {
    return (
        <>
            <section className="py-5" style={{background: 'linear-gradient(135deg, rgba(248, 249, 252, 1), rgba(240, 245, 251, 1))'}}>
                <div className="container">
                    <h4 className="fw-bold mb-5 text-primary text-center">✨ Coleções em destaque</h4>
                    <div className="row g-4">

                        {/* Card 1 - Material Escolar */}
                        <div className="col-md-4 col-12">
                            <div
                                className="card h-100 shadow-lg border-0 position-relative overflow-hidden voe-papel-effect"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(168, 216, 232, 0.15), rgba(184, 230, 184, 0.15))',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '20px',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <div className="card-body d-flex flex-column justify-content-between p-4">
                                    <div>
                                        <span
                                            className="badge text-white mb-3 px-3 py-2"
                                            style={{ 
                                                background: 'linear-gradient(45deg, #A8D8E8, #7BC4E0)',
                                                borderRadius: '15px',
                                                fontSize: '0.9rem',
                                                boxShadow: '0 4px 15px rgba(168, 216, 232, 0.3)'
                                            }}
                                        >
                                            📚 30% OFF
                                        </span>
                                        <h5 className="fw-bold text-primary mb-3">
                                            Material Escolar <br /> 
                                            <span className="text-secondary fs-6">Volta às Aulas 2025</span>
                                        </h5>
                                        <p className="text-muted small">
                                            Cadernos, canetas, lápis e muito mais para o ano letivo!
                                        </p>
                                    </div>
                                    <Link to="/produtos?categoria=escolar" className="btn btn-primary mt-3 rounded-pill px-4 fw-semibold">
                                        🛍️ Comprar
                                    </Link>
                                </div>
                                <div 
                                    className="position-absolute"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundImage: "url('../img/voePapel/IMG_8431.jpg')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '50%',
                                        top: '15px',
                                        right: '15px',
                                        opacity: '0.2',
                                        filter: 'blur(1px)'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Card 2 - Arte e Criatividade */}
                        <div className="col-md-4 col-12">
                            <div
                                className="card h-100 shadow-lg border-0 position-relative overflow-hidden voe-papel-effect"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(232, 197, 216, 0.15), rgba(244, 228, 193, 0.15))',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '20px',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <div className="card-body d-flex flex-column justify-content-between p-4">
                                    <div>
                                        <span
                                            className="badge text-white mb-3 px-3 py-2"
                                            style={{ 
                                                background: 'linear-gradient(45deg, #E8C5D8, #F4E4C1)',
                                                borderRadius: '15px',
                                                fontSize: '0.9rem',
                                                boxShadow: '0 4px 15px rgba(232, 197, 216, 0.3)'
                                            }}
                                        >
                                            🎨 25% OFF
                                        </span>
                                        <h5 className="fw-bold text-primary mb-3">
                                            Arte & Criatividade <br /> 
                                            <span className="text-secondary fs-6">Inspire-se</span>
                                        </h5>
                                        <p className="text-muted small">
                                            Tintas, pincéis, papéis especiais e materiais artísticos.
                                        </p>
                                    </div>
                                    <Link to="/produtos?categoria=arte" className="btn btn-warning mt-3 rounded-pill px-4 fw-semibold">
                                        🎨 Criar
                                    </Link>
                                </div>
                                <div 
                                    className="position-absolute"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundImage: "url('../img/voePapel/IMG_8529.jpg')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '50%',
                                        top: '15px',
                                        right: '15px',
                                        opacity: '0.2',
                                        filter: 'blur(1px)'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Card 3 - Escritório */}
                        <div className="col-md-4 col-12">
                            <div
                                className="card h-100 shadow-lg border-0 position-relative overflow-hidden voe-papel-effect"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(184, 230, 184, 0.15), rgba(168, 216, 232, 0.15))',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '20px',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <div className="card-body d-flex flex-column justify-content-between p-4">
                                    <div>
                                        <span
                                            className="badge text-white mb-3 px-3 py-2"
                                            style={{ 
                                                background: 'linear-gradient(45deg, #B8E6B8, #A8D8E8)',
                                                borderRadius: '15px',
                                                fontSize: '0.9rem',
                                                boxShadow: '0 4px 15px rgba(184, 230, 184, 0.3)'
                                            }}
                                        >
                                            💼 35% OFF
                                        </span>
                                        <h5 className="fw-bold text-primary mb-3">
                                            Escritório Pro <br /> 
                                            <span className="text-secondary fs-6">Organização Total</span>
                                        </h5>
                                        <p className="text-muted small">
                                            Pastas, organizadores, etiquetas e acessórios profissionais.
                                        </p>
                                    </div>
                                    <Link to="/produtos?categoria=escritorio" className="btn btn-success mt-3 rounded-pill px-4 fw-semibold">
                                        💼 Organizar
                                    </Link>
                                </div>
                                <div 
                                    className="position-absolute"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundImage: "url('../img/voePapel/IMG_9788.jpg')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '50%',
                                        top: '15px',
                                        right: '15px',
                                        opacity: '0.2',
                                        filter: 'blur(1px)'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomeColecaoDestaque;
