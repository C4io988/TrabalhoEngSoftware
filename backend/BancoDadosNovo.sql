-- 1. LIMPEZA DOS DADOS ANTIGOS (Para evitar o erro de violação)
DELETE FROM Usuario;

-- 2. AJUSTAR A REGRA (CONSTRAINT)
-- Remove a regra antiga
ALTER TABLE Usuario DROP CONSTRAINT IF EXISTS usuario_idtpapel_check;
-- Adiciona a nova regra (C=Cidadão, A=Analista, G=Gestor)
ALTER TABLE Usuario ADD CONSTRAINT usuario_idtpapel_check CHECK (idtPapel IN ('C', 'A', 'G'));

-- 3. INSERIR USUÁRIOS DE TESTE (Alinhados com o trabalho)
INSERT INTO Usuario (codUsuarioCPF, nomUsuario, desEmail, idtPapel, idtAtivo)
VALUES
  ('11111111111', 'João Cidadão', 'joao@email.com', 'C', True),
  ('22222222222', 'Maria Analista', 'maria@saude.mg.gov.br', 'A', True),
  ('33333333333', 'Carlos Gestor', 'carlos@saude.mg.gov.br', 'G', True);

-- 4. CRIAR TABELA DE MEDICAMENTOS
DROP TABLE IF EXISTS Medicamento CASCADE;
CREATE TABLE Medicamento (
    idMedicamento SERIAL PRIMARY KEY,
    nomMedicamento VARCHAR(100) NOT NULL,
    desDosagem VARCHAR(50),
    idtAtivo BOOLEAN DEFAULT TRUE
);

-- Inserir remédios do seu protótipo
INSERT INTO Medicamento (nomMedicamento, desDosagem) VALUES 
('Paracetamol', '750mg'),
('Dipirona', '500mg'),
('Amoxicilina', '500mg'),
('Insulina Regular', '100UI/ml');

-- 5. CRIAR TABELA DE SOLICITAÇÕES
DROP TABLE IF EXISTS Solicitacao CASCADE;
CREATE TABLE Solicitacao (
    idSolicitacao SERIAL PRIMARY KEY,
    codUsuarioCPF CHAR(11) NOT NULL,
    idMedicamento INTEGER NOT NULL,
    datSolicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    desStatus VARCHAR(20) DEFAULT 'EM ANALISE',
    txtObservacao TEXT,
    
    FOREIGN KEY (codUsuarioCPF) REFERENCES Usuario(codUsuarioCPF),
    FOREIGN KEY (idMedicamento) REFERENCES Medicamento(idMedicamento)
);

-- 6. CRIAR TABELA DE DOCUMENTOS (Para os anexos)
DROP TABLE IF EXISTS DocumentoSolicitacao CASCADE;
CREATE TABLE DocumentoSolicitacao (
    idDocumento SERIAL PRIMARY KEY,
    idSolicitacao INTEGER NOT NULL,
    nomArquivo VARCHAR(100),
    desCaminho VARCHAR(255),
    
    FOREIGN KEY (idSolicitacao) REFERENCES Solicitacao(idSolicitacao)
);