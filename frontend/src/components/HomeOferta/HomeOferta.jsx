import React from "react";
import './HomeOferta.css';

const OfertaExclusiva = () => {
  return (
    <section className="container-fluid mt-5 py-5 oferta-exclusiva">
      <div className="row align-items-center justify-content-center oferta-container">
        <div className="col-md-6 col-12 mb-4 mb-md-0 d-flex justify-content-center">
          <div 
            className="oferta-imagem-container"
            style={{
              backgroundImage: "url('img/Ellipse 11.svg')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "100% 100%"
            }}
          >
            <img 
              src="img/voePapel/IMG_8431.jpg"  
              className="img-fluid rounded-3 shadow-lg oferta-imagem" 
              alt="Kit Papelaria Premium"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
          </div>
        </div>
        <div className="col-md-6 col-12 oferta-conteudo">
          <small className="oferta-badge">✨ Oferta exclusiva</small>
          <h4 className="oferta-titulo">Kit Papelaria Premium 📚</h4>
          <p className="oferta-descricao">
            Conjunto completo de materiais premium para escritório e estudos. Inclui cadernos especiais, canetas importadas, marcadores de qualidade e acessórios organizadores. Perfeito para profissionais exigentes e estudantes que buscam o melhor em papelaria.
          </p>
          <a href="#" className="oferta-botao">
            🛍️ Comprar agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default OfertaExclusiva;
