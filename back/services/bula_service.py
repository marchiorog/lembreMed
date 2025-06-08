from repositories import bula_repository
import os
import base64


async def criar_bula_service(dados, imagem_file):
    bula_id = bula_repository.criar_bula(
        nome=dados["nome"],
        descricao=dados["descricao"],
        efeitos=dados.get("efeitos_colaterais", []),
        controlado=dados.get("controlado", False),
        intervalo_uso=dados["intervalo_uso"]
    )
    if imagem_file:
        extensao = imagem_file.filename.split(".")[-1].lower()
        caminho = f"imagens/bulas/{bula_id}.{extensao}"
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, "wb") as out_file:
            out_file.write(await imagem_file.read())

    return {"mensagem": "Bula criada com sucesso", "id": bula_id}

def buscar_bula_service(bula_id):
    row = bula_repository.buscar_bula(bula_id)
    if not row:
        return None

    imagem_base64 = None
    extensoes = ['jpg', 'jpeg', 'png', 'webp']
    for ext in extensoes:
        caminho = f"imagens/bulas/{bula_id}.{ext}"
        if os.path.exists(caminho):
            with open(caminho, "rb") as imagem:
                base64_str = base64.b64encode(imagem.read()).decode("utf-8")
                imagem_base64 = f"data:image/{ext};base64,{base64_str}"
            break

    return {
        "id": row["id"],
        "nome": row["nome"],
        "descricao": row["descricao"],
        "efeitos_colaterais": row["efeitos_colaterais"].split(","),
        "controlado": bool(row["controlado"]),
        "intervalo_uso": row["intervalo_uso"],
        "imagem_base64": imagem_base64
    }

def listar_bulas_service():
    rows = bula_repository.listar_bulas()
    lista = []
    for row in rows:
        imagem_base64 = None
        bula_id = row["id"]
        extensoes = ['jpg', 'jpeg', 'png', 'webp']
        for ext in extensoes:
            caminho = f"imagens/bulas/{bula_id}.{ext}"
            if os.path.exists(caminho):
                with open(caminho, "rb") as imagem:
                    base64_str = base64.b64encode(imagem.read()).decode("utf-8")
                    imagem_base64 = f"data:image/{ext};base64,{base64_str}"
                break
        lista.append({
            "id": bula_id,
            "nome": row["nome"],
            "descricao": row["descricao"],
            "efeitos_colaterais": row["efeitos_colaterais"].split(","),
            "controlado": bool(row["controlado"]),
            "intervalo_uso": row["intervalo_uso"],
            "imagem_base64": imagem_base64
        })
    return lista

async def editar_bula_service(bula_id, dados, imagem_file):
    bula_repository.editar_bula(
        bula_id,
        nome=dados["nome"],
        descricao=dados["descricao"],
        efeitos=dados.get("efeitos_colaterais", []),
        controlado=dados.get("controlado", False),
        intervalo_uso=dados["intervalo_uso"]
    )
    if imagem_file:
        extensao = imagem_file.filename.split(".")[-1].lower()
        caminho = f"imagens/bulas/{bula_id}.{extensao}"
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, "wb") as out_file:
            out_file.write(await imagem_file.read())

    return {"mensagem": "Bula atualizada com sucesso"}


def deletar_bula_service(bula_id):
    bula_repository.deletar_bula(bula_id)
    return {"mensagem": "Bula deletada com sucesso"}
