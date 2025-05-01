from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from web_auth.router import router as web_auth_router
from .routes_handler.health_handler import router as health_router


api = NinjaAPI()

api.add_router("auth", web_auth_router)

api.add_router("health", health_router)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("rest/", api.urls),
]
