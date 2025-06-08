from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from services import bula_service
from typing import Optional     

router = APIRouter()

@router.post("/bula")
async def criar_bula(
    nome: str = Form(...),
    descricao: str = Form(...),
    efeitos_colaterais: Optional[str] = Form(""),
    controlado: bool = Form(False),
    intervalo_uso: str = Form(...),
    imagem: Optional[UploadFile] = File(None)
): 
    dados = {
        "nome": nome,
        "descricao": descricao,
        "efeitos_colaterais": [e.strip() for e in efeitos_colaterais.split(",") if e.strip()],
        "controlado": controlado,
        "intervalo_uso": intervalo_uso
    }
    return await bula_service.criar_bula_service(dados, imagem)


@router.get("/bula/{bula_id}")
def buscar_bula(bula_id: int):
    bula = bula_service.buscar_bula_service(bula_id)
    if bula:
        return bula
    raise HTTPException(status_code=404, detail="Bula não encontrada")

@router.get("/bulas")
def listar_bulas():
    return bula_service.listar_bulas_service()

@router.put("/bula/{bula_id}")
async def editar_bula(
    bula_id: int,
    nome: str = Form(...),
    descricao: str = Form(...),
    efeitos_colaterais: Optional[str] = Form(""),
    controlado: bool = Form(False),
    intervalo_uso: str = Form(...),
    imagem: Optional[UploadFile] = File(None)
):
    dados = {
        "nome": nome,
        "descricao": descricao,
        "efeitos_colaterais": [e.strip() for e in efeitos_colaterais.split(",") if e.strip()],
        "controlado": controlado,
        "intervalo_uso": intervalo_uso
    }
    return await bula_service.editar_bula_service(bula_id, dados, imagem)

@router.delete("/bula/{bula_id}")
def deletar_bula(bula_id: int):
    return bula_service.deletar_bula_service(bula_id)
