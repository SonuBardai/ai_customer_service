from ninja import Router, Schema
from typing import List, Optional
from ..models import Bot, KnowledgeItem
from company.models import Company

router = Router()


class KnowledgeItemSchema(Schema):
    type: str
    content: str


class BotCreateSchema(Schema):
    company_id: str
    name: Optional[str] = None
    tone: Optional[str] = "professional"
    knowledge_items: Optional[List[KnowledgeItemSchema]] = []


@router.post("/bot", response={201: dict})
def create_bot(request, data: BotCreateSchema):
    try:
        company = Company.objects.first()  # TODO: REMOVE LATER
        # company = request.user.company
    except Company.DoesNotExist:
        return 404, {"error": "Company not found"}

    # If no name provided, use company name + " Bot"
    bot_name = data.name or f"{company.name} Bot"

    bot = Bot.objects.create(company=company, name=bot_name, tone=data.tone)

    # Create knowledge items if provided
    knowledge_items = []
    for item in data.knowledge_items:
        knowledge_item = KnowledgeItem.objects.create(bot=bot, type=item.type, content=item.content)
        knowledge_items.append({"id": str(knowledge_item.id), "type": knowledge_item.type, "content": knowledge_item.content})

    return 201, {"id": str(bot.id), "name": bot.name, "tone": bot.tone, "company": {"id": str(company.id), "name": company.name}, "knowledge_items": knowledge_items}
