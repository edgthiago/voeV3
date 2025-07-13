/**
 * @fileoverview Serviço de notificações (Email, SMS, Push)
 * @description Gerencia envio de notificações para eventos do sistema
 * @author Sistema de Papelaria
 * @version 1.0
 */

const nodemailer = require('nodemailer');
const axios = require('axios');
const conexao = require('../banco/conexao');

class NotificacaoService {
    constructor() {
        // Configuração do email (usando Gmail como exemplo)
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD // App Password do Gmail
            }
        });

        // Configuração SMS (usando Twilio como exemplo)
        this.twilioSid = process.env.TWILIO_SID;
        this.twilioToken = process.env.TWILIO_TOKEN;
        this.twilioPhone = process.env.TWILIO_PHONE;

        // Configuração Push (usando Firebase)
        this.firebaseServerKey = process.env.FIREBASE_SERVER_KEY;

        this.templates = {
            email: {
                pedido_criado: {
                    subject: '🛍️ Pedido Confirmado - Papelaria',
                    html: (dados) => `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333;">Pedido Confirmado!</h2>
                            <p>Olá <strong>${dados.nome_cliente}</strong>,</p>
                            <p>Seu pedido <strong>#${dados.pedido_id}</strong> foi confirmado com sucesso!</p>
                            
                            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3>Detalhes do Pedido:</h3>
                                <ul>
                                    <li><strong>Número:</strong> #${dados.pedido_id}</li>
                                    <li><strong>Valor Total:</strong> R$ ${dados.valor_total}</li>
                                    <li><strong>Status:</strong> ${dados.status}</li>
                                    <li><strong>Data:</strong> ${new Date(dados.data_pedido).toLocaleDateString('pt-BR')}</li>
                                </ul>
                            </div>
                            
                            <p>Você pode acompanhar o status do seu pedido através do nosso site.</p>
                            <p>Obrigado por comprar conosco!</p>
                            
                            <hr style="margin: 30px 0;">
                            <p style="color: #666; font-size: 12px;">Papelaria - Os melhores produtos para escritório e escola</p>
                        </div>
                    `
                },
                pagamento_aprovado: {
                    subject: '✅ Pagamento Aprovado - Papelaria',
                    html: (dados) => `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #27ae60;">Pagamento Aprovado!</h2>
                            <p>Olá <strong>${dados.nome_cliente}</strong>,</p>
                            <p>O pagamento do seu pedido <strong>#${dados.pedido_id}</strong> foi aprovado!</p>
                            
                            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3>Detalhes do Pagamento:</h3>
                                <ul>
                                    <li><strong>Valor:</strong> R$ ${dados.valor}</li>
                                    <li><strong>Método:</strong> ${dados.metodo_pagamento}</li>
                                    <li><strong>Status:</strong> Aprovado</li>
                                </ul>
                            </div>
                            
                            <p>Seu pedido já está sendo preparado para envio!</p>
                            
                            <hr style="margin: 30px 0;">
                            <p style="color: #666; font-size: 12px;">Papelaria - Os melhores produtos para escritório e escola</p>
                        </div>
                    `
                },
                pedido_enviado: {
                    subject: '📦 Pedido Enviado - Papelaria',
                    html: (dados) => `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #3498db;">Pedido Enviado!</h2>
                            <p>Olá <strong>${dados.nome_cliente}</strong>,</p>
                            <p>Seu pedido <strong>#${dados.pedido_id}</strong> foi enviado!</p>
                            
                            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3>Informações de Rastreamento:</h3>
                                <ul>
                                    <li><strong>Código de Rastreamento:</strong> ${dados.codigo_rastreamento}</li>
                                    <li><strong>Transportadora:</strong> ${dados.transportadora}</li>
                                    <li><strong>Previsão de Entrega:</strong> ${dados.previsao_entrega}</li>
                                </ul>
                            </div>
                            
                            <p>Você pode rastrear seu pedido através do código acima ou em nosso site.</p>
                            
                            <hr style="margin: 30px 0;">
                            <p style="color: #666; font-size: 12px;">Papelaria - Os melhores produtos para escritório e escola</p>
                        </div>
                    `
                },
                pedido_entregue: {
                    subject: '🎉 Pedido Entregue - Papelaria',
                    html: (dados) => `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #e74c3c;">Pedido Entregue!</h2>
                            <p>Olá <strong>${dados.nome_cliente}</strong>,</p>
                            <p>Seu pedido <strong>#${dados.pedido_id}</strong> foi entregue com sucesso!</p>
                            
                            <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3>Detalhes da Entrega:</h3>
                                <ul>
                                    <li><strong>Data de Entrega:</strong> ${new Date(dados.data_entrega).toLocaleDateString('pt-BR')}</li>
                                    <li><strong>Recebido por:</strong> ${dados.recebido_por || 'Destinatário'}</li>
                                </ul>
                            </div>
                            
                            <p>Esperamos que você esteja satisfeito com sua compra!</p>
                            <p>Não se esqueça de avaliar os produtos e deixar seu comentário.</p>
                            
                            <hr style="margin: 30px 0;">
                            <p style="color: #666; font-size: 12px;">Papelaria - Os melhores produtos para escritório e escola</p>
                        </div>
                    `
                }
            },
            sms: {
                pedido_criado: (dados) => `Papelaria: Pedido #${dados.pedido_id} confirmado! Valor: R$ ${dados.valor_total}. Acompanhe em nosso site.`,
                pagamento_aprovado: (dados) => `Papelaria: Pagamento aprovado para pedido #${dados.pedido_id}! Seu pedido está sendo preparado.`,
                pedido_enviado: (dados) => `Papelaria: Pedido #${dados.pedido_id} enviado! Rastreamento: ${dados.codigo_rastreamento}`,
                pedido_entregue: (dados) => `Papelaria: Pedido #${dados.pedido_id} entregue com sucesso! Obrigado pela preferência.`
            },
            push: {
                pedido_criado: (dados) => ({
                    title: 'Pedido Confirmado!',
                    body: `Seu pedido #${dados.pedido_id} foi confirmado. Valor: R$ ${dados.valor_total}`,
                    icon: '/img/logo.svg',
                    badge: '/img/logo.svg'
                }),
                pagamento_aprovado: (dados) => ({
                    title: 'Pagamento Aprovado!',
                    body: `Pagamento do pedido #${dados.pedido_id} foi aprovado!`,
                    icon: '/img/logo.svg',
                    badge: '/img/logo.svg'
                }),
                pedido_enviado: (dados) => ({
                    title: 'Pedido Enviado!',
                    body: `Pedido #${dados.pedido_id} foi enviado. Código: ${dados.codigo_rastreamento}`,
                    icon: '/img/logo.svg',
                    badge: '/img/logo.svg'
                }),
                pedido_entregue: (dados) => ({
                    title: 'Pedido Entregue!',
                    body: `Seu pedido #${dados.pedido_id} foi entregue com sucesso!`,
                    icon: '/img/logo.svg',
                    badge: '/img/logo.svg'
                })
            }
        };
    }

    /**
     * Enviar notificação por email
     * @param {string} email - Email do destinatário
     * @param {string} template - Template a ser usado
     * @param {Object} dados - Dados para preencher o template
     */
    async enviarEmail(email, template, dados) {
        try {
            if (!this.emailTransporter) {
                console.warn('⚠️ Transportador de email não configurado');
                return { sucesso: false, erro: 'Email não configurado' };
            }

            const templateData = this.templates.email[template];
            if (!templateData) {
                throw new Error(`Template de email '${template}' não encontrado`);
            }

            const mailOptions = {
                from: `"Papelaria" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: templateData.subject,
                html: templateData.html(dados)
            };

            const info = await this.emailTransporter.sendMail(mailOptions);
            
            // Salvar log da notificação
            await this.salvarLogNotificacao({
                tipo: 'email',
                destinatario: email,
                template,
                status: 'enviado',
                dados: JSON.stringify(dados),
                external_id: info.messageId
            });

            console.log(`✅ Email enviado para ${email}: ${template}`);
            return { sucesso: true, id: info.messageId };

        } catch (error) {
            console.error('❌ Erro ao enviar email:', error);
            
            // Salvar log do erro
            await this.salvarLogNotificacao({
                tipo: 'email',
                destinatario: email,
                template,
                status: 'erro',
                dados: JSON.stringify(dados),
                erro: error.message
            });

            return { sucesso: false, erro: error.message };
        }
    }

    /**
     * Enviar notificação por SMS
     * @param {string} telefone - Número do telefone (formato: +5511999999999)
     * @param {string} template - Template a ser usado
     * @param {Object} dados - Dados para preencher o template
     */
    async enviarSMS(telefone, template, dados) {
        try {
            if (!this.twilioSid || !this.twilioToken) {
                console.warn('⚠️ Credenciais Twilio não configuradas');
                return { sucesso: false, erro: 'SMS não configurado' };
            }

            const templateData = this.templates.sms[template];
            if (!templateData) {
                throw new Error(`Template de SMS '${template}' não encontrado`);
            }

            const message = templateData(dados);

            const response = await axios.post(
                `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`,
                new URLSearchParams({
                    From: this.twilioPhone,
                    To: telefone,
                    Body: message
                }),
                {
                    auth: {
                        username: this.twilioSid,
                        password: this.twilioToken
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Salvar log da notificação
            await this.salvarLogNotificacao({
                tipo: 'sms',
                destinatario: telefone,
                template,
                status: 'enviado',
                dados: JSON.stringify(dados),
                external_id: response.data.sid
            });

            console.log(`✅ SMS enviado para ${telefone}: ${template}`);
            return { sucesso: true, id: response.data.sid };

        } catch (error) {
            console.error('❌ Erro ao enviar SMS:', error.response?.data || error.message);
            
            // Salvar log do erro
            await this.salvarLogNotificacao({
                tipo: 'sms',
                destinatario: telefone,
                template,
                status: 'erro',
                dados: JSON.stringify(dados),
                erro: error.message
            });

            return { sucesso: false, erro: error.message };
        }
    }

    /**
     * Enviar notificação push
     * @param {string} token - Token do dispositivo
     * @param {string} template - Template a ser usado
     * @param {Object} dados - Dados para preencher o template
     */
    async enviarPush(token, template, dados) {
        try {
            if (!this.firebaseServerKey) {
                console.warn('⚠️ Firebase Server Key não configurada');
                return { sucesso: false, erro: 'Push não configurado' };
            }

            const templateData = this.templates.push[template];
            if (!templateData) {
                throw new Error(`Template de push '${template}' não encontrado`);
            }

            const notification = templateData(dados);

            const response = await axios.post(
                'https://fcm.googleapis.com/fcm/send',
                {
                    to: token,
                    notification: notification,
                    data: {
                        template,
                        pedido_id: dados.pedido_id,
                        click_action: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                {
                    headers: {
                        'Authorization': `key=${this.firebaseServerKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Salvar log da notificação
            await this.salvarLogNotificacao({
                tipo: 'push',
                destinatario: token,
                template,
                status: 'enviado',
                dados: JSON.stringify(dados),
                external_id: response.data.multicast_id
            });

            console.log(`✅ Push enviado para token: ${template}`);
            return { sucesso: true, id: response.data.multicast_id };

        } catch (error) {
            console.error('❌ Erro ao enviar push:', error.response?.data || error.message);
            
            // Salvar log do erro
            await this.salvarLogNotificacao({
                tipo: 'push',
                destinatario: token,
                template,
                status: 'erro',
                dados: JSON.stringify(dados),
                erro: error.message
            });

            return { sucesso: false, erro: error.message };
        }
    }

    /**
     * Enviar notificação completa (email + SMS + push)
     * @param {Object} notificacao - Dados da notificação
     */
    async enviarNotificacaoCompleta(notificacao) {
        const { 
            usuario_id, 
            template, 
            dados, 
            canais = ['email'] // Padrão apenas email
        } = notificacao;

        try {
            // Buscar dados do usuário
            const usuario = await this.buscarDadosUsuario(usuario_id);
            if (!usuario) {
                throw new Error('Usuário não encontrado');
            }

            const resultados = {};

            // Enviar por email
            if (canais.includes('email') && usuario.email) {
                resultados.email = await this.enviarEmail(usuario.email, template, dados);
            }

            // Enviar por SMS
            if (canais.includes('sms') && usuario.telefone) {
                const telefoneFormatado = this.formatarTelefone(usuario.telefone);
                resultados.sms = await this.enviarSMS(telefoneFormatado, template, dados);
            }

            // Enviar push
            if (canais.includes('push') && usuario.push_token) {
                resultados.push = await this.enviarPush(usuario.push_token, template, dados);
            }

            console.log(`✅ Notificação '${template}' enviada para usuário ${usuario_id}`);
            return { sucesso: true, resultados };

        } catch (error) {
            console.error('❌ Erro ao enviar notificação completa:', error);
            return { sucesso: false, erro: error.message };
        }
    }

    /**
     * Buscar dados do usuário para notificação
     * @private
     */
    async buscarDadosUsuario(usuario_id) {
        try {
            const sql = `
                SELECT 
                    id,
                    nome,
                    email,
                    telefone,
                    push_token,
                    notificacoes_email,
                    notificacoes_sms,
                    notificacoes_push
                FROM usuarios 
                WHERE id = ?
            `;

            const resultado = await conexao.executarConsulta(sql, [usuario_id]);
            return resultado[0] || null;

        } catch (error) {
            console.error('❌ Erro ao buscar dados do usuário:', error);
            return null;
        }
    }

    /**
     * Salvar log da notificação
     * @private
     */
    async salvarLogNotificacao(log) {
        try {
            const sql = `
                INSERT INTO notificacoes_log (
                    tipo, destinatario, template, status, dados, external_id, erro, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await conexao.executarConsulta(sql, [
                log.tipo,
                log.destinatario,
                log.template,
                log.status,
                log.dados,
                log.external_id || null,
                log.erro || null
            ]);

        } catch (error) {
            console.error('❌ Erro ao salvar log de notificação:', error);
        }
    }

    /**
     * Formatar telefone para padrão internacional
     * @private
     */
    formatarTelefone(telefone) {
        // Remove caracteres não numéricos
        const numeros = telefone.replace(/\D/g, '');
        
        // Se já tem código do país, retorna
        if (numeros.startsWith('55')) {
            return `+${numeros}`;
        }
        
        // Adiciona código do Brasil
        return `+55${numeros}`;
    }

    /**
     * Testar configurações de notificação
     */
    async testarConfiguracoes() {
        const resultados = {
            email: false,
            sms: false,
            push: false
        };

        // Teste Email
        try {
            if (this.emailTransporter) {
                await this.emailTransporter.verify();
                resultados.email = true;
                console.log('✅ Configuração de email válida');
            }
        } catch (error) {
            console.log('❌ Configuração de email inválida:', error.message);
        }

        // Teste SMS
        try {
            if (this.twilioSid && this.twilioToken) {
                const response = await axios.get(
                    `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}.json`,
                    {
                        auth: {
                            username: this.twilioSid,
                            password: this.twilioToken
                        }
                    }
                );
                resultados.sms = true;
                console.log('✅ Configuração de SMS válida');
            }
        } catch (error) {
            console.log('❌ Configuração de SMS inválida:', error.message);
        }

        // Teste Push
        if (this.firebaseServerKey) {
            resultados.push = true;
            console.log('✅ Configuração de push definida');
        } else {
            console.log('❌ Configuração de push não definida');
        }

        return resultados;
    }
}

module.exports = new NotificacaoService();
