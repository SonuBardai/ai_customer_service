from django.urls import path
from . import views

urlpatterns = [
    path("company/", views.get_company, name="get_company"),
    # ... existing URL patterns ...
]
