from flask import Blueprint, request, jsonify
import os
import urllib.parse
import traceback
import sys
import psycopg2
import psycopg2.extras

solicitacoes_bp = Blueprint("solicitacoes_bp", __name__)

def _ensure_str(v: any) -> str:
    if isinstance(v, str):
        return v
    if isinstance(v, bytes):
        try:
            return v.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return v.decode("latin-1")
            except Exception:
                return v.decode("utf-8", errors="replace")
    return str(v)

def get_conn():
    """
    Conexão robusta a partir de DATABASE_URL.
    Se algo falhar, tenta conectar ao DSN padrão e registra o DSN problemático.
    """
    raw = os.environ.get("DATABASE_URL")
    if raw is None:
        dsn = "postgresql://postgres:senha@localhost:5432/seubanco"
    else:
        dsn = _ensure_str(raw)

    # para debug: log minimal do DSN (sem senha) se der erro
    try:
        parsed = urllib.parse.urlparse(dsn)
    except Exception:
        parsed = None

    try:
        if parsed and parsed.scheme and parsed.scheme.startswith("postgres"):
            user = _ensure_str(parsed.username) if parsed.username else None
            password = _ensure_str(parsed.password) if parsed.password else None
            host = _ensure_str(parsed.hostname) if parsed.hostname else None
            port = parsed.port
            dbname = _ensure_str(parsed.path.lstrip("/")) if parsed.path else None

            conn_kwargs = {}
            if dbname: conn_kwargs["dbname"] = dbname
            if user: conn_kwargs["user"] = user
            if password: conn_kwargs["password"] = password
            if host: conn_kwargs["host"] = host
            if port: conn_kwargs["port"] = port

            conn = psycopg2.connect(**conn_kwargs)
        else:
            conn = psycopg2.connect(dsn)

        try:
            conn.set_client_encoding("UTF8")
        except Exception:
            pass
        return conn

    except Exception as e:
        # Log DSN safe representation (remove password) e stacktrace
        try:
            safe_dsn = dsn
            if parsed and parsed.password:
                safe_dsn = dsn.replace(parsed.password, "****")
        except Exception:
            safe_dsn = repr(dsn)[:200]
        print("Failed to connect using DSN:", safe_dsn, file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

        # fallback: tenta conectar usando DSN padrão simples
        try:
            fallback = "postgresql://postgres:senha@localhost:5432/seubanco"
            conn = psycopg2.connect(_ensure_str(fallback))
            try:
                conn.set_client_encoding("UTF8")
            except Exception:
                pass
            return conn
        except Exception:
            # re-raise o erro original para que o Flask mostre stacktrace
            raise e

@solicitacoes_bp.route("/solicitacoes", methods=["POST"])
def criar_solicitacao():
    try:
        data = request.get_json(force=True)
        if not isinstance(data, dict):
            return jsonify({"mensagem":["Payload JSON inválido"]}), 400

        nom = (data.get("nomCargo") or data.get("nomMedicamento") or "").strip()
        cod = data.get("codCargo") or data.get("codMedicamento")
        quantidade_raw = data.get("quantidade", 1)
        comentario = data.get("comentario")
        cpf = data.get("cpfSolicitante")

        # validações
        if nom == "":
            return jsonify({"mensagem":["nomCargo (nome do medicamento) é obrigatório"]}), 400
        try:
            quantidade = int(quantidade_raw)
            if quantidade <= 0:
                raise ValueError()
        except Exception:
            return jsonify({"mensagem":["quantidade inválida. Deve ser inteiro > 0"]}), 400

        conn = get_conn()
        try:
            # garante client encoding UTF8
            try:
                conn.set_client_encoding("UTF8")
            except Exception:
                pass

            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(
                """INSERT INTO solicitacoes (codCargo, nomCargo, quantidade, comentario, cpfSolicitante)
                   VALUES (%s, %s, %s, %s, %s)
                   RETURNING id, status, dataCriacao""",
                (cod, nom, quantidade, comentario, cpf)
            )
            inserted = cur.fetchone()
            conn.commit()
            cur.close()
            return jsonify({"tipo":"SUCESSO", "mensagem":["Solicitação criada"], "item": inserted}), 201
        finally:
            try:
                conn.close()
            except Exception:
                pass

    except psycopg2.Error as db_err:
        # erro específico do banco
        traceback.print_exc(file=sys.stderr)
        return jsonify({"mensagem":[str(db_err)]}), 500
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        # devolve mensagem curta mas log completa no servidor
        return jsonify({"mensagem":[str(e)]}), 500

@solicitacoes_bp.route("/solicitacoes", methods=["GET"])
def listar_solicitacoes():
    cpf = request.args.get("cpf")
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if cpf:
            cur.execute("""SELECT id, codCargo, nomCargo, quantidade, comentario, status, dataCriacao, cpfSolicitante
                           FROM solicitacoes WHERE cpfSolicitante = %s ORDER BY id DESC""", (cpf,))
        else:
            cur.execute("""SELECT id, codCargo, nomCargo, quantidade, comentario, status, dataCriacao, cpfSolicitante
                           FROM solicitacoes ORDER BY id DESC""")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"mensagem":[str(e)]}), 500

@solicitacoes_bp.route("/solicitacoes/<int:id>", methods=["GET"])
def obter_solicitacao(id):
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""SELECT id, codCargo, nomCargo, quantidade, comentario, status, dataCriacao, cpfSolicitante
                       FROM solicitacoes WHERE id = %s""", (id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return jsonify({"mensagem":["Não encontrado"]}), 404
        return jsonify(row), 200
    except Exception as e:
        return jsonify({"mensagem":[str(e)]}), 500

@solicitacoes_bp.route("/solicitacoes/<int:id>/status", methods=["PUT"])
def atualizar_status_solicitacao(id):
    """
    Atualiza apenas o status da solicitação.
    Body esperado (JSON): { "status": "APROVADO" } (ou "REJEITADO", "PENDENTE", etc.)
    Retorna 200 com item atualizado ou 404 se não existir.
    """
    try:
        data = request.get_json() or {}
        novo_status = data.get("status")
        if not novo_status or not isinstance(novo_status, str) or novo_status.strip() == "":
            return jsonify({"mensagem": ["O campo 'status' é obrigatório."]}), 400

        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "UPDATE solicitacoes SET status = %s WHERE id = %s RETURNING id, status, dataCriacao, cpfSolicitante",
            (novo_status.strip().upper(), id)
        )
        atualizado = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not atualizado:
            return jsonify({"mensagem": ["Solicitação não encontrada."]}), 404

        return jsonify({
            "tipo": "SUCESSO",
            "mensagem": ["Status da solicitação atualizado."],
            "item": atualizado
        }), 200
    except Exception as e:
        return jsonify({"mensagem": [str(e)]}), 500

@solicitacoes_bp.route("/solicitacoes/<int:id>", methods=["PUT"])
def atualizar_solicitacao(id):
    """
    Atualiza campos da solicitação: status, quantidade e/ou comentario.
    Body aceito (JSON) exemplo:
      { "status": "APROVADO", "quantidade": 3, "comentario": "Alterar qtd" }
    Retorna 200 com o item atualizado ou 404/400 em caso de erro.
    """
    try:
        data = request.get_json() or {}
        campos = []
        params = []

        if "status" in data:
            novo_status = (data.get("status") or "").strip()
            if novo_status == "":
                return jsonify({"mensagem": ["Campo 'status' vazio."]}), 400
            campos.append("status = %s")
            params.append(novo_status.upper())

        if "quantidade" in data:
            try:
                q = int(data.get("quantidade"))
                if q <= 0:
                    return jsonify({"mensagem": ["'quantidade' deve ser maior que zero."]}), 400
            except Exception:
                return jsonify({"mensagem": ["'quantidade' inválida."]}), 400
            campos.append("quantidade = %s")
            params.append(q)

        if "comentario" in data:
            comentario = data.get("comentario")
            # permite comentário vazio (limpar) — se quiser proibir, valide aqui
            campos.append("comentario = %s")
            params.append(comentario)

        if not campos:
            return jsonify({"mensagem": ["Nenhum campo para atualizar foi fornecido."]}), 400

        # montar e executar update
        sql = f"UPDATE solicitacoes SET {', '.join(campos)} WHERE id = %s RETURNING id, codCargo, nomCargo, quantidade, comentario, status, dataCriacao, cpfSolicitante"
        params.append(id)

        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, tuple(params))
        atualizado = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not atualizado:
            return jsonify({"mensagem": ["Solicitação não encontrada."]}), 404

        return jsonify({"tipo": "SUCESSO", "mensagem": ["Solicitação atualizada."], "item": atualizado}), 200
    except Exception as e:
        return jsonify({"mensagem": [str(e)]}), 500