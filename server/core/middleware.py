from django.shortcuts import get_object_or_404
from web_auth.models import User
from company.models import Company

class CompanyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.company = Company.objects.first() # TODO: REMOVE LATER
        # if hasattr(request, 'user') and request.user.is_authenticated:
        #     request.company = get_object_or_404(Company, users=request.user)
        return self.get_response(request)
