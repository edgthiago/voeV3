import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import Cadastro from '../pages/Cadastro';
import PaginaProdutos from '../pages/PaginaProdutos/PaginaProdutos';
import PaginaDetalhesProduto from '../pages/PaginaDetalhesProduto/PaginaDetalhesProduto';
import PaginaCarrinho from '../pages/PaginaCarrinho/PaginaCarrinho';
import CheckoutProtegido from '../pages/Checkout/CheckoutProtegido';
import SucessoPage from '../pages/Checkout/SucessoPage';
import TesteAPI from '../components/TesteAPI/TesteAPI';
// import Login from '../components/auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProtecaoRota from '../components/common/ProtecaoRota';
import CompletarCadastro from '../pages/Auth/CompletarCadastro';
import PaginaColaborador from '../pages/Admin/PaginaColaborador';
import PaginaSupervisor from '../pages/Admin/PaginaSupervisor';
import PaginaDiretor from '../pages/Admin/PaginaDiretor';
import CriarConta from '../pages/CriarConta';
import Entrar from '../pages/Entrar';
import PaginaProdutosPersonalizados from '../pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados';

// Componentes para funcionalidades do colaborador
import GerenciarProdutos from '../components/admin/GerenciarProdutos';
import GerenciarEstoque from '../components/admin/GerenciarEstoque';
import GerenciarPedidos from '../components/admin/GerenciarPedidos';
import RelatoriosColaborador from '../components/admin/RelatoriosColaborador';


const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/login" element={<Login />} /> */}

      <Route path="/entrar" element={<Entrar/>} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/criarConta" element={<CriarConta/>} />
      <Route path="/produtos" element={<PaginaProdutos />} />
      <Route path="/produtos-personalizados" element={<PaginaProdutosPersonalizados />} />
      <Route path="/produto/:id" element={<PaginaDetalhesProduto />} />
      <Route path="/carrinho" element={<PaginaCarrinho />} />
      
      {/* Rotas Protegidas */}
      <Route path="/checkout" element={<CheckoutProtegido />} />
      <Route path="/sucesso" element={
        <ProtecaoRota tipoUsuarioMinimo="usuario">
          <SucessoPage />
        </ProtecaoRota>
      } />
      
      {/* Rotas de Autenticação */}
      <Route path="/completar-cadastro" element={
        <ProtecaoRota tipoUsuarioMinimo="visitante">
          <CompletarCadastro />
        </ProtecaoRota>
      } />
        {/* Dashboards por Nível */}
      <Route path="/dashboard" element={
        <ProtecaoRota tipoUsuarioMinimo="usuario" redirectTo="/entrar">
          <Dashboard />
        </ProtecaoRota>
      } />
      
      {/* Rotas Administrativas */}
      <Route path="/admin/colaborador" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <PaginaColaborador />
        </ProtecaoRota>
      } />
      <Route path="/admin/supervisor" element={
        <ProtecaoRota tipoUsuarioMinimo="supervisor" redirectTo="/entrar">
          <PaginaSupervisor />
        </ProtecaoRota>
      } />
      <Route path="/admin/diretor" element={
        <ProtecaoRota tipoUsuarioMinimo="diretor" redirectTo="/entrar">
          <PaginaDiretor />
        </ProtecaoRota>
      } />

      {/* Rotas das funcionalidades do colaborador */}
      <Route path="/dashboard/produtos" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <GerenciarProdutos />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/produtos/novo" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <GerenciarProdutos />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/estoque" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <GerenciarEstoque />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/estoque/atualizar" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <GerenciarEstoque />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/pedidos" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <GerenciarPedidos />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/pedidos/pendentes" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <GerenciarPedidos />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/relatorios/vendas-basico" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <RelatoriosColaborador />
        </ProtecaoRota>
      } />
      <Route path="/dashboard/relatorios/produtos" element={
        <ProtecaoRota tipoUsuarioMinimo="colaborador" redirectTo="/entrar">
          <RelatoriosColaborador />
        </ProtecaoRota>
      } />
      
        {/* Rotas de Usuário Autenticado */}
      <Route path="/meus-pedidos" element={
        <ProtecaoRota tipoUsuarioMinimo="usuario" redirectTo="/entrar">
          <h1 className="text-center mt-5">Meus Pedidos</h1>
        </ProtecaoRota>
      } />
      
      {/* Rotas Informativas */}
      <Route path="/categorias" element={<h1 className="text-center mt-5">Página em desenvolvimento</h1>} />
      <Route path="/sobre" element={<h1 className="text-center mt-5">Sobre</h1>} />
      <Route path="/contato" element={<h1 className="text-center mt-5">Contato</h1>} />
      <Route path="/termos" element={<h1 className="text-center mt-5">Termos e Condições</h1>} />
      <Route path="/devolucoes" element={<h1 className="text-center mt-5">Trocas e Devoluções</h1>} />
      
      {/* Rota 404 */}
      <Route path="*" element={<h1 className="text-center mt-5">Página não encontrada</h1>} /> 
    </Routes>
  );
};

export default AppRoutes;
