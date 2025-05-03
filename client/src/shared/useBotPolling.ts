import { Bot } from "./services/api";
import { getBotStatus } from "./services/api";
import { useEffect, useState } from "react";

interface PollingResponse {
  bot: Bot;
  pollings: {
    id: number;
    status: string;
    completed: boolean;
    error: string | null;
    success: boolean | null;
    created_at: string;
    updated_at: string;
  }[];
}

const POLLING_INTERVAL = 3000;

const useBotPolling = (botId: string) => {
  const [status, setStatus] = useState<PollingResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const startPolling = async () => {
      try {
        setIsPolling(true);
        while (isMounted) {
          const response = await getBotStatus(botId);
          
          // Check if we should stop polling
          const hasTerminalStatus = response.pollings.some(polling => 
            ["ready", "completed", "error"].includes(polling.status.toLowerCase())
          );

          if (hasTerminalStatus) {
            if (isMounted) {
              setStatus(response);
            }
            break;
          }

          if (isMounted) {
            setStatus(response);
          }

          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        }
      } catch (error) {
        console.error("Error polling bot status:", error);
      } finally {
        if (isMounted) {
          setIsPolling(false);
        }
      }
    };

    if (botId) {
      startPolling();
    } else {
      // Clear status when no bot is selected
      setStatus(null);
      setIsPolling(false);
    }

    return () => {
      isMounted = false;
    };
  }, [botId]);

  const isReady = status?.pollings.some(polling => ['ready', 'completed'].includes(polling.status.toLowerCase()));
  const error = status?.pollings.find(polling => polling.status.toLowerCase() === "error")?.error;
  const isError = !!error;

  return {
    status,
    isPolling,
    isReady,
    isError,
    error,
  };
};

export default useBotPolling;