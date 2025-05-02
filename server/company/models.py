from django.db import models
import uuid
from core.storage import MediaStorage


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    primary_color = models.CharField(max_length=7, default="#3B82F6")  # Hex color
    secondary_color = models.CharField(max_length=7, default="#10B981")  # Hex color
    logo = models.ImageField(storage=MediaStorage(), upload_to="company_logos/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
