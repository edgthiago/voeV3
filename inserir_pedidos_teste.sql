-- Script para inserir pedidos de exemplo
-- Dados de teste para o sistema de papelaria

-- Inserir pedidos de exemplo
INSERT INTO pedidos (
    id,
    usuario_id,
    status_pedido,
    valor_total,
    metodo_pagamento,
    endereco_entrega,
    data_pedido,
    observacoes
) VALUES 
(
    'PED-001',
    6, -- ID do usuário teste
    'pendente',
    150.50,
    'cartao_credito',
    'Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567',
    NOW(),
    'Pedido de teste - Cadernos e canetas'
),
(
    'PED-002',
    6,
    'processando',
    89.90,
    'pix',
    'Avenida Principal, 456 - Jardim America - São Paulo/SP - CEP: 01234-890',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'Material escolar básico'
),
(
    'PED-003',
    6,
    'pendente',
    299.99,
    'cartao_debito',
    'Rua do Comércio, 789 - Vila Nova - São Paulo/SP - CEP: 01234-123',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    'Kit completo de escritório'
);

-- Inserir itens dos pedidos (assumindo que existe uma tabela pedido_itens)
-- Caso a estrutura seja diferente, estes comandos podem precisar ser ajustados

INSERT INTO pedido_itens (
    pedido_id,
    produto_id,
    produto_nome,
    quantidade,
    preco_unitario,
    subtotal
) VALUES 
-- Itens do PED-001
('PED-001', 1, 'Caderno Universitário 200 folhas', 3, 25.90, 77.70),
('PED-001', 2, 'Caneta Esferográfica Azul', 10, 2.50, 25.00),
('PED-001', 3, 'Lápis HB', 15, 1.20, 18.00),
('PED-001', 4, 'Borracha Escolar', 5, 1.50, 7.50),
('PED-001', 5, 'Apontador com Depósito', 2, 11.15, 22.30),

-- Itens do PED-002
('PED-002', 1, 'Caderno Universitário 200 folhas', 2, 25.90, 51.80),
('PED-002', 6, 'Marca-texto Amarelo', 4, 4.50, 18.00),
('PED-002', 7, 'Papel A4 500 folhas', 1, 20.10, 20.10),

-- Itens do PED-003
('PED-003', 8, 'Kit Escritório Completo', 1, 199.99, 199.99),
('PED-003', 9, 'Calculadora Científica', 1, 85.00, 85.00),
('PED-003', 10, 'Agenda 2025', 1, 15.00, 15.00);
