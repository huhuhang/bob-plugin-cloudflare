var items = [
    ['zh-Hans', '简体中文'],
    ['en', '英文'],
];

var langMap = new Map(items);
var langMapReverse = new Map(items.map(([standardLang, lang]) => [lang, standardLang]));

function supportLanguages() {
    return items.map(([standardLang, lang]) => standardLang);
}

function translate(query, completion) {
    let text = query.text;
    let source_lang = langMap.get(query.detectFrom);
    let target_lang = langMap.get(query.detectTo);
    // options
    var apiKey = $option.apiKey;
    var modelName = $option.modelName;
    var purpose = $option.purpose;
    if (purpose == "1") {
        var USER_PROMPT = `您是一个翻译引擎, 您只能翻译文本, 不能解释文本, 也不需要解释文本. 请将下面的文本从${source_lang}翻译成${target_lang}, 请不要解释翻译结果或增加补充说明, 只需要保持原有的格式不变, 同时使用 ${target_lang} 标点符号. 输出翻译后的${target_lang}文本: ${text}`;
    }
    else if (purpose == "2") {
        var USER_PROMPT = `Revise the ${target_lang} sentences to make them more clear, concise, and coherent, just revise or leave them as they are: ${text}`;
    }
    else if (purpose == "3") {
        var USER_PROMPT = `你是一位精通${target_lang}的专业翻译, 尤其擅长将专业学术论文翻译成浅显易懂的科普文章. 请你帮我将以下${source_lang}段落翻译成${target_lang}, 风格与${target_lang}科普读物相似.
规则:
- 翻译时要准确传达原文的事实和背景;
- 即使上意译也要保留原始段落格式, 以及保留术语, 例如 FLAC, JPEG 等. 保留公司缩写, 例如 Microsoft, Amazon, OpenAI 等;
- 人名不翻译;
- 同时要保留引用的论文, 例如 [20] 这样的引用;
- 对于 Figure 和 Table, 翻译的同时保留原有格式, 例如: "Figure 1: "翻译为"图 1: ", "Table 1: "翻译为: "表 1: ";
- 全角括号换成半角括号, 并在左括号前面加半角空格, 右括号后面加半角空格;
- 输入格式为 Markdown 格式, 输出格式也必须保留原始 Markdown 格式;
- 在翻译专业术语时, 第一次出现时要在括号里面写上${source_lang}原文, 例如: "生成式 AI (Generative AI)", 之后就可以只写${target_lang}了;

策略:
分三步进行翻译工作: 

1. 根据${source_lang}内容直译, 保持原有格式, 不要遗漏任何信息;
2. 根据第一步直译的结果, 指出其中存在的具体问题, 要准确描述, 不宜笼统的表示, 也不需要增加原文不存在的内容或格式, 包括不仅限于: 

- 不符合${target_lang}表达习惯, 明确指出不符合的地方;
- 语句不通顺, 指出位置, 不需要给出修改意见, 意译时修复;
- 晦涩难懂, 不易理解, 可以尝试给出解释;

3. 根据第一步直译的结果和第二步指出的问题, 重新进行意译, 保证内容的原意的基础上, 使其更易于理解, 更符合${target_lang}的表达习惯, 同时保持原有的格式不变
返回意译结果. 请不要解释翻译结果或增加补充说明, 保持原有的格式不变, 返回意译后的${target_lang}文本. 现在请按照上面的要求从第一行开始翻译以下内容为${target_lang}: 

${text}`;
    }
    (async () => {
        const resp = await $http.request({
            url: "https://api.anthropic.com/v1/messages",
            method: "POST",
            header: {
                "content-type": "application/json",
                "anthropic-version": "2023-06-01",
                "x-api-key": apiKey,
            },
            body: {
                "model": modelName,
                "max_tokens": 4096,
                "messages": [
                    { "role": "user", "content": USER_PROMPT }
                ]
            },
        });
        if (resp.error) {
            const { statusCode } = resp.response;
            completion({
                error: {
                    message: "Request failed, Status Code: " + statusCode,
                    addtion: JSON.stringify(response),
                },
            });
        } else {
            const response = resp.data;
            const targetText = response.content[0].text;
            completion({
                result: {
                    from: query.detectFrom,
                    to: query.detectTo,
                    toParagraphs: targetText.split("\n"),
                },
            });
        }
    })().catch((err) => {
        completion({
            error: {
                type: err._type || "Unknown",
                message: err._message,
                addtion: err._addtion,
            },
        });
    });
}
