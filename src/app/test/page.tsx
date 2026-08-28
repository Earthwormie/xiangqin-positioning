"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SCORING_GROUPS, WANT_GROUP, Group, initialAnswers } from "@/lib/questions";
import { WECHAT_STEP } from "@/lib/config";
import FieldView from "./FieldView";

const ALL_GROUPS: Group[] = [...SCORING_GROUPS, WANT_GROUP];
// 总步数 = 9 组题 + 1 个微信留资步骤
const TOTAL_STEPS = ALL_GROUPS.length + 1;
const WECHAT_IDX = ALL_GROUPS.length; // 最后一步的索引

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers());
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wechat, setWechat] = useState("");
  const [wechatMode, setWechatMode] = useState("optional"); // optional | required
  const [stepErr, setStepErr] = useState("");

  // 载入 start 页存的性别/默认值 + 拉取微信必填模式
  useEffect(() => {
    const raw = sessionStorage.getItem("xq_answers");
    if (!raw) {
      router.replace("/start");
      return;
    }
    setAnswers(JSON.parse(raw));
    setReady(true);
    fetch("/api/report-config")
      .then((r) => r.json())
      .then((c) => setWechatMode(c.wechatMode || "optional"))
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idx]);

  const set = (key: string, val: any) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: val };
      sessionStorage.setItem("xq_answers", JSON.stringify(next));
      return next;
    });
  };

  if (!ready) return <div className="wrap" />;

  const isWechatStep = idx === WECHAT_IDX;
  const pct = Math.round(((idx + 1) / TOTAL_STEPS) * 100);

  const submit = async () => {
    if (wechatMode === "required" && !wechat.trim()) {
      setStepErr("留个微信号才能生成报告哦～");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, wechat: wechat.trim() || null }),
    });
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem("xq_result", JSON.stringify(data));
      router.push("/result");
    } else {
      setSubmitting(false);
      const d = await res.json().catch(() => ({}));
      alert(d.error || "提交失败，请重试。");
    }
  };

  const prev = () => {
    if (idx > 0) setIdx(idx - 1);
    else router.push("/start");
  };

  // ===== 微信留资步骤 =====
  if (isWechatStep) {
    return (
      <div className="wrap">
        <div className="prog">
          <div className="meta">
            <span>{WECHAT_STEP.kicker}</span>
            <b>
              {String(idx + 1).padStart(2, "0")} / {String(TOTAL_STEPS).padStart(2, "0")}
            </b>
          </div>
          <div className="track">
            <div className="fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="panel" style={{ marginTop: 8 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>免费领取</div>
          <h3 style={{ fontSize: 24 }}>{WECHAT_STEP.title}</h3>
          <p style={{ color: "var(--ink-soft)", fontSize: 15, margin: "12px 0 18px", lineHeight: 1.7 }}>
            {WECHAT_STEP.desc}
          </p>
          <input
            className="input"
            value={wechat}
            placeholder={WECHAT_STEP.placeholder}
            onChange={(e) => {
              setWechat(e.target.value);
              setStepErr("");
            }}
          />
          <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 8 }}>
            {wechatMode === "required" ? WECHAT_STEP.requiredHint : WECHAT_STEP.optionalHint}
          </div>
          {stepErr && <div className="err">{stepErr}</div>}
          <div className="actions">
            <button className="btn gold" disabled={submitting} onClick={submit}>
              {submitting ? "正在生成…" : WECHAT_STEP.cta}
            </button>
            <button className="btn ghost" onClick={prev} disabled={submitting}>
              返回上一组
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 普通题组 =====
  const group = ALL_GROUPS[idx];
  const visibleFields = group.fields.filter((f) => !f.when || f.when(answers));
  const complete = visibleFields.every((f) => {
    const v = answers[f.key];
    if (f.type === "slider") return v != null;
    if (f.type === "multi") return Array.isArray(v) && v.length > 0;
    return !!v;
  });

  const next = () => setIdx(idx + 1);

  return (
    <div className="wrap">
      <div className="prog">
        <div className="meta">
          <span>{group.kicker}</span>
          <b>
            {String(idx + 1).padStart(2, "0")} / {String(TOTAL_STEPS).padStart(2, "0")}
          </b>
        </div>
        <div className="track">
          <div className="fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="qhead">
        <h2>{group.title}</h2>
        {group.note && <div className="sub">{group.note}</div>}
      </div>

      {visibleFields.map((f, i) => (
        <FieldView key={f.key} field={f} index={String(i + 1).padStart(2, "0")} state={answers} set={set} />
      ))}

      <div className="actions">
        <button className="btn" disabled={!complete} onClick={next}>
          下一组
        </button>
        <button className="btn ghost" onClick={prev}>
          {idx > 0 ? "返回上一组" : "返回"}
        </button>
        {!complete && <div className="share-hint">本组还有题目未作答</div>}
      </div>
    </div>
  );
}
