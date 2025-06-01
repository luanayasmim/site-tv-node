# Reprodutor de Vídeos Automático (Web + API)

Este projeto é um reprodutor de vídeos automático que utiliza uma API Node.js/Express para listar e servir vídeos de um diretório local ou de rede, permitindo que o frontend (site) consuma essa lista e reproduza os vídeos dinamicamente com autoplay.

## Funcionalidades
- Seleção de pasta local ou de rede (ex: `C:\Videos` ou `\\SERVIDOR\Videos`)
- Listagem automática de todos os vídeos suportados na pasta via API
- Reprodução automática (autoplay) e looping de playlist
- Interface moderna com Tailwind CSS
- Suporte a temas claro e escuro
- Controles de reprodução, volume, fullscreen e navegação por teclado

## Formatos de vídeo suportados
- `.mp4`, `.avi`, `.mkv`, `.mov`, `.webm`, `.flv`, `.wmv`

## Como executar o projeto

### 1. Instale as dependências
Abra o terminal na pasta do projeto e execute:
```powershell
npm install
```

### 2. Inicie a API backend
No terminal, rode:
```powershell
node server.js
```
A API estará disponível em `http://localhost:3001`.

### 3. Sirva o frontend (index.html)
Para evitar problemas de CORS e arquivos locais, utilize uma extensão como Live Server no VS Code, ou rode um servidor local simples:
```powershell
npx serve .
```
Ou abra o `index.html` diretamente no navegador (alguns recursos podem não funcionar em file://).

### 4. Use a aplicação
- Na interface, digite o caminho da pasta de vídeos (ex: `C:\Users\yasmi\Videos` ou `\\SERVIDOR\Videos`).
- Clique em "Procurar" ou pressione Enter.
- Os vídeos reais da pasta serão listados e reproduzidos automaticamente.

---

## Observações
- O backend Node.js/Express precisa rodar no mesmo computador que tem acesso à pasta de vídeos.
- O frontend se comunica com a API via HTTP (`/videos` para listar e `/file` para servir os vídeos).
- É necessário ter permissão de leitura na pasta de vídeos.
- Para acessar pastas de rede, o computador deve estar conectado à rede correspondente.

---

Desenvolvido por Luana Yasmim - Rafael Lourenço (2025)
