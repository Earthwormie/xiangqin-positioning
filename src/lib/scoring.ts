// 算分与报告生成 —— 逻辑 1:1 移植 xq.wxmini.club
import {
  Gender,
  INCOME_MID,
  INCOME_PCTL,
  WEIGHTS,
} from "./questions";

type State = Record<string, any>;

const clamp = (e: number, t = 0, n = 100) => Math.max(t, Math.min(n, e));
const pick = (obj: Record<string, number>, k: string, def: number) => (k in obj ? obj[k] : def);

// 分段线性插值
function interp(points: number[][], x: number): number {
  if (x <= points[0][0]) return points[0][1];
  for (let n = 1; n < points.length; n++) {
    if (x <= points[n][0]) {
      const [r, i] = points[n - 1];
      const [s, o] = points[n];
      return i + ((o - i) * (x - r)) / (s - r);
    }
  }
  return points[points.length - 1][1];
}

// —— 各维度原始分 ——
const AGE_CURVE: Record<Gender, number[][]> = {
  male: [[18, 58], [22, 66], [25, 80], [28, 92], [30, 95], [33, 90], [36, 78], [40, 60], [45, 40]],
  female: [[18, 74], [21, 84], [23, 98], [25, 96], [27, 86], [29, 72], [31, 57], [33, 45], [35, 35], [38, 26], [42, 20], [45, 16]],
};
function scoreAge(e: State) {
  return interp(AGE_CURVE[e.gender as Gender] || AGE_CURVE.male, e.age);
}

function scoreLocation(e: State) {
  const t: Record<string, number> = { t1: 100, t2: 82, t3: 62, t4: 38 };
  const n: Record<string, number> = { big: 100, sec: 78, other: 55, rural: 28 };
  return pick(t, e.city, 62) * 0.6 + pick(n, e.hukou, 55) * 0.4;
}

function scoreEdu(e: State) {
  const t: Record<string, number> = { phd: 95, master: 88, "985": 80, bachelor: 65, college: 45, other: 25 };
  const female: Record<string, number> = { pub: 90, fin: 82, for: 80, med: 78, it: 70, biz: 52, self: 38 };
  const male: Record<string, number> = { fin: 92, it: 88, for: 80, pub: 75, med: 72, biz: 55, self: 38 };
  const i = e.gender === "female" ? female : male;
  return pick(t, e.edu, 60) * 0.35 + pick(i, e.job, 55) * 0.65;
}

const CITY_INCOME_ADJ: Record<string, number> = { t1: -0.6, t2: -0.2, t3: 0.5, t4: 1 };
const INCOME_PCTL_CURVE = INCOME_PCTL.map((e, t) => [t, e]);
function incomePercentile(v: number) {
  return interp(INCOME_PCTL_CURVE, clamp(v, 0, 10));
}
function scoreEcon(e: State) {
  const t = incomePercentile(e.income + (CITY_INCOME_ADJ[e.city] ?? 0));
  const male: Record<string, number> = { own: 100, family: 72, plan: 45, no: 18 };
  const female: Record<string, number> = { own: 95, family: 70, plan: 55, no: 35 };
  let i = e.gender === "male" ? pick(male, e.house, 40) : pick(female, e.house, 45);
  if (e.income >= 6) {
    if (e.house === "plan") i = Math.max(i, 62);
    if (e.house === "no") i = Math.max(i, e.gender === "male" ? 42 : 48);
  } else if (e.income >= 4 && e.house === "plan") {
    i = Math.max(i, 54);
  }
  let s = e.gender === "male" ? t * 0.62 + i * 0.38 : t * 0.72 + i * 0.28;
  if (e.debt === "heavy") s = Math.max(8, s - 18);
  return s;
}

function scoreFasset(e: State) {
  const t: Record<string, number> = { "3p": 100, "2": 78, "1": 52, "0": 18 };
  const n: Record<string, number> = { rich: 100, mid: 68, low: 38, poor: 12 };
  const r: Record<string, number> = { yes: 100, part: 62, no: 22 };
  return pick(t, e.p_house, 52) * 0.4 + pick(n, e.p_cash, 38) * 0.4 + pick(r, e.p_pension, 62) * 0.2;
}

function scoreFstruct(e: State) {
  const t: Record<string, number> = { only: 75, elder: 62, younger: 82, mid: 72 };
  const n: Record<string, number> = { none: 100, light: 78, heavy: 42, full: 15 };
  let r = pick(t, e.siblings, 72) * 0.35 + pick(n, e.support, 68) * 0.65;
  if (e.siblings === "elder" && e.sib_job === "unemployed" && (e.support === "heavy" || e.support === "full")) {
    r = Math.max(10, r - 15);
  }
  return r;
}

function scoreAppear(e: State) {
  const t: Record<string, number> = { top: 100, good: 80, avg_nice: 60, avg: 42, below: 22 };
  const n: Record<string, number> = { great: 100, ok: 75, avg: 48, bad: 22 };
  let r = pick(t, e.looks, 42);
  const i = e.height;
  let s: number;
  if (e.gender === "male") {
    s = i >= 183 ? 100 : i >= 180 ? 90 : i >= 177 ? 78 : i >= 175 ? 68 : i >= 172 ? 58 : i >= 170 ? 48 : i >= 168 ? 36 : i >= 165 ? 24 : 12;
  } else {
    s = i >= 168 ? 92 : i >= 165 ? 82 : i >= 163 ? 72 : i >= 160 ? 62 : i >= 158 ? 50 : i >= 155 ? 36 : 20;
    if (i < 158 && e.looks === "avg_nice") r = Math.min(r, 55);
    if (i < 155 && e.looks === "top") r = Math.min(r, 72);
  }
  if (e.style === "bad" && (e.looks === "top" || e.looks === "good")) {
    r = Math.min(r, 68);
  } else if (e.style === "avg" && e.looks === "top") {
    r = Math.min(r, 82);
  }
  return r * 0.5 + s * 0.3 + pick(n, e.style, 58) * 0.2;
}

function scorePers(e: State) {
  const t: Record<string, number> = { extro: 88, ambi: 82, intro: 68, shy: 48 };
  const n: Record<string, number> = { stable: 100, mostly: 78, mid: 52, unstable: 25 };
  const r: Record<string, number> = { talk: 100, cool: 82, avoid: 58, hot: 28 };
  const i: Record<string, number> = { very: 100, ok: 82, passive: 52, shy: 28 };
  return pick(t, e.social, 70) * 0.22 + pick(n, e.emo_s, 72) * 0.33 + pick(r, e.conflict, 70) * 0.25 + pick(i, e.active, 70) * 0.2;
}

function scoreEmo(e: State) {
  const t: Record<string, number> = { none: 78, few: 90, some: 62, many: 38 };
  const n: Record<string, number> = { yes: 100, maybe: 78, marry: 58, dink: 32 };
  const r: Record<string, number> = { open: 100, mild: 78, heavy: 42, control: 18 };
  let i = pick(t, e.romance, 72) * 0.25 + pick(n, e.kids, 75) * 0.4 + pick(r, e.parents, 68) * 0.35;
  if ((e.kids === "dink" || e.kids === "marry") && (e.parents === "heavy" || e.parents === "control")) {
    i = Math.max(8, i - 10);
  }
  return i;
}

// 婚姻状况对总分的折扣
const MARITAL_FACTOR: Record<Gender, Record<string, number>> = {
  male: { wei: 1, div0: 0.95, divx: 0.9, divk: 0.86 },
  female: { wei: 1, div0: 0.92, divx: 0.87, divk: 0.8 },
};

export type Dims = Record<string, number>;
export type ScoreResult = { total: number; dims: Dims };

export function computeScore(e: State): ScoreResult {
  const dims: Dims = {
    age: Math.round(clamp(scoreAge(e))),
    location: Math.round(clamp(scoreLocation(e))),
    edu: Math.round(clamp(scoreEdu(e))),
    econ: Math.round(clamp(scoreEcon(e))),
    fasset: Math.round(clamp(scoreFasset(e))),
    fstruct: Math.round(clamp(scoreFstruct(e))),
    appear: Math.round(clamp(scoreAppear(e))),
    pers: Math.round(clamp(scorePers(e))),
    emo: Math.round(clamp(scoreEmo(e))),
  };
  const w = WEIGHTS[e.gender as Gender] || WEIGHTS.male;
  let r = 0;
  for (const k of Object.keys(dims)) r += dims[k] * w[k];
  r *= (MARITAL_FACTOR[e.gender as Gender] || MARITAL_FACTOR.male)[e.marital] ?? 1;
  return { total: Math.round(clamp(r)), dims };
}

// —— 五档评级 ——
export type Tier = {
  min: number;
  key: string;
  name: string;
  tag: string;
  accent: string;
  tint: string;
  desc: string;
  notes: string[];
};

export const TIERS: Tier[] = [
  {
    min: 76,
    key: "top",
    name: "被追着推的人",
    tag: "介绍人手上的稀缺号",
    accent: "#B23A48",
    tint: "#F7E9EA",
    desc: '你的资料在介绍人手里是拿来"压箱底"的那一份——不会群发，只点对点推给她认为够格的人。硬件几乎没有明显缺口，主动权基本在你这边。',
    notes: [
      '你有资格慢慢挑，但请把"挑"用在三观和相处上，而不是继续加码硬件。',
      "条件太齐整时，冲着条件来的人也最多，前三次见面留意对方在意的是你还是你的配置。",
      "市值有保质期，感情没有。别把窗口期全花在比价上。",
    ],
  },
  {
    min: 70,
    key: "good",
    name: "一推就成的优质盘",
    tag: "介绍人最爱推的类型",
    accent: "#3F5E8C",
    tint: "#E9EDF5",
    desc: '条件扎实、没有硬伤，属于介绍人开口就有底气的那一类。大多数场合主动权在你手上，偶尔的烦恼是"看着都不错，但没一个心动"。',
    notes: [
      "你能挑，但别把清单越列越长——多数遗憾不是没挑到好的，是挑的时候忘了看有没有感觉。",
      "试着把择偶标准的第一条从条件换成相处模式，命中率会明显变化。",
      '适当露出真实的、不那么"完美"的一面，条件才会变成加分项而不是屏障。',
    ],
  },
  {
    min: 63,
    key: "mid",
    name: "标准配置的实力派",
    tag: "相亲市场的中坚",
    accent: "#4F6F52",
    tint: "#E8EFE8",
    desc: "你落在相亲市场最厚的那一段：条件中等偏上，有拿得出手的地方，也有能补的地方。成败往往不取决于硬件，而取决于你怎么呈现它。",
    notes: [
      "想清楚你最强的一到两项，第一次见面就要让对方记住它们。",
      "短板里挑最容易改的先动手——形象管理和沟通方式的投入产出比远高于换工作。",
      '把"完美对象"的执念换成"匹配度"，你这一档最怕的是高不成低不就。',
    ],
  },
  {
    min: 56,
    key: "work",
    name: "需要打法的普通选手",
    tag: "硬碰硬吃亏，要迂回",
    accent: "#B7791F",
    tint: "#F7EFDF",
    desc: "按传统那套硬件表，你确实要面对竞争压力。但相亲只是渠道之一，而且是对硬件最敏感的那一种渠道——换个场子，你的分数会不一样。",
    notes: [
      "别在硬件上和人正面比，把差异化立起来：会做饭、脾气好、有手艺、能兜事，都是真实筹码。",
      "兴趣社群、同事介绍、老同学圈的成功率通常高过纯相亲，因为对方先认识的是你这个人。",
      "把提升自己当成长期的事，别当成为了相亲的临时冲刺。",
    ],
  },
  {
    min: 0,
    key: "reset",
    name: "该换个赛道了",
    tag: "别在这张表上较劲",
    accent: "#C2653A",
    tint: "#F7EAE3",
    desc: "按这套流行的硬件标准打分，你的分数不好看。但这套标准本身就窄得可疑——它只测得出能写进资料卡的东西，测不出你这个人。",
    notes: [
      "先把期望值调到和自身匹配的层次，硬往上够是这一档最大的时间黑洞。",
      '把力气从"提高市值"挪到"改善生活"，前者的回报慢，后者立刻兑现。',
      "你更适合在真实相处中被人认识，而不是在一张资料卡上被人筛选。",
    ],
  },
];

export function tierOf(total: number): Tier {
  return TIERS.find((t) => total >= t.min) || TIERS[TIERS.length - 1];
}

// —— 双画像（理想型 / 底线型） ——
const fmtMoney = (e: number) => {
  if (e >= 1e4) {
    const t = Math.round(e / 1e3) / 10;
    return `${Number.isInteger(t) ? t : t.toFixed(1)}万`;
  }
  return `${Math.max(1, Math.round(e / 1e3))}千`;
};
const wants = (t: State, k: string) => ((t.priority as string[])?.includes(k) ? 1 : 0);

export type Portrait = {
  age: string;
  income: string;
  asset: string;
  edu: string;
  job: string;
  city: string;
  looks: string;
};

export function buildPortraits(total: number, t: State): { ideal: Portrait; base: Portrait } {
  const n = t.gender as Gender;
  const r = total;
  const income = INCOME_MID[t.income] ?? 12500;
  const s: any = {};
  const o: any = {};

  // 年龄
  if (n === "female") {
    const m = t.age;
    const w = t.age + (r >= 85 ? 8 : r >= 72 ? 6 : r >= 58 ? 4 : 3);
    s.age = `${m}–${w} 岁`;
    o.age = `${Math.max(18, t.age - 1)}–${w + 2} 岁`;
  } else {
    const m = Math.max(18, t.age - (r >= 82 ? 8 : r >= 68 ? 6 : 4));
    const w = Math.max(18, t.age - (r >= 82 ? 2 : 1));
    s.age = `${m}–${w} 岁`;
    o.age = `${Math.max(18, m + 1)}–${t.age + 1} 岁`;
  }

  // 收入
  const l = 1 - (t.income / 10) * 0.85;
  const a = (m: number) => (m > 1 ? 1 + (m - 1) * l : m);
  const cap = 150000;
  const c = (m: number) => Math.min(m, cap);
  const f = wants(t, "income") * 0.25;
  if (n === "female") {
    const m = c(income * a((r >= 85 ? 3 : r >= 72 ? 2 : r >= 58 ? 1.5 : 1.2) + f));
    const w = c(income * a((r >= 85 ? 6 : r >= 72 ? 3.5 : r >= 58 ? 2.2 : 1.8) + f));
    s.income = `${fmtMoney(m)}–${fmtMoney(Math.max(w, m * 1.3))} / 月`;
    o.income = `${fmtMoney(m * 0.7)}–${fmtMoney(Math.max(w, m * 1.3))} / 月`;
  } else {
    const m = c(income * ((r >= 82 ? 0.5 : r >= 68 ? 0.4 : 0.3) + f * 0.5));
    const w = c(income * ((r >= 82 ? 1.2 : r >= 68 ? 1 : 0.8) + f * 0.5));
    s.income = `${fmtMoney(m)}–${fmtMoney(Math.max(w, m * 1.3))} / 月`;
    o.income = `${fmtMoney(m * 0.7)}–${fmtMoney(Math.max(w, m * 1.3))} / 月`;
  }

  // 资产
  if (n === "female") {
    s.asset = r >= 85 ? "本人名下有房，家庭可动用资产 200 万以上" : r >= 72 ? "自己有房或家里备好了房，另有积蓄" : r >= 58 ? "有明确的购房时间表，家里没有负债" : "有稳定积蓄，不背明显债务";
    o.asset = r >= 85 ? "有购房计划或家里能出首付，无负债" : r >= 72 ? "不硬性要求房产，但要有存款" : r >= 58 ? "没有大额负债，收入稳定" : "不欠钱，能养活自己";
  } else {
    s.asset = r >= 82 ? "家境中上，父母不需要子女补贴" : r >= 65 ? "家里情况正常，没有大额债务" : "家里没有明显的经济包袱";
    o.asset = r >= 82 ? "家里正常，没有大额债务即可" : r >= 65 ? "家里没什么负担，能自给自足" : "不背大额债务，生活能自理";
  }

  // 学历
  const g = ((): number => {
    const map: Record<string, number> = { phd: 6, master: 5, "985": 4, bachelor: 3, college: 2, other: 1 };
    return (map[t.edu] || 3) + wants(t, "edu");
  })();
  s.edu = g >= 5 ? "硕士及以上" : g >= 4 ? (r >= 78 ? "985 / 211 及以上" : "本科及以上") : g >= 3 ? "本科及以上" : g >= 2 ? "大专及以上" : "不看学历";
  o.edu = g >= 5 ? "本科及以上" : g >= 4 ? "本科及以上，不挑院校" : g >= 3 ? "大专及以上" : g >= 2 ? "学历不限，有一技之长" : "不看学历";

  // 职业
  if (n === "female") {
    s.job = r >= 85 ? "金融、大厂、外企或体制内优先" : r >= 70 ? "体制内、国企、外企、互联网都可以" : "工作稳定，收入有保障";
    o.job = r >= 70 ? "行业不限，收入稳定就行" : "有正经工作，肯往前走";
  } else {
    s.job = r >= 85 ? "体制内、医疗、教育或稳定的大公司" : r >= 70 ? "工作稳定，还有上升空间" : "行业不限，踏实肯干";
    o.job = r >= 70 ? "行业不限，能养活自己" : "有工作，性子踏实";
  }

  // 城市
  s.city = r >= 80 ? "同城，一线或新一线优先" : r >= 60 ? "同城，或愿意搬过来" : "同城，或有过来发展的打算";
  o.city = r >= 70 ? "同城，或异地但有明确过来的时间" : "同城异地都能谈";

  // 外形
  const y = wants(t, "looks");
  if (n === "female") {
    const m = (r >= 82 ? 175 : r >= 65 ? 170 : 165) + y * 3;
    s.looks = r >= 82 ? `长相在线，${m}cm 以上，形象讲究` : r >= 65 ? `外形过关，${m}cm 以上，干净得体` : `外形正常，${m}cm 以上`;
    o.looks = r >= 82 ? `外形正常，${m - 5}cm 以上，收拾干净即可` : r >= 65 ? `外形正常，${m - 2}cm 以上，不做高要求` : `外形不做硬要求，干净就行`;
  } else {
    const m = (r >= 82 ? 165 : r >= 65 ? 162 : 158) + y * 2;
    s.looks = r >= 82 ? `长相甜美或气质好，${m}cm 以上` : r >= 65 ? `外形过关，${m}cm 以上，会打扮` : `外形正常，${m}cm 以上`;
    o.looks = r >= 82 ? `外形正常，${m - 3}cm 以上` : r >= 65 ? `外形正常，不做高要求` : `外形不做硬要求，合眼缘就行`;
  }

  return { ideal: s as Portrait, base: o as Portrait };
}

// 画像字段展示顺序与标签
export const PORTRAIT_ROWS: { key: keyof Portrait; label: string }[] = [
  { key: "age", label: "年龄" },
  { key: "income", label: "收入" },
  { key: "asset", label: "资产 / 家底" },
  { key: "edu", label: "学历" },
  { key: "job", label: "职业" },
  { key: "city", label: "城市" },
  { key: "looks", label: "外形" },
];

// 权重最高的三项维度（用于报告叙述）
export function topThreeDims(gender: Gender): string[] {
  const w = WEIGHTS[gender] || WEIGHTS.male;
  return Object.keys(w)
    .sort((a, b) => w[b] - w[a])
    .slice(0, 3);
}
