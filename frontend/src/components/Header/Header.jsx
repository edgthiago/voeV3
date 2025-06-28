import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../context/ContextoCarrinho';
import { useAuth } from '../../context/AuthContext';
import './Header.css';


const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [searchTerm, setSearchTerm] = useState('');
  //ao atualizar a pagina, o que esta na barra de pesquisa é apaga
  useEffect(() => {
    setSearchTerm('');
  }, []);
  const { obterQuantidadeItensCarrinho } = useCarrinho(); const { isAuthenticated, usuario, hasPermission, logout } = useAuth();

  // Verificar se o usuário tem permissões administrativas baseado no novo sistema
  const isAdmin = usuario?.tipo_usuario && ['colaborador', 'supervisor', 'diretor'].includes(usuario.tipo_usuario);
  const isColaborador = usuario?.tipo_usuario === 'colaborador';
  const isSupervisor = usuario?.tipo_usuario === 'supervisor';
  const isDiretor = usuario?.tipo_usuario === 'diretor';
  const isUsuarioCompleto = usuario?.tipo_usuario === 'usuario';
  // Função para lidar com a pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Cabeçalho principal com logo, barra de pesquisa e menu de navegação */}
      <header className="header">
        {/* Logo do site */}
        <Link to="/" className="header-logo" aria-label="Ir para a página inicial">
          <img src="../../img/voePapel/voePapel.jpeg" alt="Voe Papel" />
        </Link>        {/* Campo de busca com ícone */}
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            id="searchInput"
            placeholder="Pesquisar produtos..."
            aria-label="Pesquisar produto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="header-search-button" aria-label="Buscar">
            <i className="bi bi-search header-search-icon"></i>
          </button>
        </form>         {/* Botões de acesso: Cadastro, Login e Carrinho */}
        <div className="header-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/cadastro" className="header-register">Cadastre-se</Link>
              <Link to='/entrar'><button className="header-login">Entrar</button></Link>
            </>
          ) : (<>              {isAdmin && (
            <div className="dropdown">
              <Link
                to="#"
                className="header-admin dropdown-toggle"
                data-bs-toggle="dropdown"
                title="Painel Administrativo"
              >
                <i className="bi bi-gear-fill"></i>
                <span className="d-none d-md-inline ms-1">
                  {isDiretor ? 'Diretor' : isSupervisor ? 'Supervisor' : 'Colaborador'}
                </span>
              </Link>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/dashboard">Dashboard Geral</Link></li>
                {hasPermission('GERENCIAR_PRODUTOS') && (
                  <li><Link className="dropdown-item" to="/admin/colaborador">Produtos & Estoque</Link></li>
                )}
                {hasPermission('GERENCIAR_MARKETING') && (
                  <li><Link className="dropdown-item" to="/admin/supervisor">Marketing & Equipe</Link></li>
                )}
                {hasPermission('CONFIGURAR_SISTEMA') && (
                  <li><Link className="dropdown-item" to="/admin/diretor">Sistema & Finanças</Link></li>
                )}
              </ul>
            </div>
          )}



            {/* Botão específico para finalizar compras - apenas usuários nível 2+ */}
            {(isUsuarioCompleto || isAdmin) && (
              <Link to="/meus-pedidos" className="header-orders" title="Meus Pedidos">
                <i className="bi bi-bag-check-fill"></i>
                <span className="d-none d-lg-inline ms-1">Pedidos</span>
              </Link>
            )}                <div className="dropdown">
              <span
                className="header-user-name d-none d-md-inline dropdown-toggle"
                data-bs-toggle="dropdown"
                role="button"
              >
                Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'}
                {usuario?.tipo === 'visitante' && (
                  <small className="text-warning ms-1">
                    <Link to="/completar-cadastro" className="text-decoration-none">
                      (Complete seu cadastro)
                    </Link>
                  </small>
                )}
              </span>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/meus-dados">Minha Conta</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item text-danger" onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          </>
          )}
          <Link to="/carrinho" className="header-cart position-relative">
            <i className="bi bi-cart-fill"></i>{obterQuantidadeItensCarrinho() > 0 && (
              <span className="header-cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {obterQuantidadeItensCarrinho()}
              </span>
            )}
          </Link>
        </div>
      </header>


      <>
        {/* Botão hamburguer - apenas mobile */}
        <div className="d-md-none p-2 bg-white">
          <button
            className="btn"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileNav"
            aria-controls="mobileNav"
          >
            <i className="bi bi-list fs-2"></i>
          </button>
        </div>

        {/* Menu Offcanvas - apenas mobile */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="mobileNav"
          aria-labelledby="mobileNavLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileNavLabel">Menu</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Fechar"
            ></button>
          </div>          <div className="offcanvas-body">            <ul className="nav flex-column">
            {isAuthenticated && (
              <li className="nav-item mb-2 border-bottom pb-2">
                <div className="d-flex align-items-center px-2">
                  <i className="bi bi-person-circle me-2 fs-4"></i>
                  <span>{usuario?.nome?.split(' ')[0] || 'Usuário'}</span>
                </div>
              </li>
            )}
            <li className="nav-item">
              <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/produtos" className={`nav-link ${path === '/produtos' ? 'active' : ''}`}>Produtos</Link>
            </li>
            <li className="nav-item">
              <Link to="/categorias" className={`nav-link ${path === '/categorias' ? 'active' : ''}`}>Categorias</Link>
            </li>
            <li className="nav-item">
              <Link to="/meus-pedidos" className={`nav-link ${path === '/meus-pedidos' ? 'active' : ''}`}>Meus Pedidos</Link>
            </li>            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>
                  <i className="bi bi-gear-fill me-2"></i>
                  Painel Administrativo
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item mt-3">
                <button
                  className="nav-link text-danger border-0 bg-transparent w-100 text-start"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sair da conta
                </button>
              </li>
            )}
          </ul>
          </div>
        </div>        {/* Menu fixo - apenas desktop */}
        <nav className="d-none d-md-block bg-white px-3 py-2 border-bottom">
          <ul className="nav justify-content-start">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/produtos" className={`nav-link ${path === '/produtos' ? 'active' : ''}`}>Produtos</Link>
            </li>
            <li className="nav-item">
              <Link to="/categorias" className={`nav-link ${path === '/categorias' ? 'active' : ''}`}>Categorias</Link>
            </li>
            <li className="nav-item">
              <Link to="/meus-pedidos" className={`nav-link ${path === '/meus-pedidos' ? 'active' : ''}`}>Meus Pedidos</Link>
            </li>
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>
                  <i className="bi bi-gear-fill me-2"></i>
                  Painel Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </>






    </>
  );
};

export default Header;
