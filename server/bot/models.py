from django.db import models
import uuid
from company.models import Company


class Bot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="bots")
    name = models.CharField(max_length=255)
    tone = models.CharField(max_length=20, choices=[("professional", "Professional"), ("friendly", "Friendly"), ("casual", "Casual"), ("technical", "Technical")], default="professional")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.company.name})"


class KnowledgeItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bot = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name="knowledge_items")
    type = models.CharField(max_length=10, choices=[("url", "URL"), ("file", "File"), ("text", "Text")])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.content[:50]}..."
