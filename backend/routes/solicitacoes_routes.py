from flask import Blueprint, request, jsonify
from db import Db, Mode

solicitacoes_bp = Blueprint('solicitacoes_bp', __name__)

# --- ROTA 1: LISTAR MEDICAMENTOS ---
@solicitacoes_bp.route('/medicamentos', methods=['GET'])
def obter_medicamentos():
    db = Db()
    sql = "SELECT idMedicamento, nomMedicamento, desDosagem FROM Medicamento WHERE idtAtivo = true ORDER BY nomMedicamento"
    resultados = db.execSql(sql, mode=Mode.SELECT)
    if resultados is None: return jsonify([]), 200
    
    lista = []
    for row in resultados:
        lista.append({"id": row[0], "nome": row[1], "dosagem": row[2]})
    return jsonify(lista), 200

# --- ROTA 2: CRIAR SOLICITAÇÃO (CORRIGIDA) ---
@solicitacoes_bp.route('/solicitacoes', methods=['POST'])
def criar_solicitacao():
    dados = request.json
    db = Db()
    cpf = dados.get('codUsuarioCPF')
    id_med = dados.get('idMedicamento')
    obs = dados.get('observacao', '')

    if not cpf or not id_med:
        return jsonify({"tipo": "ERRO", "mensagem": "Dados incompletos."}), 400

    sql = """
        INSERT INTO Solicitacao (codUsuarioCPF, idMedicamento, txtObservacao, desStatus)
        VALUES (%s, %s, %s, 'EM ANALISE')
        RETURNING idSolicitacao
    """
    try:
        # CORREÇÃO AQUI:
        # Usamos Mode.DEFAULT (que faz o commit automático) 
        # E atuIdInsert=True (que captura o ID gerado pelo RETURNING)
        db.execSql(sql, (cpf, id_med, obs), mode=Mode.DEFAULT, atuIdInsert=True)
        
        # Recuperamos o ID salvo na classe Db
        id_gerado = db.getIdInsert()
        
        if not id_gerado:
             return jsonify({"tipo": "ERRO", "mensagem": "Erro ao gravar solicitação."}), 500
        
        return jsonify({"tipo": "SUCESSO", "protocolo": id_gerado}), 201

    except Exception as e:
        return jsonify({"tipo": "ERRO", "mensagem": str(e)}), 500

# --- ROTA 3: LISTAR FILA ---
@solicitacoes_bp.route('/listar_solicitacoes', methods=['GET'])
def listar_solicitacoes():
    db = Db()
    sql = """
        SELECT 
            s.idSolicitacao, 
            u.nomUsuario, 
            m.nomMedicamento, 
            to_char(s.datSolicitacao, 'DD/MM/YYYY') as data_formatada,
            s.desStatus
        FROM Solicitacao s
        JOIN Usuario u ON s.codUsuarioCPF = u.codUsuarioCPF
        JOIN Medicamento m ON s.idMedicamento = m.idMedicamento
        ORDER BY s.datSolicitacao DESC
    """
    resultados = db.execSql(sql, mode=Mode.SELECT)
    if resultados is None: return jsonify([]), 200
        
    lista = []
    for row in resultados:
        lista.append({
            "protocolo": row[0],
            "cidadao": row[1],
            "medicamento": row[2],
            "data": row[3],
            "status": row[4]
        })
    return jsonify(lista), 200

# --- ROTA 4: AVALIAR ---
@solicitacoes_bp.route('/avaliar_solicitacao', methods=['PUT'])
def avaliar_solicitacao():
    dados = request.json
    db = Db()
    
    id_solicitacao = dados.get('idSolicitacao')
    novo_status = dados.get('status')
    
    if not id_solicitacao or novo_status not in ['DEFERIDO', 'INDEFERIDO']:
        return jsonify({"tipo": "ERRO", "mensagem": "Dados inválidos."}), 400
        
    sql = "UPDATE Solicitacao SET desStatus = %s WHERE idSolicitacao = %s"
    
    try:
        db.execSql(sql, (novo_status, id_solicitacao), mode=Mode.DEFAULT)
        return jsonify({"tipo": "SUCESSO", "mensagem": "Status atualizado!"}), 200
    except Exception as e:
        return jsonify({"tipo": "ERRO", "mensagem": str(e)}), 500

# --- ROTA 5: MEUS PEDIDOS (Para o Cidadão) ---
@solicitacoes_bp.route('/minhas_solicitacoes/<cpf>', methods=['GET'])
def listar_minhas_solicitacoes(cpf):
    db = Db()
    # Filtra pelo CPF que veio na URL
    sql = """
        SELECT 
            s.idSolicitacao, 
            m.nomMedicamento, 
            to_char(s.datSolicitacao, 'DD/MM/YYYY') as data_formatada,
            s.desStatus
        FROM Solicitacao s
        JOIN Medicamento m ON s.idMedicamento = m.idMedicamento
        WHERE s.codUsuarioCPF = %s
        ORDER BY s.datSolicitacao DESC
    """
    resultados = db.execSql(sql, (cpf,), mode=Mode.SELECT)
    
    if resultados is None:
        return jsonify([]), 200
        
    lista = []
    for row in resultados:
        lista.append({
            "protocolo": row[0],
            "medicamento": row[1],
            "data": row[2],
            "status": row[3]
        })
        
    return jsonify(lista), 200

# --- ROTA 6: CADASTRAR MEDICAMENTO (Para Gestor/Func) ---
@solicitacoes_bp.route('/medicamentos', methods=['POST'])
def cadastrar_medicamento():
    dados = request.json
    db = Db()
    
    nome = dados.get('nome')
    dosagem = dados.get('dosagem')
    
    if not nome or not dosagem:
        return jsonify({"tipo": "ERRO", "mensagem": "Nome e dosagem são obrigatórios."}), 400
        
    sql = "INSERT INTO Medicamento (nomMedicamento, desDosagem, idtAtivo) VALUES (%s, %s, true)"
    
    try:
        db.execSql(sql, (nome, dosagem), mode=Mode.DEFAULT)
        return jsonify({"tipo": "SUCESSO", "mensagem": "Medicamento cadastrado!"}), 201
    except Exception as e:
        return jsonify({"tipo": "ERRO", "mensagem": str(e)}), 500

# --- ROTA 7: EXCLUIR MEDICAMENTO ---
@solicitacoes_bp.route('/medicamentos/<int:id_med>', methods=['DELETE'])
def excluir_medicamento(id_med):
    db = Db()
    
    # Verifica se já existe solicitação com esse remédio (Integridade Referencial)
    sql_check = "SELECT count(*) FROM Solicitacao WHERE idMedicamento = %s"
    res = db.execSql(sql_check, (id_med,), mode=Mode.SELECT)
    
    if res and res[0][0] > 0:
        # Se já foi usado, não deletamos, apenas inativamos (Soft Delete)
        sql_inativa = "UPDATE Medicamento SET idtAtivo = false WHERE idMedicamento = %s"
        db.execSql(sql_inativa, (id_med,), mode=Mode.DEFAULT)
        return jsonify({"tipo": "SUCESSO", "mensagem": "Medicamento inativado (já possui uso)."}), 200
    
    # Se nunca foi usado, pode excluir de verdade
    sql_delete = "DELETE FROM Medicamento WHERE idMedicamento = %s"
    try:
        db.execSql(sql_delete, (id_med,), mode=Mode.DEFAULT)
        return jsonify({"tipo": "SUCESSO", "mensagem": "Medicamento excluído!"}), 200
    except Exception as e:
        return jsonify({"tipo": "ERRO", "mensagem": str(e)}), 500
    

# --- ROTA 8: DADOS DO DASHBOARD (Para o Gestor) ---
@solicitacoes_bp.route('/dashboard/resumo', methods=['GET'])
def dashboard_resumo():
    db = Db()
    
    # Conta total de solicitações
    sql_total = "SELECT COUNT(*) FROM Solicitacao"
    res_total = db.execSql(sql_total, mode=Mode.SELECT)
    total = res_total[0][0] if res_total else 0
    
    # Conta por status (Agrupamento)
    sql_status = "SELECT desStatus, COUNT(*) FROM Solicitacao GROUP BY desStatus"
    res_status = db.execSql(sql_status, mode=Mode.SELECT)
    
    # Formata para facilitar no frontend
    # Ex: {'EM ANALISE': 5, 'DEFERIDO': 10, ...}
    dados_status = {}
    if res_status:
        for row in res_status:
            dados_status[row[0]] = row[1]
            
    return jsonify({
        "total": total,
        "em_analise": dados_status.get('EM ANALISE', 0),
        "deferidos": dados_status.get('DEFERIDO', 0),
        "indeferidos": dados_status.get('INDEFERIDO', 0)
    }), 200

# --- ROTA 9: LISTAR USUÁRIOS (Para o Gestor) ---
@solicitacoes_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    db = Db()
    # Trazemos o nome do papel para ficar bonito na tela
    sql = """
        SELECT codUsuarioCPF, nomUsuario, desEmail, idtPapel, idtAtivo 
        FROM Usuario 
        ORDER BY nomUsuario
    """
    resultados = db.execSql(sql, mode=Mode.SELECT)
    if resultados is None: return jsonify([]), 200
    
    lista = []
    for row in resultados:
        papel = "Cidadão"
        if row[3] == 'A': papel = "Analista"
        elif row[3] == 'G': papel = "Gestor"
        elif row[3] == 'F': papel = "Funcionário"
        
        lista.append({
            "cpf": row[0].strip(),
            "nome": row[1],
            "email": row[2],
            "papel": row[3], # A, G, C...
            "papel_nome": papel,
            "ativo": row[4]
        })
    return jsonify(lista), 200

# --- ROTA 10: CADASTRAR/EDITAR USUÁRIO ---
@solicitacoes_bp.route('/usuarios', methods=['POST'])
def salvar_usuario():
    dados = request.json
    db = Db()
    
    cpf = dados.get('cpf')
    nome = dados.get('nome')
    email = dados.get('email')
    papel = dados.get('papel') 
    
    if not cpf or not nome or not papel:
        return jsonify({"tipo": "ERRO", "mensagem": "CPF, Nome e Papel são obrigatórios."}), 400

    # Verifica se já existe
    sql_check = "SELECT count(*) FROM Usuario WHERE codUsuarioCPF = %s"
    res = db.execSql(sql_check, (cpf,), mode=Mode.SELECT)
    
    if res[0][0] > 0:
        # UPDATE (Se já existe, atualiza dados, mas NÃO mexe na senha)
        sql = "UPDATE Usuario SET nomUsuario=%s, desEmail=%s, idtPapel=%s WHERE codUsuarioCPF=%s"
        params = (nome, email, papel, cpf)
    else:
        # INSERT (Novo usuário SEM SENHA)
        # Passamos None no lugar da senha para ficar NULL no banco
        sql = "INSERT INTO Usuario (codUsuarioCPF, nomUsuario, desEmail, idtPapel, idtAtivo, desSenha) VALUES (%s, %s, %s, %s, true, %s)"
        params = (cpf, nome, email, papel, None)
    
    try:
        db.execSql(sql, params, mode=Mode.DEFAULT)
        return jsonify({"tipo": "SUCESSO", "mensagem": "Usuário salvo com sucesso!"}), 200
    except Exception as e:
        return jsonify({"tipo": "ERRO", "mensagem": str(e)}), 500