import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";
import { SCORING_GROUPS, WANT_GROUP, DIMENSIONS, Field } from "@/lib/questions";

// 把所有题目字段展开成「答案值 → 中文文案」的映射，导出时显示人话
function buildLabelMaps() {
  const optionLabel: Record<string, Record<string, string>> = {};
  const fieldLabel: Record<string, string> = {};
  const collect = (f: Field) => {
    fieldLabel[f.key] = f.label;
    if (f.options) {
      optionLabel[f.key] = {};
      for (const o of f.options) optionLabel[f.key][o.v] = o.t;
    }
  };
  for (const g of SCORING_GROUPS) for (const f of g.fields) collect(f);
  for (const f of WANT_GROUP.fields) collect(f);
  return { optionLabel, fieldLabel };
}

function csvCell(v: string): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rows = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
  const { optionLabel, fieldLabel } = buildLabelMaps();

  // 列：编号、时间、微信、想要、性别、总分、评级 + 9维分 + 全部答案字段
  const answerKeys: string[] = [];
  for (const g of SCORING_GROUPS) for (const f of g.fields) if (!answerKeys.includes(f.key)) answerKeys.push(f.key);
  for (const f of WANT_GROUP.fields) if (!answerKeys.includes(f.key)) answerKeys.push(f.key);
  const dimKeys = Object.keys(DIMENSIONS);

  const header = [
    "报告编号",
    "提交时间",
    "微信号",
    "最想解决",
    "性别",
    "总分",
    "评级",
    ...dimKeys.map((k) => `分-${DIMENSIONS[k].short}`),
    ...answerKeys.map((k) => fieldLabel[k] || k),
    "IP",
  ];

  const lines = [header.map(csvCell).join(",")];

  for (const r of rows) {
    const ans = JSON.parse(r.answers || "{}");
    const dims = JSON.parse(r.dims || "{}");
    const render = (key: string): string => {
      const val = ans[key];
      if (val == null) return "";
      if (Array.isArray(val)) return val.map((v) => optionLabel[key]?.[v] || v).join(" / ");
      if (optionLabel[key]?.[val] != null) return optionLabel[key][val];
      // 滑块：身高/年龄/收入档
      if (key === "income") return `第${val}档`;
      return String(val);
    };
    const cells = [
      r.code,
      new Date(r.createdAt).toLocaleString("zh-CN", { hour12: false }),
      r.wechat || "",
      r.wechatWant || "",
      r.gender === "male" ? "男" : "女",
      String(r.total),
      r.tierName,
      ...dimKeys.map((k) => String(dims[k] ?? "")),
      ...answerKeys.map(render),
      r.ip || "",
    ];
    lines.push(cells.map(csvCell).join(","));
  }

  // BOM 让 Excel 正确识别 UTF-8 中文
  const csv = "﻿" + lines.join("\r\n");
  const fname = `xiangqin_submissions_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fname}"`,
    },
  });
}
