from ninja import Router

router = Router()


@router.get("/auth/login")
def login(request, a: int, b: int):
    return {"result": a + b}


@router.get("/auth/signup")
def signup(request, a: int, b: int):
    return {"result": a + b}
