import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, BotStatus } from "../../types";
import { listBots, getBotStatus } from "../../shared/services/api";
import toast from "react-hot-toast";
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaCopy } from "react-icons/fa";

const setSearchParams = (params: { id: string }) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  // set the search params
  window.history.pushState({}, "", `?${searchParams.toString()}`);
};

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [whitelistedDomains, setWhitelistedDomains] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);

  const selectBot = (bot: Bot) => {
    setSelectedBot(bot);
    setSearchParams({ id: bot.id });
  };

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const botsData = await listBots();
        setBots(botsData);

        // If there's a bot ID in the URL, select that bot
        const botId = searchParams.get("id");
        if (botId) {
          const bot = botsData.find((b) => b.id === botId);
          if (bot) {
            selectBot(bot);
          }
        } else if (botsData.length > 0) {
          selectBot(botsData[0]);
        }
      } catch (error) {
        console.error("Error fetching bots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [searchParams]);

  useEffect(() => {
    let intervalId: number;

    if (selectedBot && searchParams.get("id") === selectedBot.id) {
      const checkBotStatus = async () => {
        try {
          // Simulate training time
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const status = await getBotStatus(selectedBot.id);
          setBotStatus(status);

          // If bot is ready or in error state, stop polling
          if (status.status === "ready" || status.status === "error") {
            clearInterval(intervalId);
          }
        } catch (error) {
          toast.error("Error fetching bot status");
          clearInterval(intervalId);
        }
      };

      // Check status immediately and then every 5 seconds
      checkBotStatus();
      intervalId = window.setInterval(checkBotStatus, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedBot, searchParams]);

  const handleAddDomain = () => {
    setWhitelistedDomains([...whitelistedDomains, ""]);
  };

  const handleDomainChange = (index: number, value: string) => {
    const newDomains = [...whitelistedDomains];
    newDomains[index] = value;
    setWhitelistedDomains(newDomains);
  };

  const handleRemoveDomain = (index: number) => {
    const newDomains = whitelistedDomains.filter((_, i) => i !== index);
    setWhitelistedDomains(newDomains);
  };

  const handleSubmitDomains = async () => {
    try {
      // TODO: Implement API call to save whitelisted domains
      console.log("Saving domains:", whitelistedDomains);
    } catch (error) {
      console.error("Error saving domains:", error);
    }
  };

  const copyScript = () => {
    if (!selectedBot) return;

    const script = `<script src="https://your-domain.com/chatbot.js" data-bot-id="${selectedBot.id}"></script>`;
    navigator.clipboard.writeText(script);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left sidebar with bot list */}
      <div className="w-1/4 bg-base-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Your Bots</h2>
        <div className="space-y-2">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className={`p-3 rounded-lg cursor-pointer ${selectedBot?.id === bot.id ? "bg-primary text-primary-content" : "hover:bg-base-300"}`}
              onClick={() => selectBot(bot)}
            >
              <h3 className="font-semibold">{bot.name}</h3>
              <p className="text-sm opacity-75">{bot.tone} tone</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedBot ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaRobot className="text-2xl text-primary" />
                <h2 className="text-2xl font-bold">Bot Details</h2>
              </div>
              {searchParams.get("id") === selectedBot.id && (
                <div className="flex items-center gap-2">
                  {!botStatus ? (
                    <div className="flex items-center gap-2 text-info">
                      <div className="loading loading-spinner loading-sm"></div>
                      <span>We're training your bot...</span>
                    </div>
                  ) : botStatus.status === "ready" ? (
                    <div className="flex items-center gap-2 text-success">
                      <FaCheckCircle className="text-xl" />
                      <span>Bot Ready!</span>
                    </div>
                  ) : botStatus.status === "error" ? (
                    <div className="flex items-center gap-2 text-error">
                      <FaExclamationCircle className="text-xl" />
                      <span>Error: {botStatus.error}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Installation Script</h3>
                <div className="flex items-start gap-2">
                  <pre className="flex-1 bg-base-300 p-4 rounded-lg overflow-x-auto">
                    {`<script src="https://your-domain.com/chatbot.js" data-bot-id="${selectedBot.id}"></script>`}
                  </pre>
                  <button className="btn btn-primary gap-2" onClick={copyScript}>
                    <FaCopy />
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Whitelisted Domains</h3>
                <div className="space-y-4">
                  {whitelistedDomains.map((domain, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder="Enter domain (e.g., example.com)"
                        value={domain}
                        onChange={(e) => handleDomainChange(index, e.target.value)}
                      />
                      {index > 0 && (
                        <button className="btn btn-error" onClick={() => handleRemoveDomain(index)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={handleAddDomain}>
                      Add Domain
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmitDomains}>
                      Save Domains
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hero min-h-[50vh] bg-base-200 rounded-lg">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <FaRobot className="text-6xl text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">No Bots Found</h2>
                <p className="text-gray-600">Create your first bot to get started.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
