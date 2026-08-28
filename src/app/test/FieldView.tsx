"use client";

import { Field, HEIGHT_RANGE, INCOME_LABELS, Gender } from "@/lib/questions";

type Props = {
  field: Field;
  index: string;
  state: Record<string, any>;
  set: (key: string, val: any) => void;
};

export default function FieldView({ field, index, state, set }: Props) {
  const { key, type, label } = field;

  if (type === "slider") {
    const isHeight = key === "height";
    const range = isHeight
      ? HEIGHT_RANGE[(state.gender as Gender) || "female"]
      : { min: field.min ?? 0, max: field.max ?? 100 };
    const val = state[key];
    const display = field.labels
      ? field.labels[val]
      : isHeight
        ? val <= range.min
          ? `${val}cm 及以下`
          : val >= range.max
            ? `${val}cm 及以上`
            : `${val}cm`
        : `${val}${field.unit || ""}`;
    const left = field.labels ? field.labels[0] : `${range.min}${field.unit || ""}`;
    const right = field.labels ? field.labels[field.labels.length - 1] : `${range.max}${field.unit || ""}`;

    return (
      <div className="field">
        <div className="label">
          <span className="idx">{index}</span>
          {label}
        </div>
        <div className="slider">
          <div className="val">{display}</div>
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={field.step || 1}
            value={val}
            onChange={(e) => set(key, +e.target.value)}
            aria-label={label}
          />
          <div className="ends">
            <span>{left}</span>
            <span>{right}</span>
          </div>
        </div>
      </div>
    );
  }

  const isMulti = type === "multi";
  const current = state[key];
  const isOn = (v: string) => (isMulti ? (current || []).includes(v) : current === v);
  const toggle = (v: string) => {
    if (!isMulti) {
      set(key, v);
      return;
    }
    const arr: string[] = current || [];
    if (arr.includes(v)) {
      set(key, arr.filter((x) => x !== v));
    } else if (!field.max_select || arr.length < field.max_select) {
      set(key, [...arr, v]);
    }
  };

  return (
    <div className="field">
      <div className="label">
        <span className="idx">{index}</span>
        {label}
      </div>
      <div className={`opts${field.cols === 2 ? " two" : ""}`}>
        {field.options!.map((o) => (
          <button
            key={o.v}
            type="button"
            className={`opt${isOn(o.v) ? " on" : ""}`}
            onClick={() => toggle(o.v)}
            aria-pressed={isOn(o.v)}
          >
            {o.t}
            <span className="tick">✓</span>
          </button>
        ))}
      </div>
    </div>
  );
}
