# OpenAI Translator Plugin

使用 Azure OpenAI + Cloudflare AI Gateway 进行翻译或润色。

Cloudflare AI Gateway 支持缓存，非常适合拥有翻译场景，可以节省 tokens，重复内容的翻译请求不需要每次都消耗 tokens。

需要自己拥有 Azure OpenAI 账号，且需要自己配置 Cloudflare AI Gateway。

1. 创建自己的 Cloudflare AI Gateway，参考：<https://developers.cloudflare.com/ai-gateway/get-started/creating-gateway/>
2. 部署自己的 Azure OpenAI Model。
3. 双击 `openai-translate.bobplugin` 文件夹安装插件。
4. 按插件预留的配置项填写即可。
