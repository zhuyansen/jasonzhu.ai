"use client";

import { HEARD_FROM_COPY, HEARD_FROM_NOTE_MAX, HEARD_FROM_OPTIONS } from "@/lib/heard-from";

/**
 * 「从哪知道这里」选填下拉，选了「其他」才多一个补充说明框（规则见 src/lib/heard-from.ts）。
 * 订阅框：问题本身就是下拉框的第一项，不多占一行；结账框（labeled）：上面一行小标题，和别的字段一个样。
 * 值由表单自己存，提交时用 heardFromBody() 带上；不选也能提交。
 */
export default function HeardFromField({
  lang,
  value,
  note,
  onValueChange,
  onNoteChange,
  controlClassName,
  labeled = false,
  className = "",
}: {
  lang: string;
  value: string;
  note: string;
  onValueChange: (value: string) => void;
  onNoteChange: (note: string) => void;
  /** 下拉框和说明框共用的外观（边框、圆角、内边距、字号、焦点），跟着所在表单的输入框走；宽度这里管 */
  controlClassName: string;
  labeled?: boolean;
  className?: string;
}) {
  const isEn = lang === "en";
  const t = isEn ? HEARD_FROM_COPY.en : HEARD_FROM_COPY.zh;

  const select = (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      aria-label={labeled ? undefined : t.question}
      className={`bg-white ${labeled ? "w-full" : "w-full sm:w-auto sm:shrink-0"} ${value ? "text-gray-900" : "text-gray-500"} ${controlClassName}`}
    >
      <option value="">{labeled ? t.pick : t.question}</option>
      {HEARD_FROM_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {isEn ? o.en : o.zh}
        </option>
      ))}
    </select>
  );

  const noteInput = value === "other" && (
    <input
      type="text"
      value={note}
      onChange={(e) => onNoteChange(e.target.value)}
      maxLength={HEARD_FROM_NOTE_MAX}
      autoComplete="off"
      placeholder={t.notePlaceholder}
      aria-label={t.notePlaceholder}
      className={`min-w-0 bg-white ${labeled ? "w-full" : "w-full sm:flex-1"} ${controlClassName}`}
    />
  );

  if (labeled) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1.5">{t.question}</span>
          {select}
        </label>
        {noteInput}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      {select}
      {noteInput}
    </div>
  );
}
