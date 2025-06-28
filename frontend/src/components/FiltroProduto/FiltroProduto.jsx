import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import FiltroAvaliacao from '../FiltroAvaliacao/FiltroAvaliacao';
import './FiltroProduto.css';

const FiltroProduto = ({ onFilterChange }) => {
  const [marcas, setMarcas] = useState({
    faber_castell: false,
    stabilo: false,
    pilot: false,
    bic: false,
    tilibra: false,
    spiral: false,
    paperflex: false,
  });

  const [categorias, setCategorias] = useState({
    escolar: false,
    escritorio: false,
    arte: false,
    cadernos: false,
    canetas: false,
    organizacao: false,
  });

  const [tipoMaterial, setTipoMaterial] = useState({
    basico: false,
    premium: false,
    profissional: false,
    infantil: false,
  });

  const [condicao, setCondicao] = useState('new');
  const [precoMinimo, setPrecoMinimo] = useState(0);
  const [precoMaximo, setPrecoMaximo] = useState(1000);
  const [avaliacaoMinima, setAvaliacaoMinima] = useState(0);

  const previousFilters = useRef(null);

    const aplicarFiltros = useCallback(() => {
    // Mapeamento de condição para o backend
    let condicaoBackend = condicao;
    if (condicao === 'new') condicaoBackend = 'novo';
    else if (condicao === 'used') condicaoBackend = 'usado';

    const filtros = {
      brands: Object.entries(marcas).filter(([, v]) => v).map(([k]) => k.toLowerCase()),
      categories: Object.entries(categorias).filter(([, v]) => v).map(([k]) => k),
      tipoMaterial: Object.entries(tipoMaterial).filter(([, v]) => v).map(([k]) => k),
      condition: condicaoBackend,
      priceRange: { min: precoMinimo, max: precoMaximo },
      minRating: avaliacaoMinima,
    };

    const stringFiltros = JSON.stringify(filtros);
    if (previousFilters.current !== stringFiltros) {
      previousFilters.current = stringFiltros;
      onFilterChange(filtros);
    }
  }, [marcas, categorias, tipoMaterial, condicao, precoMinimo, precoMaximo, avaliacaoMinima, onFilterChange]);  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const limparFiltros = () => {
    setMarcas({
      faber_castell: false,
      stabilo: false,
      pilot: false,
      bic: false,
      tilibra: false,
      spiral: false,
      paperflex: false,
    });
    setCategorias({
      escolar: false,
      escritorio: false,
      arte: false,
      cadernos: false,
      canetas: false,
      organizacao: false,
    });
    setTipoMaterial({
      basico: false,
      premium: false,
      profissional: false,
      infantil: false,
    });
    setCondicao('new');
    setPrecoMinimo(0);
    setPrecoMaximo(1000);
    setAvaliacaoMinima(0);
  };

  const alterarCheckbox = (estado, setEstado, id) => {
    setEstado({ ...estado, [id]: !estado[id] });
  };

  return (
    <aside className="barra-lateral-filtro-produto p-3 bg-white shadow-sm rounded">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fs-5 fw-bold" style={{color: 'var(--primary-color)'}}>🔍 Filtros</h2>
        <Button 
          variant="link" 
          className="p-0" 
          onClick={limparFiltros}
          style={{color: 'var(--primary-color)', textDecoration: 'none'}}
        >
          🗑️ Limpar
        </Button>
      </div>

      <h5>🏷️ Marca</h5>
      {Object.entries(marcas).map(([key, value]) => {
        const labelMap = {
          faber_castell: 'Faber-Castell',
          stabilo: 'Stabilo',
          pilot: 'Pilot',
          bic: 'BIC',
          tilibra: 'Tilibra',
          spiral: 'Spiral',
          paperflex: 'Paperflex'
        };
        return (
          <Form.Check
            key={key}
            type="checkbox"
            label={labelMap[key]}
            checked={value}
            onChange={() => alterarCheckbox(marcas, setMarcas, key)}
          />
        );
      })}

      <h5 className="mt-4">📂 Categoria</h5>
      {Object.entries(categorias).map(([key, value]) => {
        const labelMap = {
          escolar: '📚 Material Escolar',
          escritorio: '💼 Escritório',
          arte: '🎨 Arte & Criatividade',
          cadernos: '📔 Cadernos & Agendas',
          canetas: '🖊️ Canetas & Lápis',
          organizacao: '📋 Organização'
        };
        return (
          <Form.Check
            key={key}
            type="checkbox"
            label={labelMap[key]}
            checked={value}
            onChange={() => alterarCheckbox(categorias, setCategorias, key)}
          />
        );
      })}

      <h5 className="mt-4">⭐ Tipo de Material</h5>
      {Object.entries(tipoMaterial).map(([key, value]) => {
        const labelMap = {
          basico: '📝 Básico',
          premium: '✨ Premium',
          profissional: '💼 Profissional',
          infantil: '🧸 Infantil'
        };
        return (
          <Form.Check
            key={key}
            type="checkbox"
            label={labelMap[key]}
            checked={value}
            onChange={() => alterarCheckbox(tipoMaterial, setTipoMaterial, key)}
          />
        );
      })}

      <h5 className="mt-4">📦 Condição</h5>
      <Form.Check
        type="radio"
        id="new"
        name="condicao"
        label="✨ Novo"
        checked={condicao === 'new'}
        onChange={() => setCondicao('new')}
      />
      <Form.Check
        type="radio"
        id="used"
        name="condicao"
        label="🔄 Usado"
        checked={condicao === 'used'}
        onChange={() => setCondicao('used')}
      />

      <h5 className="mt-4">💰 Preço</h5>
      <Form.Group className="mb-2">
        <Form.Label>💵 Mínimo</Form.Label>
        <Form.Control 
          type="number" 
          value={precoMinimo} 
          onChange={e => setPrecoMinimo(Number(e.target.value))}
          style={{border: '2px solid var(--border-color)', borderRadius: '8px'}}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>💸 Máximo</Form.Label>
        <Form.Control 
          type="number" 
          value={precoMaximo} 
          onChange={e => setPrecoMaximo(Number(e.target.value))}
          style={{border: '2px solid var(--border-color)', borderRadius: '8px'}}
        />
      </Form.Group>

      <FiltroAvaliacao valor={avaliacaoMinima} aoMudar={setAvaliacaoMinima} />
    </aside>
  );
};

export default FiltroProduto;
