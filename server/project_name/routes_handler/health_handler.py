from ninja import Router

router = Router()


@router.get("/live")
def health(request):
    return {"status": "ok"}
