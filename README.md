# template-ReactVite
Template básico para desenvolvimento 


-- para ligar --

I. Abrir o banco de dados (Pgadmin)

II. abrir 2 terminais

III. cd frontend --> npm run dev

IV. cd backend --> .\venv\Scripts\Activate.ps1 --> python app.py


============================================================
GUIA DE INSTALAÇÃO - INOVA FARMA (NOVA MÁQUINA)
============================================================

1. CLONAR O PROJETO

------------------------------------------------------------
2. BACKEND (PYTHON/FLASK)
------------------------------------------------------------
   a) Abra o terminal na pasta 'backend':
      cd backend

   b) Crie o ambiente virtual (importante para não dar conflito):
      python -m venv venv

   c) Ative o ambiente:
      - Windows: .\venv\Scripts\activate
      - Linux/Mac: source venv/bin/activate

   d) Instale as dependências:
      pip install -r requirements.txt

   e) Configure o Banco de Dados (PostgreSQL):
      - Abra o PGAdmin.
      - Crie um banco chamado 'postgres' (ou o nome que estiver em config.py).
      - Abra a Query Tool e rode o script 'BancoDados.sql' (está na raiz ou pasta backend).
      - *IMPORTANTE:* Rode o script extra de atualização para criar as tabelas 'Medicamento' e 'Solicitacao'.

   f) Inicie o servidor:
      python app.py

------------------------------------------------------------
3. FRONTEND (REACT/VITE)
------------------------------------------------------------
   a) Abra um NOVO terminal na pasta 'frontend':
      cd frontend

   b) Baixe as dependências (recria a pasta node_modules):
      npm install

   c) Inicie o site:
      npm run dev

------------------------------------------------------------
4. TESTAR
------------------------------------------------------------
   - Acesse: http://localhost:5173
   - Login Cidadão: CPF 11111111111 | Senha 12345
   - Login Analista: CPF 22222222222 | Senha 12345
