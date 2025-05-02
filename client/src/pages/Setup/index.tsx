import { useState, useEffect } from "react";
import { FaTrash, FaLink, FaFile, FaFont, FaBuilding, FaRobot, FaPalette, FaImage, FaVolumeUp } from "react-icons/fa";
import { getContrastColor } from "Shared/utils/color";
import { updateCompany, createBot, getCompany, Company } from "Shared/services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  message: string;
  timestamp: string;
}

interface KnowledgeItem {
  id: number;
  type: "url" | "file" | "text";
  content: string;
}

interface ConfigStep1 {
  companyName: string;
  botName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: File | null;
  tone: string;
}

const Setup = () => {
  // Dummy chat data
  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      message: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: "10:00 AM"
    },
    {
      id: 2,
      sender: "user",
      message: "I need help setting up my chatbot configuration",
      timestamp: "10:01 AM"
    },
    {
      id: 3,
      sender: "bot",
      message: "I'd be happy to help you with that! Let me guide you through the configuration process.",
      timestamp: "10:01 AM"
    }
  ]);

  const navigate = useNavigate();

  // Configuration state
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Config, setStep1Config] = useState<ConfigStep1>({
    companyName: '',
    botName: '',
    primaryColor: '#4F46E5', // Default indigo color
    secondaryColor: '#10B981', // Default emerald color
    logo: null,
    tone: 'professional'
  });
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      const companyData = await getCompany();
      if (companyData) {
        setCompany(companyData);
        setStep1Config(prev => ({
          ...prev,
          companyName: companyData.name,
          primaryColor: companyData.primary_color,
          secondaryColor: companyData.secondary_color,
        }));
      }
    };
    fetchCompany();
  }, []);

  const handleStep1Change = (field: keyof ConfigStep1, value: string | File | null) => {
    setStep1Config(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKnowledgeItem = (type: "url" | "file" | "text") => {
    setKnowledgeItems(prev => [
      ...prev,
      {
        id: Date.now(),
        type,
        content: ""
      }
    ]);
  };

  const removeKnowledgeItem = (id: number) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
  };

  const updateKnowledgeItem = (id: number, content: string) => {
    setKnowledgeItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, content } : item
      )
    );
  };

  const handleStep1Submit = async () => {
    try {
      setIsSubmitting(true);
      const companyConfig = {
        name: step1Config.companyName,
        primary_color: step1Config.primaryColor,
        secondary_color: step1Config.secondaryColor,
        logo: step1Config.logo || undefined
      };

      const companyResponse = await updateCompany(companyConfig);
      setCompany(companyResponse);
      setCurrentStep(2);
      toast.success("Company configuration saved!");
    } catch (error) {
      console.error("Error saving company configuration:", error);
      toast.error("Failed to save company configuration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!company) {
      toast.error("No company found. Please complete step 1 first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const botConfig = {
        company_id: company.id,
        name: step1Config.botName || undefined,
        tone: step1Config.tone || undefined,
        knowledge_items: knowledgeItems.map(item => ({
          type: item.type,
          content: item.content
        }))
      };

      const response = await createBot(botConfig);
      toast.success("Bot configuration saved!");
      
      // Reset form
      setKnowledgeItems([]);
      //   send to / page
      navigate(`/?id=${response.id}`);
    } catch (error) {
      console.error("Error saving bot configuration:", error);
      toast.error("Failed to save bot configuration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Panel - Chatbot UI */}
          <div className="w-full lg:w-2/5">
            <div className="card h-[600px] backdrop-blur-lg glass shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-white">Chatbot Interface</h2>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}>
                      <div 
                        className={`chat-bubble ${
                          msg.sender === "user" 
                            ? "bg-primary text-primary-content" 
                            : "bg-secondary text-secondary-content"
                        }`}
                        style={{
                          backgroundColor: msg.sender === "user" 
                            ? step1Config.primaryColor 
                            : step1Config.secondaryColor,
                          color: msg.sender === "user" 
                            ? getContrastColor(step1Config.primaryColor)
                            : getContrastColor(step1Config.secondaryColor)
                        }}
                      >
                        {msg.message}
                        <div className="text-xs opacity-80 mt-1">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card-actions justify-end mt-4">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="input input-bordered w-full bg-white/20 border-white/30 text-white placeholder:text-white/50" 
                  />
                  <button 
                    className="btn" 
                    style={{ 
                      backgroundColor: step1Config.primaryColor,
                      color: getContrastColor(step1Config.primaryColor)
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Configuration Form */}
          <div className="w-full lg:w-3/5">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Configuration</h2>
                  <div className="steps">
                    <div className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>Basic Info</div>
                    <div className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>Knowledge Base</div>
                  </div>
                </div>

                {currentStep === 1 ? (
                  <form className="space-y-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaBuilding className="text-primary" />
                          Company Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="Enter your company name" 
                        className="input input-bordered" 
                        value={step1Config.companyName}
                        onChange={(e) => handleStep1Change("companyName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaRobot className="text-primary" />
                          Bot Name
                          <span className="badge badge-ghost badge-sm">Optional</span>
                        </span>
                      </label>
                      <input 
                        type="text" 
                        placeholder={"Enter bot name" + (step1Config.companyName ? ` (defaults to ${step1Config.companyName} Bot)` : "")} 
                        className="input input-bordered" 
                        value={step1Config.botName}
                        onChange={(e) => handleStep1Change("botName", e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaPalette className="text-primary" />
                          Brand Colors
                          <span className="badge badge-ghost badge-sm">Optional</span>
                        </span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text">Primary Color</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="color" 
                              className="w-16 h-10 rounded-lg cursor-pointer" 
                              value={step1Config.primaryColor}
                              onChange={(e) => handleStep1Change("primaryColor", e.target.value)}
                            />
                            <div className="flex-1">
                              <div 
                                className="h-10 rounded-lg" 
                                style={{ backgroundColor: step1Config.primaryColor }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text">Secondary Color</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="color" 
                              className="w-16 h-10 rounded-lg cursor-pointer" 
                              value={step1Config.secondaryColor}
                              onChange={(e) => handleStep1Change("secondaryColor", e.target.value)}
                            />
                            <div className="flex-1">
                              <div 
                                className="h-10 rounded-lg" 
                                style={{ backgroundColor: step1Config.secondaryColor }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaImage className="text-primary" />
                          Logo for your chatbot
                          <span className="badge badge-ghost badge-sm">Optional</span>
                        </span>
                      </label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="file" 
                          className="file-input file-input-bordered w-full" 
                          accept="image/*"
                          onChange={(e) => handleStep1Change("logo", e.target.files?.[0] || null)}
                        />
                        {step1Config.logo && (
                          <div className="avatar">
                            <div className="w-12 rounded-lg">
                              <img src={URL.createObjectURL(step1Config.logo)} alt="Logo preview" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaVolumeUp className="text-primary" />
                          Tone
                          <span className="badge badge-ghost badge-sm">Optional</span>
                        </span>
                      </label>
                      <select 
                        className="select select-bordered"
                        value={step1Config.tone}
                        onChange={(e) => handleStep1Change("tone", e.target.value)}
                      >
                        <option value="">Select a tone for your chatbot</option>
                        <option value="professional">Professional - Formal and business-like</option>
                        <option value="friendly">Friendly - Warm and approachable</option>
                        <option value="casual">Casual - Relaxed and conversational</option>
                        <option value="technical">Technical - Detailed and precise</option>
                      </select>
                    </div>

                    <div className="card-actions justify-end">
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleStep1Submit}
                        disabled={isSubmitting || !step1Config.companyName}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner"></span>
                        ) : (
                          "Next Step"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Knowledge Base Items</h3>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm tooltip flex items-center gap-2" 
                          data-tip="Add URL"
                          onClick={() => addKnowledgeItem("url")}
                        >
                          <FaLink /> Add URL
                        </button>
                        <button 
                          className="btn btn-sm tooltip flex items-center gap-2" 
                          data-tip="Add File"
                          onClick={() => addKnowledgeItem("file")}
                        >
                          <FaFile /> Add File
                        </button>
                        <button 
                          className="btn btn-sm tooltip flex items-center gap-2" 
                          data-tip="Add Text"
                          onClick={() => addKnowledgeItem("text")}
                        >
                          <FaFont /> Add Text
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {knowledgeItems.map(item => (
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
                                  <input 
                                    type="file" 
                                    className="file-input file-input-bordered w-full" 
                                    onChange={(e) => updateKnowledgeItem(item.id, e.target.files?.[0]?.name || "")}
                                  />
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
                            <button 
                              className="btn btn-sm btn-error tooltip" 
                              data-tip="Remove item"
                              onClick={() => removeKnowledgeItem(item.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="card-actions justify-between">
                      <button 
                        className="btn"
                        onClick={() => setCurrentStep(1)}
                        disabled={isSubmitting}
                      >
                        Previous Step
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleStep2Submit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner"></span>
                        ) : (
                          "Save Configuration"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;
