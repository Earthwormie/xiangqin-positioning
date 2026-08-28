"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DIMENSIONS } from "@/lib/questions";
import { TIERS, PORTRAIT_ROWS, topThreeDims, Portrait, Dims } from "@/lib/scoring";

type ResultData = {
  code: string;
  total: number;
  dims: Dims;
  tierKey: string;
  ideal: Portrait;
  base: Portrait;
};

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [hookTitle, setHookTitle] = useState("");
  const [hookBody, setHookBody] = useState<string[]>([]);
  const [qr, setQr] = useState<string>("");
  const [showQr, setShowQr] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("xq_result");
    const ansRaw = sessionStorage.getItem("xq_answers");
    if (!raw) {
      router.replace("/start");
      return;
    }
    setData(JSON.parse(raw));
    if (ansRaw) setGender(JSON.parse(ansRaw).gender || "female");
    fetch("/api/report-config")
      .then((r) => r.json())
      .then((c) => {
        setHookTitle(c.hookTitle || "");
        setHookBody(Array.isArray(c.hookBody) ? c.hookBody : []);
        setQr(c.qrImage);
        setShowQr(c.showQr !== false);
      })
      .catch(() => {});
  }, [router]);

  if (!data) return <div className="wrap report" />;

  const tier = TIERS.find((t) => t.key === data.tierKey) || TIERS[TIERS.length - 1];
  const top3 = topThreeDims(gender);
  const dimEntries = Object.keys(DIMENSIONS);

  // 引流二维码模块（可复用；后台可整块隐藏）
  const qrModule = showQr ? (
    <div className="cta-card">
      <h3>{hookTitle}</h3>
      <div className="cta-lines">
        {hookBody.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      <div className="qr-box">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="添加情感分析师微信" />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
            }}
          >
            二维码
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="wrap report">
      <header className="masthead" style={{ paddingBottom: 0 }}>
        <div className="eyebrow">你的定位报告</div>
      </header>

      {/* 评级 + 总分 */}
      <div className="tier-card" style={{ background: tier.tint }}>
        <div className="tier-tag" style={{ color: tier.accent }}>
          {tier.tag}
        </div>
        <div className="tier-name" style={{ color: tier.accent }}>
          {tier.name}
        </div>
        <div className="tier-score" style={{ color: tier.accent }}>
          {data.total}
          <small> / 100</small>
        </div>
        <div className="tier-desc">{tier.desc}</div>
      </div>

      {/* 引流二维码模块 —— 放在九维打分上方 */}
      {qrModule}

      {/* 九维打分 */}
      <div className="sec-title">九维打分</div>
      <div className="sec-sub">
        {gender === "female" ? "女性" : "男性"}这一侧，权重最高的三项依次是{" "}
        {top3.map((k) => DIMENSIONS[k].short).join("、")}。
      </div>
      <div className="dim-list">
        {dimEntries.map((k) => {
          const score = data.dims[k];
          const info = DIMENSIONS[k];
          return (
            <div className="dim-row" key={k}>
              <div className="dim-head">
                <span className="nm">
                  {info.name}
                  {top3.includes(k) && (
                    <span style={{ color: "var(--gold)", fontSize: 12, marginLeft: 6 }}>· 高权重</span>
                  )}
                </span>
                <span className="sc" style={{ color: info.color }}>
                  {score}
                </span>
              </div>
              <div className="dim-bar">
                <i style={{ width: `${score}%`, background: info.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 双画像 */}
      <div className="sec-title">你的双画像</div>
      <div className="sec-sub">按你的综合条件与择偶取向，反推出的两条边界。</div>
      <div className="portraits">
        <div className="portrait ideal">
          <h4>理想型</h4>
          <div className="cap">够得上的上限</div>
          {PORTRAIT_ROWS.map((r) => (
            <div className="prow" key={r.key}>
              <span className="k">{r.label}</span>
              <span className="v">{data.ideal[r.key]}</span>
            </div>
          ))}
        </div>
        <div className="portrait base">
          <h4>底线型</h4>
          <div className="cap">不该再让的下限</div>
          {PORTRAIT_ROWS.map((r) => (
            <div className="prow" key={r.key}>
              <span className="k">{r.label}</span>
              <span className="v">{data.base[r.key]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="match-note">
        理想型是你在当前条件下可以争取的上限，底线型是维持双方对等的下限。真正属于你的匹配带在这两张清单之间——
        高于底线型就值得见一面，接近理想型就别再挑剔细枝末节。实际相亲里上下浮动 10 到 15 分都算正常，别把它当成硬性筛选器。
      </div>

      {/* 给你的建议 */}
      <div className="sec-title">给你的三句话</div>
      <div className="advice">
        {tier.notes.map((n, i) => (
          <div className="ai" key={i}>
            <span className="d">{i + 1}</span>
            <span>{n}</span>
          </div>
        ))}
      </div>

      <div className="actions" style={{ marginTop: 22 }}>
        <button
          className="btn ghost"
          onClick={() => {
            sessionStorage.removeItem("xq_result");
            router.push("/start");
          }}
        >
          重新测一次
        </button>
      </div>

      <div className="disclaimer">
        本测评仅供参考，衡量的是当下这套流行的相亲标准，不衡量你作为一个人的价值。
        <br />
        数据仅用于生成报告与分析师咨询，不作他用。
      </div>
    </div>
  );
}
