"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginPw, setLoginPw] = useState("");
  const [loginErr, setLoginErr] = useState("");

  // 配置状态
  const [userPassword, setUserPassword] = useState("");
  const [newUserPw, setNewUserPw] = useState("");
  const [newAdminPw, setNewAdminPw] = useState("");
  const [hookTitle, setHookTitle] = useState("");
  const [hookBody, setHookBody] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [wechatMode, setWechatMode] = useState("optional");
  const [showQr, setShowQr] = useState(true);
  const [msg, setMsg] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [stats, setStats] = useState<{ total: number; withWechat: number } | null>(null);

  const loadSettings = async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const d = await res.json();
      setUserPassword(d.userPassword);
      setHookTitle(d.hookTitle || "");
      setHookBody(Array.isArray(d.hookBody) ? d.hookBody.join("\n") : d.hookBody || "");
      setQrImage(d.qrImage);
      setWechatMode(d.wechatMode || "optional");
      setShowQr(d.showQr !== false);
      setAuthed(true);
    }
    const st = await fetch("/api/admin/stats");
    if (st.ok) setStats(await st.json());
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: loginPw }),
    });
    if (res.ok) {
      setLoginErr("");
      await loadSettings();
    } else {
      const d = await res.json().catch(() => ({}));
      setLoginErr(d.error || "密码不正确");
    }
  };

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 3000);
  };

  const saveUserPw = async () => {
    if (!newUserPw.trim()) return flash("请输入新的测评密码");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPassword: newUserPw.trim() }),
    });
    if (res.ok) {
      setUserPassword(newUserPw.trim());
      setNewUserPw("");
      flash("测评密码已更新 ✓");
    } else flash("更新失败");
  };

  const saveAdminPw = async () => {
    if (!newAdminPw.trim()) return flash("请输入新的管理员密码");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminPassword: newAdminPw.trim() }),
    });
    if (res.ok) {
      setNewAdminPw("");
      flash("管理员密码已更新 ✓");
    } else {
      const d = await res.json().catch(() => ({}));
      flash(d.error || "更新失败");
    }
  };

  const saveHook = async () => {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hookTitle, hookBody }),
    });
    if (res.ok) {
      flash("引流文案已保存 ✓");
    } else flash("保存失败");
  };

  const saveWechatMode = async (v: string) => {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wechatMode: v }),
    });
    if (res.ok) {
      setWechatMode(v);
      flash(v === "required" ? "已设为：必填微信号 ✓" : "已设为：微信号选填 ✓");
    }
  };

  const saveShowQr = async (v: boolean) => {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showQr: v }),
    });
    if (res.ok) {
      setShowQr(v);
      flash(v ? "报告页已显示二维码 ✓" : "报告页已隐藏二维码 ✓");
    }
  };

  const uploadQr = async () => {
    if (!qrFile) return flash("请先选择图片");
    const fd = new FormData();
    fd.append("qr", qrFile);
    const res = await fetch("/api/admin/qr", { method: "POST", body: fd });
    if (res.ok) {
      const d = await res.json();
      setQrImage(d.qrImage);
      setQrFile(null);
      flash("二维码已更新 ✓");
    } else {
      const d = await res.json().catch(() => ({}));
      flash(d.error || "上传失败");
    }
  };

  // ===== 登录界面 =====
  if (!authed) {
    return (
      <div className="wrap" style={{ maxWidth: 440 }}>
        <header className="masthead">
          <div className="eyebrow">Admin</div>
          <h1 style={{ fontSize: 30 }}>后台管理</h1>
        </header>
        <form onSubmit={login} className="panel">
          <h3>管理员登录</h3>
          <p style={{ marginBottom: 14, color: "var(--ink-soft)", fontSize: 14 }}>
            请输入管理员密码（与用户测评密码不同）。
          </p>
          <input
            className="input"
            type="password"
            value={loginPw}
            placeholder="管理员密码"
            onChange={(e) => {
              setLoginPw(e.target.value);
              setLoginErr("");
            }}
          />
          {loginErr && <div className="err">{loginErr}</div>}
          <div className="actions">
            <button className="btn" type="submit">
              登录
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ===== 后台主界面 =====
  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <header className="masthead" style={{ paddingBottom: 8 }}>
        <div className="eyebrow">Admin · 后台管理</div>
        <h1 style={{ fontSize: 30 }}>三件事，都在这</h1>
      </header>

      {msg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            zIndex: 100,
            fontSize: 14,
          }}
        >
          {msg}
        </div>
      )}

      {/* 数据概览 + 导出 */}
      <div className="panel">
        <h3>① 用户数据</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 6 }}>
          目前共收到 <b style={{ color: "var(--rose-deep)" }}>{stats?.total ?? "…"}</b> 份测评
          {stats ? `，其中 ${stats.withWechat} 份留下了微信号。` : "。"}
        </p>
        <p style={{ color: "var(--ink-faint)", fontSize: 13, marginTop: 8 }}>
          导出的表格包含每个用户的报告编号、微信号、想解决的问题、全部答题内容、九维分数与总分。用户加你微信时报编号，即可对上这份记录。
        </p>
        <div className="actions">
          <a className="btn gold" href="/api/admin/export" download>
            一键导出全部数据（CSV / Excel 可打开）
          </a>
        </div>
      </div>

      {/* 密码 */}
      <div className="panel">
        <h3>② 密码管理</h3>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>用户测评密码</div>
          <div style={{ fontSize: 13, color: "var(--ink-faint)", marginBottom: 8 }}>
            当前：<b style={{ color: "var(--rose-deep)" }}>{userPassword}</b>（用户进入测评时需要输入）
          </div>
          <input
            className="input"
            value={newUserPw}
            placeholder="输入新的测评密码"
            onChange={(e) => setNewUserPw(e.target.value)}
          />
          <div className="actions">
            <button className="btn" onClick={saveUserPw}>
              修改测评密码
            </button>
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>管理员密码（登录本后台用）</div>
          <input
            className="input"
            type="password"
            value={newAdminPw}
            placeholder="输入新的管理员密码（至少 4 位）"
            onChange={(e) => setNewAdminPw(e.target.value)}
          />
          <div className="actions">
            <button className="btn ghost" onClick={saveAdminPw}>
              修改管理员密码
            </button>
          </div>
        </div>
      </div>

      {/* 二维码 */}
      <div className="panel">
        <h3>③ 引流二维码</h3>
        <p style={{ color: "var(--ink-faint)", fontSize: 13, margin: "8px 0 14px" }}>
          报告页底部展示的二维码。换成你的真实微信/企微二维码即可。
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImage} alt="当前二维码" style={{ width: 120, height: 120, objectFit: "contain" }} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 8 }}>当前二维码 ↑</div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setQrFile(e.target.files?.[0] || null)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={uploadQr} disabled={!qrFile}>
            上传并替换二维码
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>报告页展示二维码 + 引导语</div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 2 }}>
              {showQr ? "当前：展示（引流开启）" : "当前：隐藏（报告页只出纯结果）"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => saveShowQr(!showQr)}
            style={{
              flex: "0 0 auto",
              width: 56,
              height: 30,
              borderRadius: 999,
              border: "none",
              background: showQr ? "var(--rose)" : "#ccc",
              position: "relative",
              transition: "background 0.2s",
            }}
            aria-pressed={showQr}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: showQr ? 29 : 3,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      {/* 引流文案编辑 */}
      <div className="panel">
        <h3>④ 引流文案</h3>
        <p style={{ color: "var(--ink-faint)", fontSize: 14, margin: "8px 0 14px" }}>
          报告页二维码上方的引导文案，可自由编辑。正文换行分段。
        </p>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>标题</div>
        <input
          className="input"
          value={hookTitle}
          placeholder="引流标题"
          onChange={(e) => setHookTitle(e.target.value)}
        />
        <div style={{ fontSize: 14, fontWeight: 600, margin: "16px 0 6px" }}>正文内容</div>
        <textarea
          className="input"
          value={hookBody}
          placeholder="引流正文，每段换行"
          rows={8}
          style={{ resize: "vertical", lineHeight: 1.7 }}
          onChange={(e) => setHookBody(e.target.value)}
        />
        <div className="actions">
          <button className="btn" onClick={saveHook}>
            保存引流文案
          </button>
        </div>
      </div>

      {/* 最后一题：微信号选填/必填 */}
      <div className="panel">
        <h3>⑤ 最后一题：留微信号</h3>
        <p style={{ color: "var(--ink-faint)", fontSize: 13, margin: "8px 0 14px" }}>
          问卷最后一步引导用户留微信号领资料。可设为「选填」（不填也能出报告）或「必填」（填了才能出报告）。
        </p>
        <div className="wg-opts" style={{ display: "grid", gap: 8 }}>
          <button
            type="button"
            className={`opt${wechatMode === "optional" ? " on" : ""}`}
            style={{ flexDirection: "column", alignItems: "flex-start" }}
            onClick={() => saveWechatMode("optional")}
          >
            <div style={{ fontWeight: 700 }}>
              选填
              {wechatMode === "optional" && <span style={{ color: "var(--rose)", marginLeft: 8 }}>· 使用中</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 400 }}>
              不填微信号也能点「领取报告」，转化损失最小
            </div>
          </button>
          <button
            type="button"
            className={`opt${wechatMode === "required" ? " on" : ""}`}
            style={{ flexDirection: "column", alignItems: "flex-start" }}
            onClick={() => saveWechatMode("required")}
          >
            <div style={{ fontWeight: 700 }}>
              必填
              {wechatMode === "required" && <span style={{ color: "var(--rose)", marginLeft: 8 }}>· 使用中</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 400 }}>
              必须留微信号才能生成报告，拿量最多但会劝退一部分人
            </div>
          </button>
        </div>
      </div>

      <div className="actions" style={{ marginTop: 20 }}>
        <a className="btn ghost" href="/api/admin/logout">
          退出登录
        </a>
      </div>
    </div>
  );
}
