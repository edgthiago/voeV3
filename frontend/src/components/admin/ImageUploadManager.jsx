import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Alert, Spinner, ProgressBar, Row, Col, Form, Badge } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import './ImageUploadManager.css';

const ImageUploadManager = ({ produtoId, onImagensUpdated, readOnly = false }) => {
  const [imagens, setImagens] = useState({
    principal: null,
    adicionais: []
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Carregar imagens existentes
  const carregarImagens = useCallback(async () => {
    if (!produtoId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/produtos/${produtoId}/imagens`);
      const data = await response.json();
      
      if (data.sucesso) {
        setImagens({
          principal: data.dados.imagem_principal,
          adicionais: data.dados.imagens_adicionais || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      setError('Erro ao carregar imagens existentes');
    } finally {
      setLoading(false);
    }
  }, [produtoId]);

  useEffect(() => {
    carregarImagens();
  }, [carregarImagens]);

  // Upload de imagem principal
  const uploadImagemPrincipal = async (arquivo) => {
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('imagem', arquivo);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`/api/upload/produto/${produtoId}/imagem-principal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.sucesso) {
        await carregarImagens();
        onImagensUpdated?.();
        setError(null);
      } else {
        setError(data.mensagem || 'Erro no upload da imagem principal');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro ao enviar imagem principal');
    } finally {
      setUploading(false);
    }
  };

  // Upload de imagens adicionais
  const uploadImagensAdicionais = async (arquivos) => {
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      arquivos.forEach(arquivo => {
        formData.append('imagens', arquivo);
      });
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`/api/upload/produto/${produtoId}/imagem-adicional`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.sucesso) {
        await carregarImagens();
        onImagensUpdated?.();
        setError(null);
      } else {
        setError(data.mensagem || 'Erro no upload das imagens adicionais');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro ao enviar imagens adicionais');
    } finally {
      setUploading(false);
    }
  };

  // Deletar imagem
  const deletarImagem = async (imagemId) => {
    if (!confirm('Tem certeza que deseja deletar esta imagem?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`/api/produtos/${produtoId}/imagens/${imagemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.sucesso) {
        await carregarImagens();
        onImagensUpdated?.();
      } else {
        setError(data.mensagem || 'Erro ao deletar imagem');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      setError('Erro ao deletar imagem');
    } finally {
      setLoading(false);
    }
  };

  // Configuração do dropzone para imagem principal
  const dropzonePrincipal = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: readOnly || uploading,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadImagemPrincipal(acceptedFiles[0]);
      }
    }
  });

  // Configuração do dropzone para imagens adicionais
  const dropzoneAdicionais = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 4 - imagens.adicionais.length,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: readOnly || uploading || imagens.adicionais.length >= 4,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadImagensAdicionais(acceptedFiles);
      }
    }
  });

  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !imagens.principal && imagens.adicionais.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Carregando imagens...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="image-upload-manager">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Imagem Principal */}
      <Card className="mb-4">
        <Card.Header>
          <h5><i className="bi bi-image me-2"></i>Imagem Principal</h5>
          <small className="text-muted">Obrigatória - Será exibida na listagem de produtos</small>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              {imagens.principal ? (
                <div className="current-image">
                  <img 
                    src={imagens.principal.url_imagem} 
                    alt={imagens.principal.alt_text}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <div className="mt-2">
                    <Badge bg="success">Principal</Badge>
                    <small className="text-muted ms-2">
                      {imagens.principal.largura}x{imagens.principal.altura}px
                      {imagens.principal.tamanho_bytes > 0 && ` • ${formatarTamanho(imagens.principal.tamanho_bytes)}`}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="no-image text-center p-4 border rounded bg-light">
                  <i className="bi bi-image fs-1 text-muted"></i>
                  <p className="text-muted mt-2">Nenhuma imagem principal</p>
                </div>
              )}
            </Col>
            <Col md={6}>
              {!readOnly && (
                <div 
                  {...dropzonePrincipal.getRootProps()} 
                  className={`dropzone-principal ${dropzonePrincipal.isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
                >
                  <input {...dropzonePrincipal.getInputProps()} />
                  <div className="text-center p-4">
                    {uploading ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <p className="mt-2">Enviando...</p>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload fs-1 text-primary"></i>
                        <p className="mt-2">
                          {dropzonePrincipal.isDragActive 
                            ? "Solte a imagem aqui..." 
                            : imagens.principal 
                              ? "Arraste uma nova imagem ou clique para substituir"
                              : "Arraste uma imagem ou clique para enviar"
                          }
                        </p>
                        <small className="text-muted">
                          Formatos: JPG, PNG, WEBP • Máximo: 10MB • Mínimo: 400x400px
                        </small>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Imagens Adicionais */}
      <Card>
        <Card.Header>
          <h5><i className="bi bi-images me-2"></i>Imagens Adicionais</h5>
          <small className="text-muted">
            Opcional - Máximo 4 imagens • {imagens.adicionais.length}/4 enviadas
          </small>
        </Card.Header>
        <Card.Body>
          {/* Imagens existentes */}
          {imagens.adicionais.length > 0 && (
            <Row className="mb-4">
              {imagens.adicionais.map((imagem, index) => (
                <Col md={3} key={imagem.id} className="mb-3">
                  <div className="adicional-image position-relative">
                    <img 
                      src={imagem.url_imagem}
                      alt={imagem.alt_text}
                      className="img-fluid rounded shadow-sm"
                      style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                    />
                    <Badge bg="secondary" className="position-absolute top-0 start-0 m-1">
                      #{imagem.ordem}
                    </Badge>
                    {!readOnly && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1"
                        onClick={() => deletarImagem(imagem.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    )}
                    <div className="mt-1">
                      <small className="text-muted">
                        {imagem.largura}x{imagem.altura}px
                        {imagem.tamanho_bytes > 0 && ` • ${formatarTamanho(imagem.tamanho_bytes)}`}
                      </small>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {/* Dropzone para adicionais */}
          {!readOnly && imagens.adicionais.length < 4 && (
            <div 
              {...dropzoneAdicionais.getRootProps()} 
              className={`dropzone-adicionais ${dropzoneAdicionais.isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
            >
              <input {...dropzoneAdicionais.getInputProps()} />
              <div className="text-center p-4">
                {uploading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2">Enviando imagens...</p>
                  </>
                ) : (
                  <>
                    <i className="bi bi-images fs-1 text-info"></i>
                    <p className="mt-2">
                      {dropzoneAdicionais.isDragActive 
                        ? "Solte as imagens aqui..." 
                        : `Arraste até ${4 - imagens.adicionais.length} imagens ou clique para enviar`
                      }
                    </p>
                    <small className="text-muted">
                      Formatos: JPG, PNG, WEBP • Máximo: 10MB cada • Mínimo: 300x300px
                    </small>
                  </>
                )}
              </div>
            </div>
          )}

          {imagens.adicionais.length >= 4 && (
            <Alert variant="info">
              <i className="bi bi-check-circle me-2"></i>
              Limite máximo de 4 imagens adicionais atingido.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ImageUploadManager;
