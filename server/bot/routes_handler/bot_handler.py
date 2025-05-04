from ninja import Router, Schema
from typing import List, Optional
from ..models import Bot, KnowledgeItem
from company.models import Company
from ..tasks.embeddings import create_embeddings
from ..models import WhitelistedDomain

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
    whitelisted_domains: List[str]


class BotStatusSchema(Schema):
    bot: dict
    pollings: List[dict]


class WhitelistedDomainSchema(Schema):
    domains: List[str]


@router.post("/bot", response={201: dict})
def create_bot(request, data: BotCreateSchema):
    try:
        company = request.company
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

    # Set off async task to create embeddings
    create_embeddings(bot=bot)

    return 201, {"id": str(bot.id), "name": bot.name, "tone": bot.tone, "company": {"id": str(company.id), "name": company.name}, "knowledge_items": knowledge_items}


@router.get("/bots", response={200: List[BotResponseSchema]})
def list_bots(request):
    try:
        company = request.company
    except Company.DoesNotExist:
        return 404, {"error": "Company not found"}

    bots = Bot.objects.filter(company=company)
    response = []

    for bot in bots:
        knowledge_items = [{"id": str(item.id), "type": item.type, "content": item.content} for item in bot.knowledge_items.all()]
        whitelisted_domains = [str(domain.domain) for domain in bot.whitelisted_domains.all()]

        response.append(
            {
                "id": str(bot.id),
                "name": bot.name,
                "tone": bot.tone,
                "company": {"id": str(company.id), "name": company.name},
                "knowledge_items": knowledge_items,
                "whitelisted_domains": whitelisted_domains,
            }
        )

    return 200, response


@router.get("/bot/{bot_id}/status", response={200: BotStatusSchema})
def get_bot_status(request, bot_id: str):
    try:
        bot = Bot.objects.get(id=bot_id)
        polling_items = list(
            bot.pollings.values(
                "id",
                "status",
                "completed",
                "error",
                "success",
                "created_at",
                "updated_at",
            ).order_by("created_at")
        )
        if not polling_items:
            # task hasn't started yet or it failed, restart it
            create_embeddings(bot)
        return 200, {
            "bot": {
                "id": bot.id,
                "name": bot.name,
                "tone": bot.tone,
                "company": {"id": str(bot.company.id), "name": bot.company.name},
                "created_at": bot.created_at.isoformat(),
                "updated_at": bot.updated_at.isoformat(),
            },
            "pollings": polling_items,
        }
    except Bot.DoesNotExist:
        return 404, {"error": "Bot not found"}


@router.post("/bot/{bot_id}/domains", response={200: dict})
def update_whitelisted_domains(request, bot_id: str, domains: WhitelistedDomainSchema):
    try:
        company = request.company
        bot = Bot.objects.get(id=bot_id, company=company)

        # Clear existing domains
        WhitelistedDomain.objects.filter(bot=bot).delete()

        # Create new domains
        domain_objects = []
        for domain in domains.domains:
            if domain.strip():  # Only create for non-empty domains
                domain_objects.append(WhitelistedDomain(bot=bot, domain=domain.strip()))
        WhitelistedDomain.objects.bulk_create(domain_objects)

        return 200, {"message": "Domains updated successfully", "domains": domains.domains}
    except Bot.DoesNotExist:
        return 404, {"error": "Bot not found"}
    except Exception as e:
        return 500, {"error": str(e)}


@router.get("/bot/{bot_id}", response={200: BotResponseSchema})
def get_bot(request, bot_id: str):
    try:
        company = request.company

        bot = Bot.objects.get(id=bot_id, company=company)
        knowledge_items = [{"id": str(item.id), "type": item.type, "content": item.content} for item in bot.knowledge_items.all()]
        whitelisted_domains = [str(domain.domain) for domain in bot.whitelisted_domains.all()]

        return 200, {
            "id": str(bot.id),
            "name": bot.name,
            "tone": bot.tone,
            "company": {"id": str(bot.company.id), "name": bot.company.name},
            "knowledge_items": knowledge_items,
            "whitelisted_domains": whitelisted_domains,
        }
    except Bot.DoesNotExist:
        return 404, {"error": "Bot not found"}
