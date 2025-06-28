import React from 'react'
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './HomeCarrosel.css';

const HomeCarrosel = () => {
  return (
    <>
      {/* Carrossel */}
      <div id="promoCarousel" className="carousel slide bg-gradient py-5" data-bs-ride="carousel">
        <div className="carousel-inner container">

          {/* Slide 1 - Material Escolar */}
          <div className="carousel-item active">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start">
                <p className="text-primary fw-semibold mb-2">✨ Melhores ofertas em papelaria</p>
                <h2 className="fw-bold text-primary">Material Escolar 2025 📚</h2>
                <p className="text-secondary">
                  Prepare-se para o ano letivo com nossa seleção completa de materiais escolares e de escritório com preços especiais.
                </p>
                <Link to="/produtos" className="btn btn-primary btn-lg rounded-pill px-4">Ver ofertas</Link>
              </div>
              <div className="col-md-6 text-center">
                <div className="image-container">
                  <img src="../img/voePapel/IMG_8431.jpg" className="img-fluid rounded-3 shadow-lg" alt="Material Escolar" style={{maxHeight: "350px", objectFit: "cover", width: "100%"}}/>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 - Arte & Criatividade */}
          <div className="carousel-item">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start">
                <p className="text-warning fw-semibold mb-2">🎨 Ofertas imperdíveis</p>
                <h2 className="fw-bold text-primary">Arte & Criatividade ✏️</h2>
                <p className="text-secondary">
                  Desperte sua criatividade com nossa linha completa de materiais artísticos, tintas, pincéis e muito mais.
                </p>
                <Link to="/produtos" className="btn btn-warning btn-lg rounded-pill px-4">Ver coleção</Link>
              </div>
              <div className="col-md-6 text-center">
                <div className="image-container">
                  <img src="../img/voePapel/IMG_8529.jpg" className="img-fluid rounded-3 shadow-lg" alt="Material Artístico" style={{maxHeight: "350px", objectFit: "cover", width: "100%"}}/>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3 - Escritório */}
          <div className="carousel-item">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start">
                <p className="text-success fw-semibold mb-2">💼 Promoção especial</p>
                <h2 className="fw-bold text-primary">Escritório Completo 📋</h2>
                <p className="text-secondary">
                  Organize seu escritório com nossa linha profissional de produtos para organização e produtividade.
                </p>
                <Link to="/produtos" className="btn btn-success btn-lg rounded-pill px-4">Comprar agora</Link>
              </div>
              <div className="col-md-6 text-center">
                <div className="image-container">
                  <img src="../img/voePapel/IMG_9788.jpg" className="img-fluid rounded-3 shadow-lg" alt="Material de Escritório" style={{maxHeight: "350px", objectFit: "cover", width: "100%"}}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#promoCarousel"
          data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#promoCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Próximo</span>
        </button>

        {/* Indicadores */}
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#promoCarousel"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1">
          </button>
          <button
            type="button"
            data-bs-target="#promoCarousel"
            data-bs-slide-to="1"
            aria-label="Slide 2">
          </button>
          <button
            type="button"
            data-bs-target="#promoCarousel"
            data-bs-slide-to="2"
            aria-label="Slide 3">
          </button>
        </div>
      </div>
    </>
  )
}

export default HomeCarrosel
