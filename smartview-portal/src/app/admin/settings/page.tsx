"use client";

import { useState, useEffect } from "react";
import { llmApi, LlmProvider } from "@/lib/api";
import {
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function SettingsPage() {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [showConfig, setShowConfig] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await llmApi.getProviders();
      setProviders(response.data.data || []);
    } catch {
      console.error("Failed to fetch providers:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSetDefault = async (providerId: string) => {
    setSwitchingId(providerId);
    try {
      await llmApi.setDefaultProvider(providerId);
      // Update local state
      setProviders((prev) =>
        prev.map((p) => ({
          ...p,
          isDefault: p.id === providerId,
        }))
      );
    } catch (error) {
      console.error("Failed to set default provider:", error);
      alert("切换默认提供商失败");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleTestProvider = async (providerId: string) => {
    setTestingId(providerId);
    setTestResults((prev) => ({ ...prev, [providerId]: { success: false, message: "测试中..." } }));
    try {
      const response = await llmApi.testProvider(providerId);
      const result = response.data.data;
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: result.success,
          message: result.success ? result.response || "连接成功" : result.error || "连接失败",
        },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: false,
          message: "测试失败，请检查配置",
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const defaultProvider = providers.find((p) => p.isDefault);
  const enabledProviders = providers.filter((p) => p.enabled);
  const hasProviders = enabledProviders.length > 0;

  // Get initial letter for provider avatar
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold font-mono text-foreground">系统设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理 AI 模型配置</p>
      </div>

      {/* Current Default Provider Card */}
      {hasProviders && defaultProvider && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider mb-3">
            当前默认模型
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-foreground">{defaultProvider.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{defaultProvider.model}</div>
            </div>
            <span className="bg-secondary/50 text-muted-foreground text-xs px-2 py-0.5 rounded">
              默认
            </span>
          </div>
        </div>
      )}

      {/* No Providers Warning */}
      {!loading && !hasProviders && (
        <div className="bg-background rounded-lg p-6 border border-border">
          <div className="flex flex-col items-center text-center">
            <Settings className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm mt-3">
              尚未配置 LLM 提供商，请在服务端配置环境变量以启用 AI 功能。
            </p>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4"
            >
              {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              查看配置说明
            </button>
          </div>
        </div>
      )}

      {/* Config Instructions - Collapsible */}
      {showConfig && (
        <div className="bg-background rounded-lg p-4 mt-2">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium font-mono text-muted-foreground mb-2">方式 1: 单一提供商</h4>
              <pre className="font-mono text-xs bg-card border border-border rounded p-4 text-muted-foreground overflow-x-auto">
{`LLM_PROVIDER=deepseek
LLM_API_KEY=sk-xxx
LLM_MODEL=deepseek-chat`}
              </pre>
            </div>
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium font-mono text-muted-foreground mb-2">方式 2: 多提供商配置</h4>
              <pre className="font-mono text-xs bg-card border border-border rounded p-4 text-muted-foreground overflow-x-auto">
{`LLM_PROVIDERS=deepseek,openai,glm
LLM_DEFAULT_PROVIDER=deepseek
LLM_DEEPSEEK_API_KEY=sk-xxx
LLM_OPENAI_API_KEY=sk-xxx
LLM_GLM_API_KEY=xxx`}
              </pre>
            </div>
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium font-mono text-muted-foreground mb-2">方式 3: 自定义提供商</h4>
              <pre className="font-mono text-xs bg-card border border-border rounded p-4 text-muted-foreground overflow-x-auto">
{`LLM_PROVIDERS=custom
LLM_CUSTOM_NAME=MyProvider
LLM_CUSTOM_BASE_URL=https://my-llm.example.com/v1
LLM_CUSTOM_API_KEY=xxx
LLM_CUSTOM_MODEL=my-model`}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              配置完成后重启服务即可生效。支持 OpenAI、Claude、Gemini、DeepSeek、智谱 GLM、MiniMax、Kimi 等。
            </p>
          </div>
        </div>
      )}

      {/* Providers Grid */}
      {hasProviders && (
        <div>
          <div className="text-xs font-medium font-mono text-muted-foreground uppercase tracking-wider mb-4 mt-8">
            可用模型
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledProviders.map((provider) => {
              const testResult = testResults[provider.id];
              const isTesting = testingId === provider.id;
              const isSwitching = switchingId === provider.id;

              return (
                <div
                  key={provider.id}
                  className={`bg-card rounded-lg p-5 transition border ${
                    provider.isDefault
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary/50 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {getInitial(provider.name)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{provider.name}</span>
                    </div>
                    {provider.isDefault && (
                      <span className="bg-secondary/50 text-muted-foreground text-xs px-2 py-0.5 rounded">
                        默认
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 ml-12">{provider.model}</div>

                  {/* Test Result */}
                  {testResult && (
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          testResult.success ? "bg-syntax-string" : "bg-destructive"
                        }`}
                      />
                      <span
                        className={`text-xs truncate ${
                          testResult.success ? "text-syntax-string" : "text-destructive"
                        }`}
                      >
                        {testResult.success ? "连接正常" : testResult.message}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
                    {!provider.isDefault && (
                      <button
                        onClick={() => handleSetDefault(provider.id)}
                        disabled={isSwitching}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isSwitching && <Loader2 className="w-3 h-3 animate-spin" />}
                        设为默认
                      </button>
                    )}
                    <button
                      onClick={() => handleTestProvider(provider.id)}
                      disabled={isTesting}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isTesting && <Loader2 className="w-3 h-3 animate-spin" />}
                      测试连接
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Config toggle for providers page */}
      {hasProviders && (
        <div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            配置说明
          </button>
        </div>
      )}

      {/* Bottom Tip */}
      {hasProviders && (
        <p className="text-xs text-muted-foreground">
          切换默认模型后，所有 AI 功能将使用新模型。
        </p>
      )}
    </div>
  );
}
