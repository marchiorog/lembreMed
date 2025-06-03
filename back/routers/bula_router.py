from fastapi import APIRouter, Body , Request, HTTPException
from services import bula_service

router = APIRouter()

@router.post("/bula")
async def criar_bula(dados: dict = Body(...)):
    return bula_service.criar_bula_service(dados)

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
async def editar_bula(bula_id: int, dados: dict = Body(...)):
    return bula_service.editar_bula_service(bula_id, dados)

@router.delete("/bula/{bula_id}")
def deletar_bula(bula_id: int):
    return bula_service.deletar_bula_service(bula_id)
