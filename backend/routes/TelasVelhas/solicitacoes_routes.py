# routes/solicitacoes_routes.py
from flask import Blueprint, request, jsonify
from db import Db, Mode

solicitacoes_bp = Blueprint('solicitacoes_bp', __name__)

@solicitacoes_bp.route('/medicamentos', methods=['GET'])
def obter_medicamentos():
    db = Db()
    # Busca apenas medicamentos ativos para o cidadão escolher
    sql = "SELECT idMedicamento, nomMedicamento, desDosagem FROM Medicamento WHERE idtAtivo = true ORDER BY nomMedicamento"
    
    resultados = db.execSql(sql, mode=Mode.SELECT)
    
    if resultados is None:
        return jsonify([]), 200
        
    # Formata o retorno para JSON bonitinho
    lista_medicamentos = []
    for row in resultados:
        lista_medicamentos.append({
            "id": row[0],
            "nome": row[1],
            "dosagem": row[2]
        })
        
    return jsonify(lista_medicamentos), 200

# Adicione isso em backend/routes/solicitacoes_routes.py

@solicitacoes_bp.route('/listar_solicitacoes', methods=['GET'])
def listar_solicitacoes():
    db = Db()
    # Faz um JOIN para trazer o nome do Cidadão e do Medicamento em vez de só os IDs
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
    
    if resultados is None:
        return jsonify([]), 200
        
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

@solicitacoes_bp.route('/solicitacoes', methods=['POST'])
def criar_solicitacao():
    dados = request.json
    db = Db()
    
    cpf = dados.get('codUsuarioCPF')
    id_med = dados.get('idMedicamento')
    obs = dados.get('observacao', '')

    # Validação básica
    if not cpf or not id_med:
        return jsonify({"tipo": "ERRO", "mensagem": "CPF e Medicamento são obrigatórios."}), 400

    # 1. Inserir a Solicitação
    sql_solicitacao = """
        INSERT INTO Solicitacao (codUsuarioCPF, idMedicamento, txtObservacao, desStatus)
        VALUES (%s, %s, %s, 'EM ANALISE')
        RETURNING idSolicitacao
    """
    
    # Usamos atuIdInsert=True para pegar o ID gerado (implementado na sua classe Db)
    try:
        # Nota: Sua classe Db retorna tuple/list no SELECT. 
        # Vamos adaptar para usar o modo COMMIT mas precisamos do ID.
        # Estratégia: Usar Mode.SELECT com RETURNING para garantir que pegamos o ID.
        
        res = db.execSql(sql_solicitacao, (cpf, id_med, obs), mode=Mode.SELECT)
        
        if not res:
             return jsonify({"tipo": "ERRO", "mensagem": "Erro ao inserir solicitação"}), 500
             
        id_gerado = res[0][0] # Pega o ID do retorno
        
        # Opcional: Aqui você inseriria os documentos na tabela DocumentoSolicitacao
        # Para o MVP, vamos apenas confirmar o sucesso.
        
        return jsonify({
            "tipo": "SUCESSO", 
            "mensagem": "Solicitação realizada com sucesso!",
            "protocolo": id_gerado
        }), 201

    except Exception as e:
        return jsonify({"tipo": "ERRO", "mensagem": str(e)}), 500