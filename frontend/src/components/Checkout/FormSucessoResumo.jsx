import styles from './FormResumo.module.css'
// import Sneakers from "../../assets/finalizarCompra/Sneakers.svg" // Removido para papelaria
import {useNavigate} from 'react-router-dom'

const FormSucessoResumo = () => {
  const navigate = useNavigate()
  const paraHome = () => {
    navigate('/')
  }
    return (
      <>
        <fieldset
          className={`bg-white d-flex flex-column p-5 ${styles.resumoContainer}`}
        >
          <h3>Resumo</h3>
          <hr />
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className={styles.imgResumo}>
              <img src="/papelaria_produtos.png" alt="produtos de papelaria" />
            </div>
            <div>
              <p>Kit Escolar Completo Premium</p>
            </div>
          </div>

          <hr />

          <div className="d-flex justify-content-between">
            <div>
              <p className="opacity-50">Subtotal:</p>
              <p className="opacity-50">Frete:</p>
              <p className="opacity-50">Desconto: </p>
            </div>
            <div>
              <p>R$: 210,00</p>
              <p>R$: 0,00</p>
              <p>R$: 30,00</p>
            </div>
          </div>

          <div className={styles.resumoTotal}>
            <div className="d-flex justify-content-between align-items-start mt-3">
              <div>
                <h3 className="m-0">Total</h3>
              </div>
              <div className="d-flex flex-column align-items-end">
                <p className="m-0 h3 fw-semibold">R$: 180,00</p>
                <small className="opacity-50">
                  ou 10x de R$: 18,00 sem juros
                </small>
              </div>
            </div>
          </div>
          <div className="text-center mb-2 text-decoration-underline mt-3">
            <a className="text-dark">Imprimir Recibo</a>
          </div>

          <button
            className="btn btn-warning text-white fw-bold p-2 w-100 "
            type="submit"
            onClick={paraHome}
          >
            Voltar para Home
          </button>
        </fieldset>
      </>
    );
}

export default FormSucessoResumo