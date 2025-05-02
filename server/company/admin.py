from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "primary_color", "secondary_color", "created_at", "updated_at")
    search_fields = ("name",)
    list_filter = ("created_at", "updated_at")
