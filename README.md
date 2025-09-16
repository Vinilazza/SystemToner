# TonersFull

Sistema completo de **gerenciamento de toners e impressoras**, com controle de **movimentações** (entradas e baixas), **alertas de estoque baixo**, **dashboard**, **histórico detalhado**, **gestão de usuários e perfis**, **tema claro/escuro**, API segura com **JWT** e **frontend** moderno em React.

> **Stack**
>
> - **Frontend:** React + Vite, TailwindCSS, shadcn/ui, React Query v5
> - **Backend:** Node.js, Express, MongoDB/Mongoose, JWT

---

## ✨ Principais Funcionalidades

- **Inventário de Toners**
  - CRUD de toners, impressoras e vínculos
  - **Alertas de estoque baixo** (níveis configuráveis por modelo/locação)
  - **Histórico de movimentações** (entradas, baixas, usuário, data, observação)
- **Movimentações**
  - Registro de **Entrada** e **Baixa** com validações de saldo
  - Anexos/observações (opcional)
- **Gestão de Usuários e Perfis**
  - Perfis: **Admin**, **Técnico**, **Usuário**
  - Permissões por rota/ação (ex.: criação de toner visível só para técnico/admin)
- **Dashboard**
  - Cards/resumos (toners em falta, últimos movimentos, impressoras mais ativas)
  - Filtros e busca
- **Experiência**
  - **Tema claro/escuro**
  - Tabelas com paginação e busca
  - Feedbacks com toasts
- **Segurança**
  - Autenticação **JWT** (login, refresh opcional)
  - Middleware de autorização por papel
- **Notificações**
  - Rotina que **avisa quando um toner atinge nível mínimo**

---

## 🚀 Como rodar localmente

### 1) Backend

```bash
cd backend

yarn
yarn start
```

### 2) Frontend

```bash
cd frontend

yarn
yarn run dev

```

---

## 🔐 Autenticação & Perfis

- **Login** → retorna `token JWT` e dados do usuário.
- Middleware `auth` valida o token e injeta `req.user`.
- **Roles** suportadas:
  - **admin**: acesso total
  - **tecnico**: gestão de toners, impressoras e movimentações
  - **usuario**: consulta, solicitações; sem criar/alterar estoque
- **Frontend:** esconde botões de “Criar Toner” ou “Movimentar” para quem **não** for técnico/admin.

---

## 🖥️ Frontend (principais telas)

- **Login / Registro**
- **Dashboard** com cartões (estoque baixo, últimas movimentações)
- **Lista de Toners** com paginação/busca, criação/edição (tecnico/admin)
- **Lista de Impressoras** e vínculo com toners
- **Movimentações** (entrada/baixa) com histórico e filtros
- **Administração de Usuários** (admin)
- **Tema claro/escuro** persistido

---

## 🛡️ Segurança & Boas Práticas

- **JWT** com `secret` forte e expiração adequada
- **CORS** restrito ao domínio do frontend
- **Rate limit** (login e rotas sensíveis)
- **Validação de entrada** (zod/joi)
- **Logs e auditoria** em movimentações
- **Backups** regulares do MongoDB Atlas

---

## 🔗 Links úteis

- **Repositório:** https://github.com/Vinilazza/SystemToner
- **Produção (frontend):** https://tonersfull.vlsystem.com.br (ajuste se necessário)
- **API (backend):** https://api.tonersfull.vlsystem.com.br/api (ajuste se necessário)
