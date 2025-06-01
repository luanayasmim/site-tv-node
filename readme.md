# Reprodutor de Vídeos Automático (Electron)

Este projeto é um reprodutor de vídeos automático feito com Electron, que permite selecionar uma pasta local ou de rede, listar todos os vídeos suportados e reproduzi-los automaticamente em sequência.

## Funcionalidades
- Seleção de pasta local ou de rede (ex: `C:\Videos` ou `\\SERVIDOR\Videos`)
- Listagem automática de todos os vídeos suportados na pasta
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
Se ainda não instalou o Electron, rode:
```powershell
npm install electron
```

### 2. Confirme os arquivos principais
Certifique-se de que você tem estes arquivos na raiz do projeto:
- `index.html` (frontend)
- `main.js` (processo principal Electron)
- `preload.js` (expondo a API para o frontend)
- `package.json` (com o campo `"main": "main.js"`)

### 3. Adicione o script de inicialização no package.json
No seu `package.json`, adicione (ou ajuste) o campo scripts:
```json
"scripts": {
  "start": "electron ."
}
```

### 4. Execute a aplicação
No terminal, rode:
```powershell
npm start
```

### 5. Use a aplicação
- Na interface, digite o caminho da pasta de vídeos (ex: `C:\Users\yasmi\Videos` ou `\\SERVIDOR\Videos`).
- Clique em "Procurar" ou pressione Enter.
- Os vídeos reais da pasta serão listados e reproduzidos automaticamente.

---

## Observações
- O projeto só funciona como app desktop (Electron), não funciona em navegador comum.
- É necessário ter permissão de leitura na pasta de vídeos.
- Para acessar pastas de rede, o computador deve estar conectado à rede correspondente.

---

Desenvolvido por Yasmim (2025)
