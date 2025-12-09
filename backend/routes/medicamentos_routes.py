from flask import Blueprint, request, jsonify
import os
import psycopg2
import psycopg2.extras

def get_conn():
    dsn = os.environ.get("DATABASE_URL", "postgresql://postgres:senha@localhost:5432/seubanco")
    return psycopg2.connect(dsn)

medicamentos_bp = Blueprint("medicamentos_bp", __name__)

@medicamentos_bp.route("/medicamentos", methods=["GET"])
def listar_medicamentos():
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT codMedicamento, nomMedicamento FROM medicamentos ORDER BY codMedicamento")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"mensagem": [str(e)]}), 500

@medicamentos_bp.route("/medicamentos", methods=["POST"])
def criar_medicamento():
    try:
        data = request.get_json() or {}
        nome = data.get("nomMedicamento") or data.get("nomCargo")
        if not nome or str(nome).strip() == "":
            return jsonify({"mensagem": ["nomMedicamento é obrigatório"]}), 400
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("INSERT INTO medicamentos (nomMedicamento) VALUES (%s) RETURNING codMedicamento, nomMedicamento", (nome,))
        inserted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"tipo":"SUCESSO","mensagem":["Medicamento criado"], "item":{"codMedicamento": inserted[0], "nomMedicamento": inserted[1]}}), 201
    except Exception as e:
        return jsonify({"mensagem":[str(e)]}), 500

@medicamentos_bp.route("/medicamentos", methods=["PUT"])
def atualizar_medicamento():
    try:
        data = request.get_json() or {}
        cod = data.get("codMedicamento") or data.get("codCargo")
        nome = data.get("nomMedicamento") or data.get("nomCargo")
        if not cod or not nome:
            return jsonify({"mensagem":["codMedicamento e nomMedicamento são obrigatórios"]}), 400
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("UPDATE medicamentos SET nomMedicamento = %s WHERE codMedicamento = %s RETURNING codMedicamento", (nome, cod))
        updated = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if not updated:
            return jsonify({"mensagem":["Não encontrado"]}), 404
        return jsonify({"tipo":"SUCESSO","mensagem":["Medicamento atualizado"]}), 200
    except Exception as e:
        return jsonify({"mensagem":[str(e)]}), 500

@medicamentos_bp.route("/medicamentos/<int:cod>", methods=["DELETE"])
def excluir_medicamento(cod):
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM medicamentos WHERE codMedicamento = %s RETURNING codMedicamento", (cod,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if not deleted:
            return jsonify({"mensagem":["Não encontrado"]}), 404
        return jsonify({"tipo":"SUCESSO","mensagem":["Medicamento excluído"]}), 200
    except Exception as e:
        return jsonify({"mensagem":[str(e)]}), 500