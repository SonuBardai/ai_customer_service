from bot.models import Bot, Polling
from threading import Thread
import time
import random


def simulate_training(bot: Bot):
    try:
        # Create initial training polling item
        Polling.objects.create(bot=bot, status="training", completed=False, error=None, success=None)
        print(f"Created training polling item for bot {bot.id}")

        # Simulate training process
        time.sleep(random.randint(3, 5))  # Random time between 3-5 seconds

        # Create ready polling item
        Polling.objects.create(bot=bot, status="ready", completed=True, error=None, success=True)
        print(f"Created ready polling item for bot {bot.id}")

    except Exception as e:
        print(f"Error in training simulation: {str(e)}")


def create_embeddings(bot: Bot):
    # TODO: use celery later
    Polling.objects.create(bot=bot, status="started", completed=False, error=None, success=None)
    thread = Thread(target=simulate_training, args=(bot,))
    thread.daemon = True
    thread.start()
    return True
