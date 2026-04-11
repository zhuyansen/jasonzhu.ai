import { getDictionary, type Locale } from "@/lib/dictionaries";
import HandbookClient from "./HandbookClient";

export default async function HandbookPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  return <HandbookClient lang={lang} dict={dict} />;
}
