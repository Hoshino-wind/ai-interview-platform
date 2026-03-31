"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_TEMPLATES = void 0;
exports.PROVIDER_TEMPLATES = {
    openai: {
        name: 'OpenAI (GPT)',
        apiType: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
    },
    claude: {
        name: 'Claude',
        apiType: 'anthropic',
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-3-5-sonnet-20241022',
    },
    gemini: {
        name: 'Gemini',
        apiType: 'google',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-pro',
    },
    deepseek: {
        name: 'DeepSeek',
        apiType: 'openai',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
    },
    glm: {
        name: 'GLM (智谱)',
        apiType: 'openai',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4-flash',
    },
    minimax: {
        name: 'MiniMax',
        apiType: 'openai',
        baseUrl: 'https://api.minimax.chat/v1',
        model: 'abab6.5s-chat',
    },
    kimi: {
        name: 'Kimi (月之暗面)',
        apiType: 'openai',
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k',
    },
};
//# sourceMappingURL=types.js.map