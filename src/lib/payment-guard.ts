// 服务端读取 payment-guard 的导出数据。只能在服务端组件里引（会把整份 JSON 打进引用它的模块）；
// 客户端组件用 @/lib/payment-guard-types 的类型，数据由页面通过 props 传入。
// 更新数据：在 payment-guard 仓库里跑 `python -m payment_guard export > <本仓库>/src/data/payment-guard.json`。
import raw from "@/data/payment-guard.json";
import type { GuardData } from "./payment-guard-types";

export function getGuardData(): GuardData {
  return raw as unknown as GuardData;
}
