// 系统配置的默认值。后台可覆盖，存进 Setting 表。
export const SETTING_KEYS = {
  userPassword: "user_password", // 用户测评密码
  adminPassword: "admin_password", // 后台管理员密码
  qrImage: "qr_image", // 当前二维码图片路径（相对 /public）
  wechatMode: "wechat_mode", // 最后一题微信号：optional 选填 / required 必填
  showQr: "show_qr", // 报告页是否展示二维码+引导语：1 展示 / 0 隐藏
  hookTitle: "hook_title", // 引流模块标题（后台可编辑）
  hookBody: "hook_body", // 引流模块正文（后台可编辑，段落用换行分隔）
} as const;

// 引流模块默认文案（后台可自由编辑覆盖）
export const DEFAULT_HOOK_TITLE = "添加情感咨询师微信，提升择偶竞争力。";
export const DEFAULT_HOOK_BODY = [
  "上面这张分数表，只测得出能写进资料卡的东西，但它测不出你这个人，也没法告诉你该怎么办。",
  "一次完整的咨询，我会陪你做四件事：看清你此刻的婚恋盘面、评估你想找的人现实里落不落得了地、给你上限和下限两层可执行的画像、再把提高成功率的具体打法说给你听。",
].join("\n");

export const DEFAULTS = {
  userPassword: "6688",
  adminPassword: "admin8888",
  qrImage: "/api/uploads/qr.jpg",
  wechatMode: "optional",
  showQr: "1",
  hookTitle: DEFAULT_HOOK_TITLE,
  hookBody: DEFAULT_HOOK_BODY,
};

// 问卷最后一题：微信留资（填空题，出报告前）
export const WECHAT_STEP = {
  kicker: "最后一步 · 领取你的报告",
  title: "想提升择偶竞争力吗？",
  desc: "留下微信号，免费领资料，带你提升相亲段位、上择优质男！",
  placeholder: "在这里输入你的微信号",
  cta: "领取我的定位报告",
  requiredHint: "留个微信号才能生成报告，分析师会把资料发给你。",
  optionalHint: "选填。填了微信号，分析师能把资料直接发给你。",
};
