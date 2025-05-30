from django.db import models
import uuid
from company.models import Company
from django.utils import timezone


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


class Polling(models.Model):
    STATUS_CHOICES = [
        ("started", "Started"),
        ("training", "Training"),
        ("ready", "Ready"),
        ("error", "Error"),
    ]

    bot = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name="pollings")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    completed = models.BooleanField(default=False)
    error = models.TextField(null=True, blank=True)
    success = models.BooleanField(null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Polling {self.id} - {self.status} for Bot {self.bot_id}"


class WhitelistedDomain(models.Model):
    bot = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name='whitelisted_domains')
    domain = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('bot', 'domain')

    def __str__(self):
        return f"{self.domain} (Bot: {self.bot.name})"
