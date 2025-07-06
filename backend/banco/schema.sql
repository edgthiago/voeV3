-- Schema completo para Loja de Tênis
-- Execute este script no seu MySQL

USE projetofgt;

-- Tabela de usuários (atualizada)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_tipo (tipo_usuario)
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos (atualizada)
CREATE TABLE IF NOT EXISTS produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    marca VARCHAR(100),
    cor VARCHAR(50),
    imagem_url VARCHAR(500),
    disponivel BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    estoque_total INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria_id),
    INDEX idx_disponivel (disponivel),
    INDEX idx_marca (marca),
    INDEX idx_preco (preco),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Tabela de tamanhos de produtos
CREATE TABLE IF NOT EXISTS produto_tamanhos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produto_id INT NOT NULL,
    tamanho VARCHAR(10) NOT NULL,
    estoque INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_produto_tamanho (produto_id, tamanho)
);

-- Tabela de carrinho
CREATE TABLE IF NOT EXISTS carrinho (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    tamanho VARCHAR(10) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'confirmado', 'preparando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
    forma_pagamento ENUM('cartao', 'pix', 'boleto') NOT NULL,
    endereco_entrega JSON NOT NULL,
    observacoes TEXT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status),
    INDEX idx_data (data_pedido)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    tamanho VARCHAR(10) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id)
);

-- Tabela de promoções relâmpago
CREATE TABLE IF NOT EXISTS promocoes_relampago (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produto_id INT NOT NULL,
    desconto_percentual DECIMAL(5,2) NOT NULL,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_produto (produto_id),
    INDEX idx_ativo_periodo (ativo, data_inicio, data_fim)
);

-- Tabela de endereços dos usuários
CREATE TABLE IF NOT EXISTS enderecos_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL, -- ex: "Casa", "Trabalho"
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    padrao BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
);

-- Inserir dados de exemplo

-- Categorias
INSERT IGNORE INTO categorias (id, nome, descricao) VALUES
(1, 'Tênis Casual', 'Tênis para uso casual e dia a dia'),
(2, 'Tênis Esportivo', 'Tênis para prática de esportes'),
(3, 'Tênis Running', 'Tênis específicos para corrida'),
(4, 'Tênis Lifestyle', 'Tênis com foco em estilo e moda');

-- Produtos de exemplo
INSERT IGNORE INTO produtos (id, nome, descricao, preco, categoria_id, marca, cor, imagem_url, destaque) VALUES
(1, 'Nike Air Max 270', 'Tênis Nike Air Max 270 com tecnologia de amortecimento', 499.99, 1, 'Nike', 'Preto', '/images/nike-air-max-270.jpg', TRUE),
(2, 'Adidas Ultraboost 22', 'Tênis de corrida com tecnologia Boost', 699.99, 3, 'Adidas', 'Branco', '/images/adidas-ultraboost.jpg', TRUE),
(3, 'Vans Old Skool', 'Clássico tênis Vans Old Skool', 329.99, 4, 'Vans', 'Preto/Branco', '/images/vans-old-skool.jpg', FALSE),
(4, 'Converse All Star', 'Tênis Converse All Star clássico', 199.99, 4, 'Converse', 'Vermelho', '/images/converse-all-star.jpg', FALSE);

-- Tamanhos para os produtos
INSERT IGNORE INTO produto_tamanhos (produto_id, tamanho, estoque) VALUES
(1, '38', 10), (1, '39', 15), (1, '40', 20), (1, '41', 18), (1, '42', 12),
(2, '38', 8), (2, '39', 12), (2, '40', 16), (2, '41', 14), (2, '42', 10),
(3, '37', 5), (3, '38', 8), (3, '39', 12), (3, '40', 15), (3, '41', 10),
(4, '36', 6), (4, '37', 8), (4, '38', 10), (4, '39', 12), (4, '40', 8);

-- Promoção relâmpago de exemplo
INSERT IGNORE INTO promocoes_relampago (produto_id, desconto_percentual, data_inicio, data_fim) VALUES
(1, 20.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

COMMIT;