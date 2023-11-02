var items = [
    ['auto', 'auto'],
    ['zh-Hans', 'zh'],
    ['zh-Hant', 'zh'],
    ['en', 'en'],
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
    (async () => {
        const resp = await $http.request({
            method: "GET",
            url: `https://translator.huhuhang.workers.dev/?source_lang=${source_lang}&target_lang=${target_lang}&text=${encodeURIComponent(text)}`,
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
            // Example response:
            // {
            //     "inputs": {
            //         "text": "hello",
            //             "source_lang": "en",
            //                 "target_lang": "zh"
            //     },
            //     "response": {
            //         "translated_text": "您好"
            //     }
            // }
            const { translated_text: targetText } = resp.data.response;
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
                message: err._message || "Unknown error",
                addtion: err._addtion,
            },
        });
    });
}
