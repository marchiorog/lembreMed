from repositories import bula_repository

def criar_bula_service(dados):
    bula_repository.criar_bula(
        nome=dados["nome"],
        descricao=dados["descricao"],
        efeitos=dados.get("efeitos_colaterais", []),
        controlado=dados.get("controlado", False),
        intervalo_uso=dados["intervalo_uso"]
    )
    return {"mensagem": "Bula criada com sucesso"}

def buscar_bula_service(bula_id):
    row = bula_repository.buscar_bula(bula_id)
    if row:
        return {
            "id": row["id"],
            "nome": row["nome"],
            "descricao": row["descricao"],
            "efeitos_colaterais": row["efeitos_colaterais"].split(","),
            "controlado": bool(row["controlado"]),
            "intervalo_uso": row["intervalo_uso"]
        }
    return None

def listar_bulas_service():
    rows = bula_repository.listar_bulas()
    return [
        {
            "id": row["id"],
            "nome": row["nome"],
            "descricao": row["descricao"],
            "efeitos_colaterais": row["efeitos_colaterais"].split(","),
            "controlado": bool(row["controlado"]),
            "intervalo_uso": row["intervalo_uso"]
        }
        for row in rows
    ]

def editar_bula_service(bula_id, dados):
    bula_repository.editar_bula(
        bula_id,
        nome=dados["nome"],
        descricao=dados["descricao"],
        efeitos=dados.get("efeitos_colaterais", []),
        controlado=dados.get("controlado", False),
        intervalo_uso=dados["intervalo_uso"]
    )
    return {"mensagem": "Bula atualizada com sucesso"}

def deletar_bula_service(bula_id):
    bula_repository.deletar_bula(bula_id)
    return {"mensagem": "Bula deletada com sucesso"}
