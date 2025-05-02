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


class BotResponseSchema(Schema):
    id: str
    name: str
    tone: str
    company: dict
    knowledge_items: List[dict]


class BotStatusSchema(Schema):
    id: str
    status: str
    progress: int
    error: Optional[str]


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


@router.get("/bots", response={200: List[BotResponseSchema]})
def list_bots(request):
    try:
        company = Company.objects.first()  # TODO: REMOVE LATER
        # company = request.user.company
    except Company.DoesNotExist:
        return 404, {"error": "Company not found"}

    bots = Bot.objects.filter(company=company)
    response = []

    for bot in bots:
        knowledge_items = [{"id": str(item.id), "type": item.type, "content": item.content} for item in bot.knowledge_items.all()]

        response.append({"id": str(bot.id), "name": bot.name, "tone": bot.tone, "company": {"id": str(company.id), "name": company.name}, "knowledge_items": knowledge_items})

    return 200, response


@router.get("/bot/{bot_id}/status", response={200: BotStatusSchema})
def get_bot_status(request, bot_id: str):
    try:
        bot = Bot.objects.get(id=bot_id)
        # Dummy status - in a real implementation, this would check the actual training status
        return 200, {
            "id": str(bot.id),
            "status": "ready",  # or "training" or "error"
            "progress": 100,  # percentage complete
            "error": None,
        }
    except Bot.DoesNotExist:
        return 404, {"error": "Bot not found"}


@router.get("/bot/{bot_id}", response={200: BotResponseSchema})
def get_bot(request, bot_id: str):
    try:
        company = Company.objects.first()  # TODO: REMOVE LATER
        # company = request.user.company

        bot = Bot.objects.get(id=bot_id, company=company)
        knowledge_items = [{"id": str(item.id), "type": item.type, "content": item.content} for item in bot.knowledge_items.all()]

        return 200, {"id": str(bot.id), "name": bot.name, "tone": bot.tone, "company": {"id": str(bot.company.id), "name": bot.company.name}, "knowledge_items": knowledge_items}
    except Bot.DoesNotExist:
        return 404, {"error": "Bot not found"}
