const OpenAI = require('openai');
require('dotenv').config();

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// 系统提示词
const SYSTEM_PROMPT = `你是一个机械臂控制助手，你的任务是将用户的自然语言指令转换为具体的机械臂控制命令。

机械臂有3个舵机：
1. ID 0: 旋转舵机 (角度范围: 0-360度，默认180度)
2. ID 1: 大臂舵机 (角度范围: 0-180度，默认90度)
3. ID 2: 小臂舵机 (角度范围: 0-180度，默认90度)

用户会给你发送自然语言指令，你需要：
1. 理解用户想要执行的操作
2. 生成具体的控制命令，格式为 "[舵机ID] [角度值]"（注意：不要"id"前缀）
3. 如果需要执行多个动作，每行一个命令
4. 如果用户指令不清楚或无法执行，回复解释原因

重要：命令格式必须是 "[舵机ID] [角度值]"，例如 "0 150"，不要添加"id"前缀！

示例：
用户："把旋转舵机转到90度"
你回复："0 90"

用户："把大臂抬起来一点"
你回复："1 120"

用户："重置所有舵机"
你回复：
"0 180
1 90
2 90"

用户："把机械臂移动到前方位置"
你回复：
"0 180
1 60
2 120"

请只回复控制命令或解释说明，不要添加其他内容。`;

async function processUserCommand(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || "qwen-plus",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const response = completion.choices[0].message.content.trim();
    return response;
  } catch (error) {
    console.error('LLM processing error:', error);
    return "抱歉，处理您的指令时出现错误。请稍后重试。";
  }
}

module.exports = {
  processUserCommand
};