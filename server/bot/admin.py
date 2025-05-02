from django.contrib import admin
from .models import Bot, KnowledgeItem


@admin.register(Bot)
class BotAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "tone", "created_at", "updated_at")
    list_filter = ("tone", "company", "created_at", "updated_at")
    search_fields = ("name", "company__name")


@admin.register(KnowledgeItem)
class KnowledgeItemAdmin(admin.ModelAdmin):
    list_display = ("bot", "type", "content_preview", "created_at", "updated_at")
    list_filter = ("type", "bot__company", "created_at", "updated_at")
    search_fields = ("content", "bot__name")

    def content_preview(self, obj):
        return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content

    content_preview.short_description = "Content"
