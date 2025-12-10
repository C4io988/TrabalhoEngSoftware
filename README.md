# Inova Farma
> Template básico para desenvolvimento do sistema Inova Farma (React + Python/Flask).

---

## 🚀 Guia Rápido (Dia a Dia)
*Passo a passo resumido para rodar o projeto se já estiver instalado.*

1.  Abra o banco de dados (**PgAdmin**).
2.  Abra **2 terminais** no seu editor.
3.  **Terminal 1 (Frontend):**
    ```bash
    cd frontend
    npm run dev
    ```
4.  **Terminal 2 (Backend):**
    ```powershell
    cd backend
    .\venv\Scripts\Activate.ps1
    python app.py
    ```

---

## 📚 Guia de Instalação Completo
*Siga estes passos na primeira vez que for configurar o projeto.*

### 1. Clonar o Projeto
Faça o clone do repositório para sua máquina local.

### 2. Backend (Python/Flask)

**a) Acesse a pasta do servidor:**
```bash
cd backend
```

**b) Crie o ambiente virtual:**
*(Essencial para isolar as bibliotecas do projeto)*
```bash
python -m venv venv
```

**c) Ative o ambiente virtual:**
* **Windows:**
    ```powershell
    .\venv\Scripts\activate
    ```
* **Linux/Mac:**
    ```bash
    source venv/bin/activate
    ```

**d) Instale as dependências:**
```bash
pip install -r requirements.txt
```

**e) Configure o Banco de Dados (PostgreSQL):**
1.  Abra o **PGAdmin**.
2.  Crie um banco de dados chamado `postgres` (ou verifique o nome em `config.py`).
3.  Abra a **Query Tool**.
4.  Execute o script `BancoDados.sql`.
5.  ⚠️ **IMPORTANTE:** Execute também o script extra de atualização para criar as tabelas `Medicamento` e `Solicitacao`.

**f) Inicie o servidor:**
```bash
python app.py
```

### 3. Frontend (React/Vite)

**a) Abra um NOVO terminal e acesse a pasta do site:**
```bash
cd frontend
```

**b) Instale os pacotes (node_modules):**
```bash
npm install
```

**c) Inicie o frontend:**
```bash
npm run dev
```

---

## 🧪 Como Testar
Acesse o sistema pelo navegador: [http://localhost:5173](http://localhost:5173)

### Credenciais de Acesso

| Perfil | CPF | Senha |
| :--- | :--- | :--- |
| **Cidadão** | `11111111111` | `12345` |
| **Analista** | `22222222222` | `12345` |

---
