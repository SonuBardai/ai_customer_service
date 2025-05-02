import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { listBots, getBotStatus, getBot, Bot, BotStatus } from "../../shared/services/api";
import toast from "react-hot-toast";
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaCopy, FaGlobe, FaBook, FaCog, FaLink, FaFile, FaFont, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import ChatbotInterface from "../../components/ChatbotInterface";
import { getContrastColor } from "../../utils/color";
import { BACKEND_URL } from "Shared/constants";

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [whitelistedDomains, setWhitelistedDomains] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [activeTab, setActiveTab] = useState("whitelist");
  const [knowledgeItems, setKnowledgeItems] = useState<
    Array<{
      id: number;
      type: "url" | "file" | "text";
      content: string;
    }>
  >([]);
  const [botSettings, setBotSettings] = useState({
    name: "",
    tone: "professional",
  });
  const [showChatbot, setShowChatbot] = useState(false);

  const fetchBotDetails = async (botId: string) => {
    try {
      const botDetails = await getBot(botId);
      setBotSettings({
        name: botDetails.name,
        tone: botDetails.tone,
      });
      setKnowledgeItems(
        botDetails.knowledge_items.map((item) => ({
          id: parseInt(item.id),
          type: item.type as "url" | "file" | "text",
          content: item.content,
        }))
      );
    } catch (error) {
      console.error("Error fetching bot details:", error);
      toast.error("Failed to load bot details");
    }
  };

  const selectBot = async (bot: Bot) => {
    setSelectedBot(bot);
    setSearchParams({ id: bot.id });
    await fetchBotDetails(bot.id);
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

    if (selectedBot) {
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
  }, [selectedBot]);

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

  const generateBotScript = (botId: string) => {
    return `<script
  src="${BACKEND_URL}/static/chatbot.js"
  data-bot-id="${botId}">
</script>`;
  };

  const copyScript = () => {
    if (!selectedBot) return;
    const script = generateBotScript(selectedBot.id);
    navigator.clipboard.writeText(script);
    toast.success("Script copied to clipboard");
  };

  const addKnowledgeItem = (type: "url" | "file" | "text") => {
    setKnowledgeItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        content: "",
      },
    ]);
  };

  const removeKnowledgeItem = (id: number) => {
    setKnowledgeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateKnowledgeItem = (id: number, content: string) => {
    setKnowledgeItems((prev) => prev.map((item) => (item.id === id ? { ...item, content } : item)));
  };

  const handleSettingsChange = (field: keyof typeof botSettings, value: string) => {
    setBotSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "whitelist":
        return (
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
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button className="btn btn-primary gap-2" onClick={handleAddDomain}>
                <FaPlus />
                Add Domain
              </button>
              <button className="btn btn-primary" onClick={handleSubmitDomains}>
                Save Domains
              </button>
            </div>
          </div>
        );

      case "knowledge":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Knowledge Base Items</h3>
              <div className="flex gap-2">
                <button className="btn btn-sm tooltip flex items-center gap-2" data-tip="Add URL" onClick={() => addKnowledgeItem("url")}>
                  <FaLink /> Add URL
                </button>
                <button className="btn btn-sm tooltip flex items-center gap-2" data-tip="Add File" onClick={() => addKnowledgeItem("file")}>
                  <FaFile /> Add File
                </button>
                <button className="btn btn-sm tooltip flex items-center gap-2" data-tip="Add Text" onClick={() => addKnowledgeItem("text")}>
                  <FaFont /> Add Text
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {knowledgeItems.map((item) => (
                <div key={item.id} className="card bg-base-200 p-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      {item.type === "url" && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text flex items-center gap-2">
                              <FaLink className="text-primary" />
                              URL
                            </span>
                          </label>
                          <input
                            type="url"
                            placeholder="Enter URL (e.g., https://example.com)"
                            className="input input-bordered w-full"
                            value={item.content}
                            onChange={(e) => updateKnowledgeItem(item.id, e.target.value)}
                          />
                        </div>
                      )}
                      {item.type === "file" && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text flex items-center gap-2">
                              <FaFile className="text-primary" />
                              File
                            </span>
                          </label>
                          <input type="file" className="file-input file-input-bordered w-full" onChange={(e) => updateKnowledgeItem(item.id, e.target.files?.[0]?.name || "")} />
                        </div>
                      )}
                      {item.type === "text" && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text flex items-center gap-2">
                              <FaFont className="text-primary" />
                              Text Content
                            </span>
                          </label>
                          <textarea
                            placeholder="Enter text content..."
                            className="textarea textarea-bordered w-full"
                            value={item.content}
                            onChange={(e) => updateKnowledgeItem(item.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <button className="btn btn-sm btn-error tooltip" data-tip="Remove item" onClick={() => removeKnowledgeItem(item.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FaRobot className="text-primary" />
                  Bot Name
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter bot name"
                className="input input-bordered"
                value={botSettings.name}
                onChange={(e) => handleSettingsChange("name", e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FaCog className="text-primary" />
                  Tone
                </span>
              </label>
              <select className="select select-bordered" value={botSettings.tone} onChange={(e) => handleSettingsChange("tone", e.target.value)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div className="card-actions justify-end">
              <button className="btn btn-primary">Save Settings</button>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              <div className="card-body px-6">
                <h3 className="card-title">Installation Script</h3>
                <div className="flex items-start gap-2">
                  <pre className="flex-1 bg-base-300 p-4 rounded-lg overflow-x-auto">
                    {generateBotScript(selectedBot.id)}
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
                <div className="tabs tabs-boxed">
                  <button className={`tab gap-2 ${activeTab === "whitelist" ? "tab-active" : ""}`} onClick={() => setActiveTab("whitelist")}>
                    <FaGlobe />
                    Whitelist
                  </button>
                  <button className={`tab gap-2 ${activeTab === "knowledge" ? "tab-active" : ""}`} onClick={() => setActiveTab("knowledge")}>
                    <FaBook />
                    Knowledge
                  </button>
                  <button className={`tab gap-2 ${activeTab === "settings" ? "tab-active" : ""}`} onClick={() => setActiveTab("settings")}>
                    <FaCog />
                    Settings
                  </button>
                </div>

                <div className="mt-6">{renderTabContent()}</div>
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

      {/* Try using button and Chatbot Interface */}
      {selectedBot && selectedBot.status === "ready" && (
        <div className="fixed bottom-4 right-4 z-50">
          {!showChatbot ? (
            <button
              onClick={() => setShowChatbot(true)}
              className="btn btn-primary gap-2"
              style={{
                backgroundColor: selectedBot.primary_color,
                color: getContrastColor(selectedBot.primary_color),
              }}
            >
              <FaRobot />
              Try using {selectedBot.name}
            </button>
          ) : (
            <div className="relative">
              <button onClick={() => setShowChatbot(false)} className="absolute z-[5] -top-4 -right-4 btn btn-circle btn-sm bg-white/20 hover:bg-white/30 border-0">
                <FaTimes className="text-white" />
              </button>
              <ChatbotInterface botName={selectedBot.name} primaryColor={selectedBot.primary_color} secondaryColor={selectedBot.secondary_color} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
