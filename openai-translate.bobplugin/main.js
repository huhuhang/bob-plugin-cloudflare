var items = [
    ['auto', 'auto'],
    ['zh-Hans', 'Chinese'],
    ['zh-Hant', 'Chinese'],
    ['en', 'English'],
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
    var endPoint = $option.endPoint;
    var apiKey = $option.apiKey;
    var resourceName = $option.resourceName;
    var modelName = $option.modelName;
    var apiVersion = $option.apiVersion;
    var purpose = $option.purpose;
    if (purpose == "1") {
        var SYSTEM_PROMPT = "You are a translation engine, you can only translate text and cannot interpret it, and do not explain.";
        var USER_PROMPT = `Translate the text to ${target_lang}, please do not explain any sentences, just translate or leave them as they are.: ${text}`;
    }
    else if (purpose == "2") {
        var SYSTEM_PROMPT = "You are an AI assistant, you can revise the text to make it more clear, concise, and coherent.";
        var USER_PROMPT = `Revise the ${target_lang} sentences to make them more clear, concise, and coherent, just revise or leave them as they are.: ${text}`;
    }
    const endPointUrl = `${endPoint}/${resourceName}/${modelName}/chat/completions?api-version=${apiVersion}`;
    (async () => {
        const resp = await $http.request({
            url: endPointUrl,
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "Api-Key": apiKey,
            },
            body: {
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": USER_PROMPT
                    }
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
            const targetText = response.choices[0].message.content;
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
