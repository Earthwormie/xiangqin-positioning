"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HEIGHT_RANGE } from "@/lib/questions";

export default function StartPage() {
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const router = useRouter();

  const go = () => {
    if (!gender) return;
    // 把性别与对应默认身高存入 sessionStorage，问卷页读取
    const init = {
      gender,
      age: 25,
      income: 4,
      height: HEIGHT_RANGE[gender].def,
      priority: [],
    };
    sessionStorage.setItem("xq_answers", JSON.stringify(init));
    router.push("/test");
  };

  return (
    <div className="wrap">
      <header className="masthead">
        <div className="eyebrow">Section 00 · 开始之前</div>
        <h1>先确认一件事</h1>
        <p className="dek">
          这套评价体系对男女两侧的算法并不一样——年龄怎么算、房子有多重要、身高扣多少分，全都分开计。
          先选一下，后面的题会按你这一侧的规则来。
        </p>
      </header>

      <div className="panel">
        <div className="field" style={{ marginBottom: 0 }}>
          <div className="label">
            <span className="idx">00</span>
            你的性别
          </div>
          <div className="opts two">
            <button
              type="button"
              className={`opt${gender === "female" ? " on" : ""}`}
              onClick={() => setGender("female")}
            >
              女生<span className="tick">✓</span>
            </button>
            <button
              type="button"
              className={`opt${gender === "male" ? " on" : ""}`}
              onClick={() => setGender("male")}
            >
              男生<span className="tick">✓</span>
            </button>
          </div>
        </div>
      </div>

      <div className="note" style={{ marginTop: 18 }}>
        共 9 组题，约 5 分钟。每组答完点「下一组」，中途可随时返回上一组修改。最后一组提交后，立刻出报告。
      </div>

      <div className="actions" style={{ marginTop: 22 }}>
        <button className="btn" disabled={!gender} onClick={go}>
          进入第一组
        </button>
        <button className="btn ghost" onClick={() => router.push("/")}>
          返回封面
        </button>
      </div>
    </div>
  );
}
