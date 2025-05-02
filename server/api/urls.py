from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from .routes_handler.health_handler import router as health_router
from company.routes_handler.company_handler import router as company_router
from bot.routes_handler.bot_handler import router as bot_router
from web_auth.routes_handler.auth_handler import router as web_auth_router


api = NinjaAPI(csrf=False)

api.add_router("", web_auth_router)
api.add_router("", health_router)
api.add_router("", company_router)
api.add_router("", bot_router)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("rest/v1/", api.urls),
]
