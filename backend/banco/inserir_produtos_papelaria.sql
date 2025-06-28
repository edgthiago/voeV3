-- Script para inserir produtos de papelaria na loja Voe Papel
-- Arquivo: inserir_produtos_papelaria.sql

USE projetofgt;

-- Desabilitar verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpar tabelas relacionadas primeiro
DELETE FROM promocoes_relampago;
DELETE FROM produtos;

-- Resetar auto increment
ALTER TABLE produtos AUTO_INCREMENT = 1;

-- Reabilitar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- Inserir produtos de papelaria
INSERT INTO produtos (marca, nome, imagem, preco_antigo, preco_atual, desconto, avaliacao, total_avaliacoes, categoria, genero, condicao, quantidade_estoque, descricao) VALUES

-- Material Escolar
('Faber-Castell', 'Kit Escolar Completo - 50 Itens', '/img/voePapel/IMG_8431.jpg', 89.99, 59.99, 33, 4.8, 245, 'escolar', 'unissex', 'novo', 45, 'Kit completo com cadernos, canetas, lápis, borracha, régua e muito mais para o ano letivo'),
('Tilibra', 'Caderno Universitário 200 Folhas', '/img/voePapel/IMG_0513.jpg', 24.99, 18.99, 24, 4.6, 189, 'escolar', 'unissex', 'novo', 120, 'Caderno universitário espiral com 200 folhas pautadas, capa dura resistente'),
('BIC', 'Conjunto 12 Canetas Esferográficas', '/img/voePapel/IMG_6672.jpg', 15.99, 9.99, 38, 4.4, 567, 'escolar', 'unissex', 'novo', 200, 'Set com 12 canetas esferográficas BIC azuis, escrita suave e duradoura'),
('Staedtler', 'Estojo de Lápis de Cor 48 Cores', '/img/voePapel/IMG_7671.jpg', 79.99, 54.99, 31, 4.9, 123, 'escolar', 'unissex', 'novo', 35, 'Lápis de cor profissionais com 48 cores vibrantes, ideais para desenho e pintura'),
('Pilot', 'Marca Texto Neon - Kit 6 Cores', '/img/voePapel/IMG_7868.JPG', 21.99, 15.99, 27, 4.5, 298, 'escolar', 'unissex', 'novo', 150, 'Marca textos neon com 6 cores fluorescentes, ponta chanfrada e tinta que não vaza'),

-- Arte e Criatividade  
('Acrilex', 'Tinta Guache 12 Cores 15ml', '/img/voePapel/IMG_8529.jpg', 32.99, 22.99, 30, 4.7, 156, 'arte', 'unissex', 'novo', 80, 'Conjunto de tintas guache com 12 cores básicas, ideal para trabalhos artísticos e escolares'),
('Faber-Castell', 'Pincéis Artísticos - Kit 10 Peças', '/img/voePapel/IMG_8166.JPG', 45.99, 32.99, 28, 4.8, 89, 'arte', 'unissex', 'novo', 60, 'Kit com 10 pincéis de diferentes tamanhos para aquarela, acrílica e óleo'),
('Canson', 'Papel Aquarela A4 - 20 Folhas', '/img/voePapel/IMG_8393.PNG', 28.99, 19.99, 31, 4.6, 134, 'arte', 'unissex', 'novo', 90, 'Papel especial para aquarela, gramatura 300g/m², textura ideal para absorção'),
('Prismacolor', 'Lápis Aquarelável 24 Cores', '/img/voePapel/IMG_8762.jpg', 189.99, 139.99, 26, 4.9, 67, 'arte', 'unissex', 'novo', 25, 'Lápis aquareláveis profissionais com 24 cores, solúveis em água para efeitos únicos'),
('Sakura', 'Canetas Pigma Micron - Set 8 Peças', '/img/voePapel/IMG_8805.JPG', 89.99, 64.99, 28, 4.8, 112, 'arte', 'unissex', 'novo', 40, 'Canetas nanquim com pontas de diferentes espessuras, tinta à prova d\'água'),

-- Material de Escritório
('3M', 'Organizador de Mesa 6 Compartimentos', '/img/voePapel/IMG_9788.jpg', 45.99, 32.99, 28, 4.5, 234, 'escritorio', 'unissex', 'novo', 75, 'Organizador de mesa em acrílico transparente com 6 compartimentos para canetas e acessórios'),
('Polibras', 'Pasta Arquivo A-Z 20 Divisórias', '/img/voePapel/IMG_8994.jpg', 35.99, 24.99, 31, 4.4, 178, 'escritorio', 'unissex', 'novo', 100, 'Pasta arquivo sanfonada com 20 divisórias A-Z, ideal para organização de documentos'),
('Pritt', 'Cola Bastão 40g - Pack 5 Unidades', '/img/voePapel/IMG_9817.jpg', 29.99, 19.99, 33, 4.3, 445, 'escritorio', 'unissex', 'novo', 180, 'Cola em bastão 40g, fácil aplicação, secagem rápida e não tóxica'),
('Post-it', 'Bloco de Notas Adesivas Coloridas', '/img/voePapel/voePapel.jpeg', 18.99, 12.99, 32, 4.6, 356, 'escritorio', 'unissex', 'novo', 220, 'Bloco com 400 folhas adesivas coloridas, ideais para lembretes e organização'),
('Scotch', 'Fita Adesiva Transparente 12mm x 30m', '/img/voePapel/fundo.jpeg', 8.99, 5.99, 33, 4.2, 523, 'escritorio', 'unissex', 'novo', 300, 'Fita adesiva transparente resistente, corte fácil e aderência duradoura'),

-- Cadernos e Agendas
('Moleskine', 'Caderno Clássico Pautado A5', '/img/voePapel/IMG_0513.jpg', 89.99, 69.99, 22, 4.9, 89, 'cadernos', 'unissex', 'novo', 30, 'Caderno Moleskine clássico com páginas pautadas, capa dura e elástico'),
('Cicero', 'Agenda 2025 Semanal Capa Dura', '/img/voePapel/IMG_6672.jpg', 54.99, 39.99, 27, 4.7, 145, 'cadernos', 'unissex', 'novo', 50, 'Agenda 2025 com layout semanal, capa dura em couro sintético e fita marcadora'),
('Paperblanks', 'Caderno Decorativo 120 Folhas', '/img/voePapel/IMG_7671.jpg', 79.99, 59.99, 25, 4.8, 78, 'cadernos', 'unissex', 'novo', 40, 'Caderno com design artístico, papel de alta qualidade e acabamento luxuoso'),
('Rhodia', 'Bloco de Notas Pontilhado A4', '/img/voePapel/IMG_7868.JPG', 25.99, 18.99, 27, 4.5, 167, 'cadernos', 'unissex', 'novo', 85, 'Bloco de notas com grade pontilhada, ideal para bullet journal e anotações'),
('Leuchtturm1917', 'Caderno Bullet Journal A5', '/img/voePapel/IMG_8166.JPG', 94.99, 74.99, 21, 4.9, 134, 'cadernos', 'unissex', 'novo', 25, 'Caderno oficial para bullet journal com páginas numeradas e índice'),

-- Materiais para Impressão
('HP', 'Papel Sulfite A4 75g - 500 Folhas', '/img/voePapel/IMG_8393.PNG', 22.99, 16.99, 26, 4.4, 789, 'impressao', 'unissex', 'novo', 200, 'Papel sulfite branco A4, gramatura 75g, ideal para impressão e fotocópia'),
('Canon', 'Papel Fotográfico A4 Glossy - 20 Folhas', '/img/voePapel/IMG_8431.jpg', 35.99, 24.99, 31, 4.6, 234, 'impressao', 'unissex', 'novo', 60, 'Papel fotográfico premium com acabamento brilhante para impressão de fotos'),
('Brother', 'Etiquetas Adesivas 100 Folhas A4', '/img/voePapel/IMG_8529.jpg', 45.99, 32.99, 28, 4.3, 156, 'impressao', 'unissex', 'novo', 90, 'Folhas de etiquetas adesivas para impressora, fácil remoção do fundo'),
('Epson', 'Papel Matte A4 - 50 Folhas', '/img/voePapel/IMG_8762.jpg', 42.99, 29.99, 30, 4.5, 123, 'impressao', 'unissex', 'novo', 70, 'Papel fosco premium para impressão de alta qualidade'),
('Xerox', 'Papel Couché A4 170g - 100 Folhas', '/img/voePapel/IMG_8805.JPG', 38.99, 26.99, 31, 4.4, 98, 'impressao', 'unissex', 'novo', 50, 'Papel couché brilhante para impressões coloridas de alta qualidade'),

-- Acessórios e Diversos
('Swingline', 'Grampeador de Mesa Heavy Duty', '/img/voePapel/IMG_9788.jpg', 89.99, 64.99, 28, 4.7, 145, 'acessorios', 'unissex', 'novo', 35, 'Grampeador robusto para uso intensivo, capacidade até 25 folhas'),
('Maped', 'Furador de Papel 2 Furos', '/img/voePapel/IMG_8994.jpg', 25.99, 17.99, 31, 4.4, 267, 'acessorios', 'unissex', 'novo', 80, 'Furador de papel resistente com base antiderrapante e régua guia'),
('Stanley', 'Estilete Profissional com Lâminas', '/img/voePapel/IMG_9817.jpg', 19.99, 13.99, 30, 4.5, 189, 'acessorios', 'unissex', 'novo', 120, 'Estilete profissional com trava de segurança e 5 lâminas sobressalentes'),
('Acrimet', 'Suporte para Documentos Vertical', '/img/voePapel/voePapel.jpeg', 32.99, 22.99, 30, 4.3, 178, 'acessorios', 'unissex', 'novo', 65, 'Suporte organizador vertical para documentos e revistas'),
('Dello', 'Calculadora Científica 240 Funções', '/img/voePapel/fundo.jpeg', 79.99, 54.99, 31, 4.6, 234, 'acessorios', 'unissex', 'novo', 45, 'Calculadora científica com 240 funções, display de 2 linhas e capa protetora');
