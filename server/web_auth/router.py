from ninja import Router

router = Router()


@router.get("/login")
def login(request, a: int, b: int):
    return {"result": a + b}


@router.get("/signup")
def signup(request, a: int, b: int):
    return {"result": a + b}
