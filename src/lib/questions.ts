// 测评题目结构 —— 逻辑完全对标 xq.wxmini.club，最后一组改为可配置钩子题
export type Gender = "male" | "female";

export type FieldOption = { v: string; t: string };
export type Field = {
  key: string;
  type: "slider" | "single" | "multi";
  label: string;
  cols?: 1 | 2;
  min?: number;
  max?: number;
  step?: number;
  def?: number;
  unit?: string;
  labels?: string[];
  options?: FieldOption[];
  max_select?: number;
  when?: (s: Record<string, any>) => boolean;
};
export type Group = {
  id: string;
  title: string;
  kicker: string;
  note?: string;
  fields: Field[];
};

// 收入分档（月税后）
export const INCOME_LABELS = [
  "3000 以下",
  "3000–5000",
  "5000–8000",
  "8000–1万",
  "1万–1.5万",
  "1.5万–2万",
  "2万–3万",
  "3万–5万",
  "5万–8万",
  "8万–10万",
  "10万以上",
];
export const INCOME_MID = [2000, 4000, 6500, 9000, 12500, 17500, 25000, 40000, 65000, 90000, 120000];
export const INCOME_PCTL = [5, 16, 32, 46, 60, 71, 81, 89, 94, 97, 100];

// 身高滑块范围
export const HEIGHT_RANGE: Record<Gender, { min: number; max: number; def: number }> = {
  male: { min: 155, max: 195, def: 175 },
  female: { min: 148, max: 180, def: 162 },
};

// 九个维度
export const DIMENSIONS: Record<string, { name: string; short: string; color: string }> = {
  age: { name: "年龄窗口", short: "年龄", color: "#B23A48" },
  location: { name: "城市户籍", short: "城市", color: "#4F6F52" },
  edu: { name: "学历职业", short: "学历职业", color: "#3F5E8C" },
  econ: { name: "个人经济", short: "个人经济", color: "#B7791F" },
  fasset: { name: "原生家底", short: "原生家底", color: "#7A5C3E" },
  fstruct: { name: "家庭负担", short: "家庭负担", color: "#8C4A5B" },
  appear: { name: "外形条件", short: "外形条件", color: "#C2653A" },
  pers: { name: "性格与推进力", short: "性格", color: "#5B4B8A" },
  emo: { name: "婚恋态度", short: "婚恋态度", color: "#2F6E6A" },
};

// 性别权重
export const WEIGHTS: Record<Gender, Record<string, number>> = {
  male: { age: 0.1, location: 0.1, edu: 0.18, econ: 0.22, fasset: 0.1, fstruct: 0.08, appear: 0.11, pers: 0.07, emo: 0.04 },
  female: { age: 0.16, location: 0.1, edu: 0.13, econ: 0.12, fasset: 0.09, fstruct: 0.09, appear: 0.17, pers: 0.08, emo: 0.06 },
};

// 前 8 组计分题
export const SCORING_GROUPS: Group[] = [
  {
    id: "basic",
    title: "年龄与所在地",
    kicker: "第一组 · 基本盘",
    note: "相亲里最先被问到的几件事。别有负担，如实填就好。",
    fields: [
      { key: "age", type: "slider", label: "你今年多少岁", min: 18, max: 45, step: 1, def: 25, unit: "岁" },
      {
        key: "marital",
        type: "single",
        label: "你的婚姻状况",
        cols: 2,
        options: [
          { v: "wei", t: "未婚" },
          { v: "div0", t: "离异，没有孩子" },
          { v: "divx", t: "离异，孩子随对方" },
          { v: "divk", t: "离异，孩子随我" },
        ],
      },
      {
        key: "city",
        type: "single",
        label: "现在长期生活在哪一类城市",
        cols: 2,
        options: [
          { v: "t1", t: "北上广深" },
          { v: "t2", t: "杭成渝汉等新一线" },
          { v: "t3", t: "普通省会 / 二线" },
          { v: "t4", t: "三线及以下 / 县域" },
        ],
      },
      {
        key: "hukou",
        type: "single",
        label: "你的户口本落在哪里",
        cols: 2,
        options: [
          { v: "big", t: "一线城市城镇户口" },
          { v: "sec", t: "省会或计划单列市" },
          { v: "other", t: "普通地级市 / 县城" },
          { v: "rural", t: "农村户口" },
        ],
      },
    ],
  },
  {
    id: "edu",
    title: "读到哪里，做什么工作",
    kicker: "第二组 · 学历职业",
    note: "介绍人递资料时，这一栏排在最上面。",
    fields: [
      {
        key: "edu",
        type: "single",
        label: "你拿到的最高一张文凭是",
        options: [
          { v: "phd", t: "博士" },
          { v: "master", t: "硕士" },
          { v: "985", t: "985 / 211 本科" },
          { v: "bachelor", t: "普通本科" },
          { v: "college", t: "大专 / 高职" },
          { v: "other", t: "高中、中专及以下" },
        ],
      },
      {
        key: "job",
        type: "single",
        label: "你目前吃哪碗饭",
        options: [
          { v: "pub", t: "公务员 / 事业编 / 国央企在编" },
          { v: "fin", t: "金融、投行、券商、咨询" },
          { v: "it", t: "互联网大厂 / 研发技术岗" },
          { v: "for", t: "外企、跨国公司" },
          { v: "med", t: "医院、学校、科研院所" },
          { v: "biz", t: "普通民企 / 中小公司职员" },
          { v: "self", t: "自由职业、个体户、自己创业" },
        ],
      },
    ],
  },
  {
    id: "econ",
    title: "你自己手上有什么",
    kicker: "第三组 · 个人经济",
    note: "只算你名下的，家里的下一组再问。",
    fields: [
      { key: "income", type: "slider", label: "税后到手月收入", min: 0, max: 10, step: 1, def: 4, labels: INCOME_LABELS },
      {
        key: "house",
        type: "single",
        label: "常住城市的住房情况",
        cols: 2,
        options: [
          { v: "own", t: "房本上有我的名字" },
          { v: "family", t: "住家里的房，非我名下" },
          { v: "plan", t: "在租房，已在攒首付" },
          { v: "no", t: "在租房，短期不打算买" },
        ],
      },
      {
        key: "debt",
        type: "single",
        label: "你名下的负债情况",
        options: [
          { v: "none", t: "没有负债" },
          { v: "normal", t: "有房贷车贷，正常在还" },
          { v: "heavy", t: "有消费贷或欠款，压力不小" },
        ],
      },
    ],
  },
  {
    id: "fasset",
    title: "父母那边的底子",
    kicker: "第四组 · 原生家底",
    note: "这一项在见家长阶段才会摊开，但它一直在起作用。",
    fields: [
      {
        key: "p_house",
        type: "single",
        label: "父母名下的房子（含老家宅基地房）",
        cols: 2,
        options: [
          { v: "3p", t: "三套及以上" },
          { v: "2", t: "两套" },
          { v: "1", t: "一套" },
          { v: "0", t: "没有自有房" },
        ],
      },
      {
        key: "p_cash",
        type: "single",
        label: "父母能拿得出来的现金与理财，大概是",
        options: [
          { v: "rich", t: "500 万以上" },
          { v: "mid", t: "100 万到 500 万" },
          { v: "low", t: "20 万到 100 万" },
          { v: "poor", t: "20 万以下，或还有欠款" },
        ],
      },
      {
        key: "p_pension",
        type: "single",
        label: "父母的养老钱有着落吗",
        cols: 2,
        options: [
          { v: "yes", t: "退休金够花，不用我贴" },
          { v: "part", t: "基本够，偶尔要搭把手" },
          { v: "no", t: "没有保障，得靠子女" },
        ],
      },
    ],
  },
  {
    id: "fstruct",
    title: "家里几个孩子，担子多重",
    kicker: "第五组 · 家庭负担",
    note: "对方最担心、又最不好意思直接问的一组。",
    fields: [
      {
        key: "siblings",
        type: "single",
        label: "你在家里排行",
        cols: 2,
        options: [
          { v: "only", t: "独生子女" },
          { v: "elder", t: "老大，下面还有弟妹" },
          { v: "younger", t: "最小的，上面有兄姐" },
          { v: "mid", t: "夹在中间" },
        ],
      },
      {
        key: "sib_job",
        type: "single",
        label: "弟弟妹妹现在的状态",
        cols: 2,
        when: (e) => e.siblings === "elder",
        options: [
          { v: "employed", t: "已经工作或还在读书" },
          { v: "unemployed", t: "待业中，暂时靠家里" },
        ],
      },
      {
        key: "support",
        type: "single",
        label: "往后你要往家里贴多少钱",
        options: [
          { v: "none", t: "不用贴，父母能自理" },
          { v: "light", t: "逢年过节给点，压力不大" },
          { v: "heavy", t: "每月固定给生活费" },
          { v: "full", t: "家里主要靠我养" },
        ],
      },
    ],
  },
  {
    id: "appear",
    title: "照片和真人",
    kicker: "第六组 · 外形条件",
    note: "第一次见面前十分钟决定的部分。请按你被人评价过的实际情况选。",
    fields: [
      {
        key: "looks",
        type: "single",
        label: "在陌生人眼里，你的长相大概是",
        options: [
          { v: "top", t: "常被搭讪、被要联系方式，走在路上有人回头" },
          { v: "good", t: "第一眼就好看，异性缘明显偏好" },
          { v: "avg_nice", t: "耐看型，第一印象普通，熟了越看越顺眼" },
          { v: "avg", t: "大众长相，不出挑也没短板" },
          { v: "below", t: "外形是我的弱项，自己心里有数" },
        ],
      },
      { key: "height", type: "slider", label: "身高", unit: "cm" },
      {
        key: "style",
        type: "single",
        label: "出门前你会在打扮上花多少心思",
        cols: 2,
        options: [
          { v: "great", t: "很在意，穿搭发型都收拾" },
          { v: "ok", t: "干净得体，不刻意" },
          { v: "avg", t: "随手抓一件就出门" },
          { v: "bad", t: "基本不管这些" },
        ],
      },
    ],
  },
  {
    id: "pers",
    title: "相处起来是什么样的人",
    kicker: "第七组 · 性格与推进力",
    note: "硬件把人带到桌前，这一组决定还有没有第二次。",
    fields: [
      {
        key: "social",
        type: "single",
        label: "和陌生人吃一顿饭，你的状态是",
        cols: 2,
        options: [
          { v: "extro", t: "自然能聊，不冷场" },
          { v: "ambi", t: "看对方，聊得来就放开" },
          { v: "intro", t: "话少，需要对方带节奏" },
          { v: "shy", t: "很耗电，全程紧绷" },
        ],
      },
      {
        key: "emo_s",
        type: "single",
        label: "身边人怎么形容你的情绪",
        options: [
          { v: "stable", t: "很稳，几乎不见我发脾气" },
          { v: "mostly", t: "大体平稳，偶尔有波动" },
          { v: "mid", t: "起伏比较明显，看状态" },
          { v: "unstable", t: "敏感，容易被小事影响一整天" },
        ],
      },
      {
        key: "conflict",
        type: "single",
        label: "和另一半闹别扭时，你通常会",
        options: [
          { v: "talk", t: "当场把话讲开，一起找办法" },
          { v: "cool", t: "先各自冷静，回头再谈" },
          { v: "avoid", t: "尽量绕开，不想吵" },
          { v: "hot", t: "情绪先上来，事后才后悔" },
        ],
      },
      {
        key: "active",
        type: "single",
        label: "相亲加上微信之后，谁先开口",
        cols: 2,
        options: [
          { v: "very", t: "我会主动约下一次" },
          { v: "ok", t: "对方有回应我就接上" },
          { v: "passive", t: "一般等对方先说" },
          { v: "shy", t: "不知道说什么，常常就没了下文" },
        ],
      },
    ],
  },
  {
    id: "emo",
    title: "你想要一段什么样的关系",
    kicker: "第八组 · 婚恋态度",
    note: "这一组不影响你是不是好人，只影响匹配效率。",
    fields: [
      {
        key: "romance",
        type: "single",
        label: "正式谈过几段",
        cols: 2,
        options: [
          { v: "none", t: "还没有谈过" },
          { v: "few", t: "1 到 2 段" },
          { v: "some", t: "3 到 4 段" },
          { v: "many", t: "5 段以上" },
        ],
      },
      {
        key: "kids",
        type: "single",
        label: "关于结婚和生孩子",
        cols: 2,
        options: [
          { v: "yes", t: "想结婚，也想要孩子" },
          { v: "maybe", t: "想结婚，孩子看缘分" },
          { v: "marry", t: "想结婚，但不打算生" },
          { v: "dink", t: "丁克，或暂时不考虑婚姻" },
        ],
      },
      {
        key: "parents",
        type: "single",
        label: "爸妈在你的婚事上插手到什么程度",
        cols: 2,
        options: [
          { v: "open", t: "完全我自己拿主意" },
          { v: "mild", t: "偶尔念叨，能商量" },
          { v: "heavy", t: "催得紧，还开了条件" },
          { v: "control", t: "他们说了算，谈不拢" },
        ],
      },
    ],
  },
];

// 第九组：择偶取向（不计分，用于生成双画像）
export const WANT_GROUP: Group = {
  id: "want",
  title: "你想找什么样的人",
  kicker: "第九组 · 择偶取向",
  note: "这一组不计入你的分数，只用来生成属于你的双画像。",
  fields: [
    {
      key: "priority",
      type: "multi",
      max_select: 3,
      label: "如果只能保留三条，你最在意对方的（最多选 3 项）",
      options: [
        { v: "looks", t: "长相和身高" },
        { v: "income", t: "赚钱能力" },
        { v: "edu", t: "学历和见识" },
        { v: "char", t: "性格和人品" },
        { v: "family", t: "家境和父母" },
        { v: "stable", t: "稳定、有安全感" },
      ],
    },
  ],
};

export function initialAnswers(): Record<string, any> {
  return { gender: null, age: 25, income: 4, height: 162, priority: [] };
}
