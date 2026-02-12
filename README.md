# Live Document

Aplicação mobile para escrita e edição colaborativa de documentos em tempo real, com autenticação de usuários, compartilhamento e histórico de versões. O repositório contém o backend (Node.js + Express + Socket.IO) e o frontend (React Native com Expo).

## Principais recursos

- Autenticação (login, cadastro, recuperação de senha)
- Edição colaborativa em tempo real via WebSocket
- Compartilhamento com permissão (leitura, escrita, admin)
- Histórico e restauração de versões
- Swagger para documentação da API

## Tecnologias

- Backend: Node.js, Express, MongoDB, Socket.IO, JWT, Swagger
- Mobile: React Native (Expo), Redux Toolkit, Axios, Socket.IO Client

## Estrutura do repositório

- backend/: API, sockets e configurações
- frontend/: aplicativo mobile

## Organização de pastas (gráfico)

```text
.
├── backend/
│   ├── docker/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── server.js
└── frontend/
	├── assets/
	├── src/
	│   ├── components/
	│   ├── navigation/
	│   ├── screens/
	│   ├── services/
	│   ├── store/
	│   └── utils/
	├── App.js
	└── package.json
```

## Requisitos

- Node.js 18+ (ou compatível com as dependências do projeto)
- npm ou yarn
- MongoDB (local ou Docker)
- Expo CLI (para executar o app mobile)

## Configuração do backend

1) Instale as dependências:

```bash
cd backend
npm install
```

2) Crie um arquivo .env em backend/ com as variáveis:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/live-document
CLIENT_URL=http://localhost:19006
API_URL=http://localhost:5000
```

3) (Opcional) Suba o MongoDB via Docker:

```bash
cd backend/docker
docker compose up -d
```

4) Inicie a API:

```bash
# desenvolvimento
npm run dev

# produção
npm start
```

A documentação Swagger ficará em http://localhost:5000/api-docs.

## Configuração do frontend

1) Instale as dependências:

```bash
cd frontend
npm install
```

2) Ajuste a URL da API em frontend/src/utils/constants.js:

```javascript
export const API_BASE_URL = 'http://SEU_IP_OU_HOST:5000';
```

3) Inicie o Expo:

```bash
npm start
```

Para rodar em emulador ou dispositivo:

```bash
npm run android
npm run ios
```

## Scripts principais

Backend (backend/package.json):

- npm run dev: servidor com nodemon
- npm start: servidor em produção
- npm test: testes

Frontend (frontend/package.json):

- npm start: Expo
- npm run android: Expo no Android
- npm run ios: Expo no iOS
- npm run web: Expo no Web

## Observações

- O app mobile precisa que a API esteja acessível pelo IP/host configurado em API_BASE_URL.
- Para conexões em rede local, use o IP da máquina que roda o backend.
