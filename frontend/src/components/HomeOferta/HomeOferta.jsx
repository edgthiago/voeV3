import React from "react";

const OfertaExclusiva = () => {
  return (
    <section
      className="container-fluid mt-5 py-5" style={{ backgroundColor: "white" }} >
      <div className="row align-items-center justify-content-center ">
        <div
          className="col-md-6 col-12 mb-4 mb-md-0 d-flex justify-content-center"
          style={{backgroundImage: "url('img/Ellipse 11.svg')",backgroundRepeat: "no-repeat",backgroundPosition: "center", width: '466px', height:'466px',}}>
          <img src="img/voePapel/IMG_8431.jpg"  className="img-fluid mt-5 rounded-3 shadow-lg" alt="Kit Papelaria Premium"style={{ maxHeight: "300px", objectFit: "cover" }}/>
        </div>
        <div className="col-md-6 col-12 text-center text-md-start p-5">
          <small className="text-primary fw-semibold">✨ Oferta exclusiva</small>
          <h4 className="fw-bold mt-2 text-primary">Kit Papelaria Premium 📚</h4>
          <p className="text-muted">
            Conjunto completo de materiais premium para escritório e estudos. Inclui cadernos especiais, canetas importadas, marcadores de qualidade e acessórios organizadores. Perfeito para profissionais exigentes e estudantes que buscam o melhor em papelaria.
          </p>
          <a href="#" className="btn btn-primary rounded-pill px-4">
            🛍️ Comprar agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default OfertaExclusiva;
