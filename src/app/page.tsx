"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.trim()) {
      setErr("请先输入测评密码");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/start");
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "密码不正确。");
    }
  };

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="eyebrow">Marriage Market · Positioning</div>
        <h1>
          择偶定位
          <br />
          测评
        </h1>
        <p className="dek">
          先别急着找人。花五分钟，把你手里的牌摊开看清楚——你现在站在婚恋市场的哪个位置，够得上什么样的人，
          又不该在什么样的人身上继续消耗。九个维度算出真实定位，再给你两张能直接用的对照清单。
        </p>
        <div className="byline">
          <span>九维打分</span>
          <span>双画像输出</span>
          <span>约 5 分钟</span>
        </div>
      </header>

      <form onSubmit={submit} className="panel">
        <h3>输入测评密码</h3>
        <p style={{ marginBottom: 14, color: "var(--ink-soft)", fontSize: 14 }}>
          验证通过后即可开始作答，中途可随时返回修改。
        </p>
        <input
          className="input"
          type="password"
          value={pw}
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="请输入密码"
          onChange={(e) => {
            setPw(e.target.value);
            setErr("");
          }}
        />
        {err && <div className="err">{err}</div>}
        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "验证中…" : "开始测评"}
          </button>
        </div>
      </form>

      <div className="rule">
        <span>作答须知</span>
      </div>
      <div className="steps">
        <div className="stepline">
          <div className="n">一</div>
          <div className="c">
            <b>如实作答，结果才有用</b>
            这份报告的价值全在诚实上。往高了填，你只会拿到一份不属于你的清单，白白误导自己。
          </div>
        </div>
        <div className="stepline">
          <div className="n">二</div>
          <div className="c">
            <b>它测的是市场，不是你</b>
            分数衡量的是这套流行标准怎么看你，不衡量你值不值得被爱。看完当参考，别当判决。
          </div>
        </div>
        <div className="stepline">
          <div className="n">三</div>
          <div className="c">
            <b>社会价值 ≠ 婚恋价值</b>
            很多人把两者混在一起。事业强不等于在婚恋市场天然强势，这套表帮你把它们分开看。
          </div>
        </div>
        <div className="stepline">
          <div className="n">四</div>
          <div className="c">
            <b>仅供个人使用</b>
            密码与内容请勿转发、复制或倒卖。
          </div>
        </div>
      </div>
    </div>
  );
}
