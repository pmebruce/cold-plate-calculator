# 冷板均溫計算器

冷板平均溫度與出口液溫估算 PWA。支援水、EG 50 vol%、PG 25 vol%，並顯示逐步公式與代入數值。

## 發佈

在 Settings → Pages 將 Source 選為 GitHub Actions；推送至 `main` 會自動部署至 <https://pmebruce.github.io/cold-plate-calculator/>。

本機執行：`npm ci`，再執行 `GITHUB_PAGES=1 NEXT_PUBLIC_BASE_PATH=/cold-plate-calculator npm run build`。

本工具以單一矩形流道、四周均勻受熱為假設。冷板均溫指平均流道壁溫，不含底板厚度、接觸熱阻及熱擴散。
