from ninja import Router
from ninja.schema import Schema
from typing import Optional
from django.http import HttpRequest

from ..models import Company

router = Router()


class CompanyCreateSchema(Schema):
    name: str
    primary_color: Optional[str] = "#3B82F6"
    secondary_color: Optional[str] = "#10B981"


class CompanyResponseSchema(Schema):
    id: str
    name: str
    primary_color: str
    secondary_color: str
    logo_url: Optional[str] = None


@router.get(
    "/company",
    response=CompanyResponseSchema,
    # auth=django_auth,
)
def get_company(request):
    company = Company.objects.first()

    # TODO: uncomment later
    # if not request.user.is_authenticated:
    #     return 403, {"detail": "Authentication required"}
    company = request.company

    return {
        "id": str(company.id),
        "name": company.name,
        "primary_color": company.primary_color,
        "secondary_color": company.secondary_color,
        "logo_url": company.logo.url if company.logo else None,
    }


@router.post("/company", response={201: CompanyResponseSchema, 403: dict, 400: dict})
def create_company(request: HttpRequest):
    # if not request.user.is_authenticated:
    #     return 403, {"detail": "Authentication required"}

    # Get form data
    name = request.POST.get("name")
    primary_color = request.POST.get("primary_color", "#3B82F6")
    secondary_color = request.POST.get("secondary_color", "#10B981")
    logo = request.FILES.get("logo")

    if not name:
        return 400, {"detail": "Name is required"}

    company = request.company
    company.name = name
    company.primary_color = primary_color
    company.secondary_color = secondary_color

    if logo:
        company.logo = logo

    company.save()

    return 201, {
        "id": str(company.id),
        "name": company.name,
        "primary_color": company.primary_color,
        "secondary_color": company.secondary_color,
        "logo_url": company.logo.url if company.logo else None,
    }


@router.delete("/company", response={204: None})
def delete_company(request):
    if not request.user.is_authenticated:
        return 403, {"detail": "Authentication required"}

    company = request.company
    company.delete()
    return 204, None
