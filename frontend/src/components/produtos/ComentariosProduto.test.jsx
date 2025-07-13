import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComentariosProduto from '../src/components/produtos/ComentariosProduto';

// Mock do contexto de autenticação
const mockAuthContext = {
  usuario: { id: 1, nome: 'Test User' },
  hasPermission: jest.fn(() => true)
};

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock do fetch
global.fetch = jest.fn();

describe('ComentariosProduto', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('deve renderizar sem erros quando comentários são um array', async () => {
    const mockComentarios = [
      {
        id: 1,
        usuario_nome: 'Test User',
        avaliacao: 5,
        comentario: 'Great product!',
        data_criacao: '2025-01-01T00:00:00Z',
        compra_verificada: true
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sucesso: true, dados: mockComentarios })
    });

    render(<ComentariosProduto produtoId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Avaliações e Comentários')).toBeInTheDocument();
    });
  });

  test('deve renderizar sem erros quando comentários são undefined', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sucesso: true, dados: undefined })
    });

    render(<ComentariosProduto produtoId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Ainda não há avaliações para este produto.')).toBeInTheDocument();
    });
  });

  test('deve renderizar sem erros quando a resposta não é um array', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sucesso: false, mensagem: 'Erro' })
    });

    render(<ComentariosProduto produtoId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Ainda não há avaliações para este produto.')).toBeInTheDocument();
    });
  });

  test('deve tratar erro de fetch graciosamente', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ComentariosProduto produtoId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Ainda não há avaliações para este produto.')).toBeInTheDocument();
    });
  });
});
