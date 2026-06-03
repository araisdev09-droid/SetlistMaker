const MAX_IMAGES = 2;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  const parts = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function buildPrompt(singerName, imageCount) {
  return `あなたは歌い手ライブのセトリ画像から投稿文を作るアシスタントです。

対象歌い手名: ${singerName}
画像枚数: ${imageCount}

やること:
1. 画像内の表から「曲名」と「出演者」を読み取る。
2. 対象歌い手名が出演者欄に含まれる行だけ抽出する。
3. 休憩、空行、曲名がない行は除外する。
4. 画像が2枚ある場合は、1枚目を1部、2枚目を2部として扱う。画像タイトルから部が分かる場合はそれを優先する。
5. 曲名に原曲アーティスト候補を補完する。
6. 単独出演の場合、出演者名は出力しない。
7. コラボや合唱の場合、出演者を「 × 」区切りで出力する。
8. コラボや合唱では、対象歌い手名を必ず先頭に並べる。それ以外の出演者は画像上の順序を保つ。

出力形式:
[1部]
曲名 / 原曲アーティスト
曲名 / 原曲アーティスト　対象歌い手名 × 他の出演者

[2部]
曲名 / 原曲アーティスト

注意:
- 説明文やMarkdownは付けない。
- 原曲アーティストが不明な場合は「曲名 / 」のように空欄でよい。
- 読み取りに自信がない場合でも、最も可能性が高い投稿文だけを返す。`;
}

function normalizeOpenAIError(message) {
  if (!message) {
    return "AI生成に失敗しました。";
  }

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("quota") || lowerMessage.includes("billing")) {
    return "OpenAI APIの利用枠が不足しています。OpenAI Platformで支払い設定またはクレジット残高を確認してください。";
  }

  if (lowerMessage.includes("api key")) {
    return "OpenAI APIキーを確認してください。Vercelの環境変数 OPENAI_API_KEY が正しく設定されている必要があります。";
  }

  return message;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "POSTで送信してください。" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 500, { error: "OPENAI_API_KEYが設定されていません。" });
  }

  if (!process.env.APP_PASSCODE) {
    return sendJson(res, 500, { error: "APP_PASSCODEが設定されていません。" });
  }

  const { singerName, passcode, images } = req.body || {};

  if (passcode !== process.env.APP_PASSCODE) {
    return sendJson(res, 401, { error: "パスコードが違います。" });
  }

  if (!singerName || typeof singerName !== "string") {
    return sendJson(res, 400, { error: "歌い手名を入力してください。" });
  }

  if (!Array.isArray(images) || images.length === 0) {
    return sendJson(res, 400, { error: "セトリ画像を追加してください。" });
  }

  if (images.length > MAX_IMAGES) {
    return sendJson(res, 400, { error: "画像は最大2枚までです。" });
  }

  const content = [
    {
      type: "input_text",
      text: buildPrompt(singerName.trim(), images.length),
    },
  ];

  for (const image of images) {
    if (!image || typeof image.dataUrl !== "string" || !image.dataUrl.startsWith("data:image/")) {
      return sendJson(res, 400, { error: "画像データが正しくありません。" });
    }

    content.push({
      type: "input_image",
      image_url: image.dataUrl,
      detail: "high",
    });
  }

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content,
          },
        ],
        store: false,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return sendJson(res, apiResponse.status, {
        error: normalizeOpenAIError(data.error?.message),
      });
    }

    const text = extractOutputText(data);
    if (!text) {
      return sendJson(res, 500, { error: "AIの応答を読み取れませんでした。" });
    }

    return sendJson(res, 200, { text });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "AI生成に失敗しました。",
    });
  }
};
