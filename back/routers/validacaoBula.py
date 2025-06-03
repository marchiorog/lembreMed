from fastapi import HTTPException

def validar_dados_bula(dados: dict):
    if not isinstance(dados, dict):
        raise HTTPException(status_code=400, detail="Corpo da requisição deve ser um objeto JSON")

    if "nome" not in dados or not isinstance(dados["nome"], str):
        raise HTTPException(status_code=422, detail="Campo 'nome' é obrigatório e deve ser uma string")

    if "descricao" not in dados or not isinstance(dados["descricao"], str):
        raise HTTPException(status_code=422, detail="Campo 'descricao' é obrigatório e deve ser uma string")

    if "efeitos_colaterais" in dados:
        if not isinstance(dados["efeitos_colaterais"], list) or not all(isinstance(e, str) for e in dados["efeitos_colaterais"]):
            raise HTTPException(status_code=422, detail="Campo 'efeitos_colaterais' deve ser uma lista de strings")

    if "controlado" in dados and not isinstance(dados["controlado"], bool):
        raise HTTPException(status_code=422, detail="Campo 'controlado' deve ser um booleano (true ou false)")
