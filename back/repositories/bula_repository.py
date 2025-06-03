from database import get_connection

def criar_bula(nome, descricao, efeitos, controlado, intervalo_uso):
    con = get_connection()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO bulas (nome, descricao, efeitos_colaterais, controlado, intervalo_uso) VALUES (?, ?, ?, ?, ?)",
        (nome, descricao, ",".join(efeitos), int(controlado), intervalo_uso))
    con.commit()
    con.close()

def buscar_bula(bula_id):
    con = get_connection()
    cur = con.cursor()
    cur.execute("SELECT * FROM bulas WHERE id = ?", (bula_id,))
    row = cur.fetchone()
    con.close()
    return row

def listar_bulas():
    con = get_connection()
    cur = con.cursor()
    cur.execute("SELECT * FROM bulas")
    rows = cur.fetchall()
    con.close()
    return rows

def editar_bula(bula_id, nome, descricao, efeitos, controlado, intervalo_uso):
    con = get_connection()
    cur = con.cursor()
    cur.execute(
        "UPDATE bulas SET nome = ?, descricao = ?, efeitos_colaterais = ?, controlado = ?, intervalo_uso = ? WHERE id = ?",
        (nome, descricao, ",".join(efeitos), int(controlado), intervalo_uso, bula_id))
    con.commit()
    con.close()

def deletar_bula(bula_id):
    con = get_connection()
    cur = con.cursor()
    cur.execute("DELETE FROM bulas WHERE id = ?", (bula_id,))
    con.commit()
    con.close()
