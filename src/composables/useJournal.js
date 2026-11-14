import { onMounted } from "vue";

export default function useJournal() {
  onMounted(() => {
      const STORE = "investing-psychology-journal-v2";
      const LEGACY = "investing-psychology-trade-plan-v1";
      const $ = (s, root = document) => root.querySelector(s);
      const $$ = (s, root = document) => [...root.querySelectorAll(s)];
      const today = () => {
        const d = new Date();
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      };
      const id = () =>
        globalThis.crypto?.randomUUID?.() ||
        `trade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const stamp = () => new Date().toISOString();
      let trades = load();
      const localSnapshot = structuredClone(trades);
      let editingId = null;
      const CLOUD_ENV = "disciplinary-rabbit-d0bm123b1750";
      const CLOUD_KEY =
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY4Y2ZjNDAyLTZiYjgtNDA3ZC1iYWRjLTkyZDRkMTg3NDUyMSJ9.eyJpc3MiOiJodHRwczovL2Rpc2NpcGxpbmFyeS1yYWJiaXQtZDBibTEyM2IxNzUwLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJkaXNjaXBsaW5hcnktcmFiYml0LWQwYm0xMjNiMTc1MCIsImV4cCI6NDA5ODIyMjg1MSwiaWF0IjoxNzk0NTM5NjUxLCJub25jZSI6IlNiM3NnUEdTUVZxRDZHUWJaNlNEdWciLCJhdF9oYXNoIjoiU2Izc2dQR1NRVnFENkdRYlo2U0R1ZyIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJkaXNjaXBsaW5hcnktcmFiYml0LWQwYm0xMjNiMTc1MCIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJyb2xlIjoiYW5vbiIsImlzX2Fub255bW91cyI6dHJ1ZSwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiYW5vbnltb3VzIiwicHJvdmlkZXJzIjpbImFub255bW91cyJdfSwidXNlcl9tZXRhZGF0YSI6eyJuYW1lIjoiQW5vbnltb3VzIn0sInVzZXJfdHlwZSI6IiIsImNsaWVudF90eXBlIjoiY2xpZW50X3VzZXIiLCJpc19zeXN0ZW1fYWRtaW4iOmZhbHNlfQ.c75M8ekxTrsv-lAH3Q6jKK5g3gddFbJLpfa3k-x4QuaByKxhgpRArtC16I_I8CSbL5L6YkPHO-n5fW3gTgxdfCiU1brgEnziVXcq9vwIIPcWRrYk47sbX9wVpv5wNaZBrr7vpN21jXHrd3nib0TYZwyiQsLQ9Pi5dhUbFa4Pjb1JlnD9io8NLfkuLfMeWvCE7as_CpWcY8Ks5LH9xna8obP5A5QMXWSlkcBF1609PWimJi_ChvFerEFFPt3sCWGeFpiIGmGcSeuX0aJVCNaGRIJaPHrFUbJbCnStWLoEEbIgAR-ogNzu0ke6b-i2yo7iu9whLqoDA4wtZcacMxxTaw";
      const CLOUD_AUTH_API =
        // disciplinary-rabbit-d0bm123b1750-1302180810.tcloudbaseapp.com
        "https://disciplinary-rabbit-d0bm123b1750.api.tcloudbasegateway.com";
      const CLOUD_REST_APIS = [
        "https://disciplinary-rabbit-d0bm123b1750.api.tcloudbasegateway.com",
      ];
      const CLOUD_SESSION_KEY = "investing-psychology-cloud-session-v1";
      let cloudSession = null;
      try {
        cloudSession = JSON.parse(
          localStorage.getItem(CLOUD_SESSION_KEY) || "null",
        );
      } catch {}
      let cloudUser = null;
      let pendingVerification = null;
      function cloudMessage(message) {
        $("#cloud-status").textContent = message;
      }
      function cloudReport(error) {
        cloudMessage(
          "云端同步失败：" +
            (error?.message || error) +
            "。本机浏览器记录仍保留。",
        );
      }
      function requireCloud(result) {
        if (result?.error) throw result.error;
        return result?.data;
      }
      function saveCloudSession(tokens, user) {
        cloudSession = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + Number(tokens.expires_in || 7200) * 1000,
          user,
        };
        cloudUser = user;
        localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(cloudSession));
        return cloudSession;
      }
      function clearCloudSession() {
        cloudSession = null;
        cloudUser = null;
        localStorage.removeItem(CLOUD_SESSION_KEY);
      }
      async function cloudFetch(
        base,
        path,
        { method = "GET", body, anonymous = false } = {},
      ) {
        const token = anonymous
          ? CLOUD_KEY
          : (await cloudAccessToken()) || CLOUD_KEY;
        // Anonymous auth endpoints use CloudBase's public HTTP API shape and
        // should not send apikey/Authorization headers (which trigger CORS preflight).
        const headers = anonymous
          ? { Accept: "application/json" }
          : {
              Accept: "application/json",
              apikey: CLOUD_KEY,
              Authorization: "Bearer " + token,
            };
        if (body !== undefined && !anonymous)
          headers["Content-Type"] = "application/json";
        let response;
        try {
          response = await fetch(base + path, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
          });
        } catch (error) {
          throw new Error(
            "浏览器无法连接 CloudBase 接口：" +
              (error?.message || "网络请求失败"),
          );
        }
        const raw = await response.text();
        let data = null;
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
        }
        if (!response.ok || data?.error) {
          const detail =
            data?.error_description ||
            data?.message ||
            data?.error ||
            "HTTP " + response.status;
          throw new Error("HTTP " + response.status + ": " + detail);
        }
        return data;
      }
      async function cloudAccessToken() {
        if (!cloudSession?.access_token) return null;
        if (Number(cloudSession.expires_at || 0) > Date.now() + 60000)
          return cloudSession.access_token;
        if (!cloudSession.refresh_token) {
          clearCloudSession();
          return null;
        }
        try {
          const refreshed = await cloudFetch(CLOUD_AUTH_API, "/auth/v1/token", {
            method: "POST",
            body: {
              grant_type: "refresh_token",
              refresh_token: cloudSession.refresh_token,
            },
            anonymous: true,
          });
          saveCloudSession(refreshed, cloudSession.user);
          return cloudSession.access_token;
        } catch (error) {
          clearCloudSession();
          throw new Error("登录已过期，请重新登录。" + (error?.message || ""));
        }
      }
      async function authResult(fn) {
        try {
          return { data: await fn(), error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
      function userFromTokens(tokens, login) {
        let sub = "";
        try {
          sub =
            JSON.parse(
              atob(
                tokens.access_token
                  .split(".")[1]
                  .replace(/-/g, "+")
                  .replace(/_/g, "/"),
              ),
            ).sub || "";
        } catch {}
        return {
          id: tokens.sub || sub,
          username: login || "",
          email: String(login || "").includes("@") ? login : "",
        };
      }
      const cloudAuth = {
        getSession: () =>
          authResult(async () => {
            const token = await cloudAccessToken();
            return {
              session: token
                ? { user: cloudSession.user, access_token: token }
                : null,
            };
          }),
        signInWithPassword: (credentials) =>
          authResult(async () => {
            const login = credentials.username || credentials.email;
            const tokens = await cloudFetch(CLOUD_AUTH_API, "/auth/v1/signin", {
              method: "POST",
              body: { username: login, password: credentials.password },
              anonymous: true,
            });
            const user = userFromTokens(tokens, login);
            const session = saveCloudSession(tokens, user);
            return { user, session };
          }),
        getVerification: ({ email }) =>
          authResult(() =>
            cloudFetch(CLOUD_AUTH_API, "/auth/v1/verification", {
              method: "POST",
              body: { email, target: "ANY" },
              anonymous: true,
            }),
          ),
        verify: ({ verification_id, verification_code }) =>
          authResult(() =>
            cloudFetch(CLOUD_AUTH_API, "/auth/v1/verification/verify", {
              method: "POST",
              body: { verification_id, verification_code },
              anonymous: true,
            }),
          ),
        signUp: ({ email, password, verification_token }) =>
          authResult(async () => {
            const tokens = await cloudFetch(CLOUD_AUTH_API, "/auth/v1/signup", {
              method: "POST",
              body: { email, password, verification_token },
              anonymous: true,
            });
            const user = userFromTokens(tokens, email);
            const session = saveCloudSession(tokens, user);
            return { user, session };
          }),
        signOut: () =>
          authResult(async () => {
            clearCloudSession();
            return {};
          }),
      };
      function makeCloudQuery(table) {
        let method = "GET",
          payload,
          params = new URLSearchParams(),
          executed = null;
        const query = {
          select(columns = "*") {
            method = "GET";
            params.set("select", columns);
            return this;
          },
          order(column, { ascending = true } = {}) {
            params.set("order", column + "." + (ascending ? "asc" : "desc"));
            return this;
          },
          insert(value) {
            method = "POST";
            payload = value;
            return this.execute();
          },
          update(value) {
            method = "PATCH";
            payload = value;
            return this;
          },
          delete() {
            method = "DELETE";
            return this;
          },
          eq(column, value) {
            params.set(column, "eq." + String(value));
            return this.execute();
          },
          execute() {
            if (executed) return executed;
            executed = (async () => {
              const suffix = params.toString();
              const path =
                "/v1/rdb/rest/" +
                encodeURIComponent(table) +
                (suffix ? "?" + suffix : "");
              const options = { method, body: payload };
              let lastError;
              for (const base of CLOUD_REST_APIS) {
                try {
                  return {
                    data: await cloudFetch(base, path, options),
                    error: null,
                  };
                } catch (error) {
                  lastError = error;
                  if (
                    !/Failed to fetch|NetworkError|HTTP (404|502|503)/.test(
                      String(error?.message || ""),
                    )
                  )
                    throw error;
                }
              }
              throw (
                lastError || new Error("无法连接 CloudBase PostgreSQL 接口")
              );
            })();
            return executed;
          },
          then(resolve, reject) {
            return this.execute().then(resolve, reject);
          },
        };
        return query;
      }
      const cloudDb = { from: makeCloudQuery };
      function cloudTradeRow(t) {
        return {
          id: t.id,
          trade_date: t.date,
          asset: t.asset,
          direction: t.direction || "",
          timeframe: t.timeframe || "",
          thesis: t.thesis || "",
          entry_trigger: t.entry || "",
          invalidation: t.invalidation || "",
          position_size: t.size || "",
          planned_max_loss: t.maxRisk,
          exit_plan: t.exitPlan || "",
          status: t.status || "planned",
          psychology: t.psychology || {},
          review: t.review || "",
          updated_at: t.updatedAt || stamp(),
        };
      }
      function fromCloudTrade(r, actions) {
        return {
          id: r.id,
          date: r.trade_date,
          asset: r.asset,
          direction: r.direction || "",
          timeframe: r.timeframe || "",
          thesis: r.thesis || "",
          entry: r.entry_trigger || "",
          invalidation: r.invalidation || "",
          size: r.position_size || "",
          maxRisk:
            r.planned_max_loss == null ? null : Number(r.planned_max_loss),
          exitPlan: r.exit_plan || "",
          status: r.status || "planned",
          psychology: r.psychology || {},
          review: r.review || "",
          createdAt: r.created_at || stamp(),
          updatedAt: r.updated_at || r.created_at || stamp(),
          actions: actions
            .filter((a) => a.trade_id === r.id)
            .map((a) => ({
              id: a.id,
              at: a.occurred_at,
              type: a.action_type,
              note: a.note || "",
              pnl: a.realized_pnl == null ? null : Number(a.realized_pnl),
            })),
        };
      }
      async function cloudLoad() {
        const [tr, ar] = await Promise.all([
          cloudDb
            .from("trade_records")
            .select("*")
            .order("created_at", { ascending: false }),
          cloudDb
            .from("trade_actions")
            .select("*")
            .order("occurred_at", { ascending: false }),
        ]);
        const records = requireCloud(tr) || [],
          actions = requireCloud(ar) || [];
        trades = records.map((r) => fromCloudTrade(r, actions));
        persist();
        render();
        cloudMessage(
          `已连接云端：${
            cloudUser?.email || cloudUser?.username || "当前账户"
          }，共 ${trades.length} 条记录。`,
        );
        $("#cloud-login-controls").classList.add("hidden");
        $("#cloud-user-controls").classList.remove("hidden");
      }
      async function cloudWriteTrade(t, isNew = false) {
        if (!cloudUser) return;
        const q = cloudDb.from("trade_records");
        const result = isNew
          ? await q.insert(cloudTradeRow(t))
          : await q.update(cloudTradeRow(t)).eq("id", t.id);
        requireCloud(result);
      }
      async function cloudWriteAction(t, a) {
        if (!cloudUser) return;
        requireCloud(
          await cloudDb.from("trade_actions").insert({
            id: a.id,
            trade_id: t.id,
            action_type: a.type,
            note: a.note || "",
            realized_pnl: a.pnl,
            occurred_at: a.at,
          }),
        );
        requireCloud(
          await cloudDb
            .from("trade_records")
            .update({ status: t.status, updated_at: t.updatedAt })
            .eq("id", t.id),
        );
      }
      async function cloudStart(user) {
        cloudUser = user;
        await cloudLoad();
      }
      async function cloudLogin() {
        const login = $("#cloud-user").value.trim(),
          password = $("#cloud-password").value;
        if (!login || !password) {
          cloudMessage("请输入用户名或邮箱，以及密码。");
          return;
        }
        $("#cloud-login").disabled = true;
        cloudMessage("正在登录并读取云端记录…");
        try {
          const credentials = login.includes("@")
            ? { email: login, password }
            : { username: login, password };
          const result = await cloudAuth.signInWithPassword(credentials);
          const data = requireCloud(result);
          if (!data?.user) throw new Error("登录没有返回用户信息");
          $("#cloud-password").value = "";
          await cloudStart(data.user);
        } catch (error) {
          cloudReport(error);
        } finally {
          $("#cloud-login").disabled = false;
        }
      }
      async function cloudRegister() {
        const email = $("#cloud-user").value.trim(),
          password = $("#cloud-password").value;
        if (!email.includes("@")) {
          cloudMessage("注册时请在“用户名或邮箱”中填写邮箱地址。");
          return;
        }
        if (!password) {
          cloudMessage("请先设置登录密码。");
          return;
        }
        const button = $("#cloud-register");
        button.disabled = true;
        try {
          if (!pendingVerification) {
            const raw = await cloudAuth.getVerification({ email });
            if (raw?.error) throw raw.error;
            const v = raw?.data || raw;
            if (!v?.verification_id)
              throw new Error(
                "没有取得验证码编号，请确认身份认证中已启用邮箱验证码。",
              );
            pendingVerification = { id: v.verification_id, email };
            $("#cloud-otp").classList.remove("hidden");
            button.textContent = "验证并完成注册";
            cloudMessage(
              `验证码已发送到 ${email}，输入邮件中的验证码后再点“验证并完成注册”。`,
            );
            return;
          }
          const code = $("#cloud-otp").value.trim();
          if (!code) {
            cloudMessage("请输入邮箱收到的验证码。");
            return;
          }
          const verifiedRaw = await cloudAuth.verify({
            verification_id: pendingVerification.id,
            verification_code: code,
          });
          if (verifiedRaw?.error) throw verifiedRaw.error;
          const verified = verifiedRaw?.data || verifiedRaw;
          const signupRaw = await cloudAuth.signUp({
            email: pendingVerification.email,
            verification_code: code,
            verification_token: verified.verification_token,
            password,
          });
          if (signupRaw?.error) throw signupRaw.error;
          let user = (signupRaw?.data || signupRaw)?.user;
          if (!user) {
            const loginRaw = await cloudAuth.signInWithPassword({
              email: pendingVerification.email,
              password,
            });
            if (loginRaw?.error) throw loginRaw.error;
            user = (loginRaw?.data || loginRaw)?.user;
          }
          pendingVerification = null;
          $("#cloud-otp").value = "";
          $("#cloud-otp").classList.add("hidden");
          button.textContent = "注册新账号";
          $("#cloud-password").value = "";
          await cloudStart(user);
          cloudMessage("账号注册成功，已登录并连接云端。");
        } catch (error) {
          cloudReport(error);
        } finally {
          button.disabled = false;
        }
      }
      async function cloudImportLocal() {
        if (!cloudUser) return;
        const pending = localSnapshot.filter(
          (t) => t?.id && !trades.some((c) => c.id === t.id),
        );
        if (!pending.length) {
          cloudMessage("没有待导入的本机记录。");
          return;
        }
        const button = $("#cloud-import-local");
        button.disabled = true;
        let count = 0;
        try {
          for (const t of pending) {
            await cloudWriteTrade(t, true);
            for (const a of t.actions || []) await cloudWriteAction(t, a);
            count++;
          }
          await cloudLoad();
          cloudMessage(`已导入 ${count} 条本机记录到云端。`);
        } catch (error) {
          cloudReport(error);
        } finally {
          button.disabled = false;
        }
      }
      async function cloudInit() {
        if (!CLOUD_AUTH_API || !CLOUD_REST_APIS.length) {
          cloudMessage("CloudBase 环境配置缺失。");
          return;
        }
        try {
          const result = await cloudAuth.getSession();
          if (result?.error) throw result.error;
          if (result?.data?.session?.user)
            await cloudStart(result.data.session.user);
        } catch (error) {
          cloudReport(error);
        }
      }

      function load() {
        try {
          const current = JSON.parse(localStorage.getItem(STORE) || "null");
          if (Array.isArray(current)) return current;
          const old = JSON.parse(localStorage.getItem(LEGACY) || "null");
          if (
            old &&
            Object.values(old).some((v) => v !== "" && v !== false && v != null)
          ) {
            const migrated = [
              {
                id: id(),
                createdAt: stamp(),
                date: old["trade-date"] || today(),
                asset: old.instrument || "待补标的",
                direction: "",
                timeframe: "",
                thesis: old.reason || "",
                entry: old.entry || "",
                invalidation: old.invalid || "",
                size: "",
                maxRisk: null,
                exitPlan: old.exit || "",
                status: "planned",
                psychology: {
                  anchor: !!old["anchor-check"],
                  regret: !!old["regret-check"],
                  evidence: !!old["evidence-check"],
                  flatCheck: !!old["urge-check"],
                },
                actions: [],
                review: old.review || "",
                migrationNote:
                  "从旧版单条表单迁移；请核对并补充仓位、最大风险与方向。",
              },
            ];
            localStorage.setItem(STORE, JSON.stringify(migrated));
            return migrated;
          }
        } catch {}
        return [];
      }
      function persist() {
        try {
          localStorage.setItem(STORE, JSON.stringify(trades));
          return true;
        } catch {
          alert("浏览器存储失败。请导出备份后清理空间，或使用其他浏览器。");
          return false;
        }
      }
      function esc(value = "") {
        return String(value).replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[c]),
        );
      }
      function money(n) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(n) || 0);
      }
      function pnlOf(t) {
        return (t.actions || []).reduce(
          (s, a) => s + (Number.isFinite(Number(a.pnl)) ? Number(a.pnl) : 0),
          0,
        );
      }
      function statusLabel(s) {
        return (
          {
            planned: "计划中",
            open: "持仓中",
            closed: "已结束",
            cancelled: "已取消",
          }[s] || "计划中"
        );
      }
      function actionLabel(a) {
        return (
          {
            entry: "执行进场",
            add: "加仓",
            reduce: "减仓",
            stop: "调整止损",
            take: "部分止盈",
            exit: "完全退出",
            stopped: "止损退出",
            reassess: "重新评估",
            cancel: "取消计划",
            note: "备注",
          }[a] || a
        );
      }
      function renderSummary() {
        const active = trades.filter(
          (t) => t.status === "planned" || t.status === "open",
        ).length;
        const net = trades.reduce((s, t) => s + pnlOf(t), 0);
        const losses = trades.reduce(
          (s, t) =>
            s +
            (t.actions || []).reduce(
              (a, e) => a + Math.max(0, -(Number(e.pnl) || 0)),
              0,
            ),
          0,
        );
        const risk = trades
          .filter((t) => t.status === "open")
          .reduce((s, t) => s + (Number(t.maxRisk) || 0), 0);
        $("#active-count").textContent = active;
        const netEl = $("#net-pnl");
        netEl.textContent = money(net);
        netEl.className = `metric-value ${
          net > 0 ? "positive" : net < 0 ? "negative" : ""
        }`;
        $("#loss-total").textContent = money(losses);
        $("#open-risk").textContent = money(risk);
        $("#history-count").textContent = trades.length;
      }
      function render() {
        renderSummary();
        const query = $("#search").value.trim().toLowerCase();
        const filter = $("#status-filter").value;
        const sorted = [...trades]
          .filter(
            (t) =>
              (filter === "all" || t.status === filter) &&
              (!query || JSON.stringify(t).toLowerCase().includes(query)),
          )
          .sort((a, b) =>
            $("#sort-filter").value === "newest"
              ? (b.createdAt || "").localeCompare(a.createdAt || "")
              : (a.createdAt || "").localeCompare(b.createdAt || ""),
          );
        const list = $("#trade-list");
        if (!sorted.length) {
          list.innerHTML =
            '<div class="empty"><strong>还没有匹配的记录</strong><span>新建计划后，它会一直保留在历史记录中。</span></div>';
          return;
        }
        list.innerHTML = sorted
          .map((t) => {
            const pnl = pnlOf(t);
            const actions = [...(t.actions || [])].sort((a, b) =>
              b.at.localeCompare(a.at),
            );
            const badgeClass =
              t.status === "open"
                ? "open"
                : t.status === "closed"
                ? "closed"
                : t.status === "cancelled"
                ? "cancelled"
                : "planned";
            const tags = [
              t.direction,
              t.timeframe,
              t.size ? `仓位 ${t.size}` : "",
              Number(t.maxRisk) > 0 ? `最大风险 ${money(t.maxRisk)}` : "",
            ].filter(Boolean);
            return `<article class="panel trade-card" data-id="${esc(t.id)}">
          <div class="trade-top"><div><div class="trade-name"><h3>${esc(
            t.asset || "未命名标的",
          )}</h3><span class="badge ${badgeClass}">${statusLabel(
              t.status,
            )}</span>${
              t.direction ? `<span class="tag">${esc(t.direction)}</span>` : ""
            }</div><div class="trade-date">计划日期 ${esc(
              t.date || "未填写",
            )} · ${actions.length} 条后续记录</div></div>
            <div class="trade-stats"><div><div class="metric-label">本笔已实现</div><div class="pnl ${
              pnl > 0 ? "positive" : pnl < 0 ? "negative" : ""
            }">${money(
              pnl,
            )}</div></div><div><div class="metric-label">累计亏损</div><div class="pnl negative">${money(
              (t.actions || []).reduce(
                (s, a) => s + Math.max(0, -(Number(a.pnl) || 0)),
                0,
              ),
            )}</div></div></div></div>
          <div class="trade-meta">${tags
            .map((x) => `<span class="tag">${esc(x)}</span>`)
            .join("")}</div>
          <div class="trade-controls"><button class="secondary" data-action="edit" type="button">编辑计划</button><button class="danger" data-action="delete" type="button">删除记录</button></div>
          <details class="trade-details"><summary>计划详情与操作流水</summary>
            <div class="detail-grid">
              ${detail("交易理由", t.thesis)}${detail(
              "进场触发",
              t.entry,
            )}${detail("判断失效 / 止损", t.invalidation)}${detail(
              "退出 / 重新评估",
              t.exitPlan,
            )}${detail("下单前心理检查", psychText(t.psychology))}${detail(
              "事后复盘",
              t.review,
            )}${t.migrationNote ? detail("迁移提醒", t.migrationNote) : ""}
            </div>
            ${
              t.status === "closed" || t.status === "cancelled"
                ? ""
                : `<h4 class="action-title">追加后续操作</h4><form class="action-form" data-action-form="${esc(
                    t.id,
                  )}">
              <div><label>操作类型</label><select name="type"><option value="entry">执行进场</option><option value="add">加仓</option><option value="reduce">减仓</option><option value="stop">调整止损</option><option value="take">部分止盈</option><option value="exit">完全退出</option><option value="stopped">止损退出</option><option value="reassess">重新评估</option><option value="cancel">取消计划</option><option value="note">备注</option></select></div>
              <div class="wide"><label>操作说明</label><textarea name="note" placeholder="发生了什么？为什么这样处理？" required></textarea></div>
              <div><label>本次已实现盈亏 USD（可空）</label><input name="pnl" type="number" step="0.01" placeholder="亏损填负数"></div><button class="primary" type="submit">追加记录</button>
            </form>`
            }
            <div class="timeline">${
              actions.length
                ? actions
                    .map(
                      (a) =>
                        `<div class="event"><div class="event-time">${formatTime(
                          a.at,
                        )}</div><div><strong>${esc(
                          actionLabel(a.type),
                        )}</strong>${
                          a.note
                            ? `<div class="event-note">${esc(a.note)}</div>`
                            : ""
                        }</div><div class="event-pnl ${
                          Number(a.pnl) > 0
                            ? "positive"
                            : Number(a.pnl) < 0
                            ? "negative"
                            : ""
                        }">${
                          a.pnl == null || a.pnl === "" ? "" : money(a.pnl)
                        } <button class="event-remove" data-action="remove-event" data-event-id="${esc(
                          a.id,
                        )}" type="button" title="删除这条操作">×</button></div></div>`,
                    )
                    .join("")
                : '<div class="empty" style="padding:17px">还没有后续操作。进场、调整、退出和复盘都可追加在这里。</div>'
            }</div>
          </details></article>`;
          })
          .join("");
      }
      function detail(label, value) {
        return `<div class="detail-cell"><strong>${label}</strong><div>${
          value ? esc(value) : '<span style="color:#9aa39d">未填写</span>'
        }</div></div>`;
      }
      function psychText(p = {}) {
        const names = {
          anchor: "价格锚定",
          regret: "错失收益 / 追单冲动",
          evidence: "反面证据",
          flatCheck: "空仓检验",
        };
        return Object.keys(names)
          .map((k) => `${names[k]}：${p[k] ? "已检查" : "未勾选"}`)
          .join("\n");
      }
      function formatTime(s) {
        try {
          return new Intl.DateTimeFormat("zh-CN", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(s));
        } catch {
          return s || "";
        }
      }
      function setTab(id) {
        $$(".tab").forEach((b) =>
          b.classList.toggle("active", b.dataset.tab === id),
        );
        $$(".view").forEach((v) => v.classList.toggle("active", v.id === id));
      }
      const positionList = $("#position-list");
      function addPosition(values = {}) {
        const row = document.createElement("div");
        row.className = "position-row";
        row.innerHTML = `<label>品种<input data-key="asset" placeholder="BTC / XAG" required value="${esc(values.asset || "")}"></label>
          <label>方向<select data-key="direction"><option value="">选择</option><option>做多</option><option>做空</option><option>观察 / 未决定</option></select></label>
          <label>仓位 / 名义金额<input data-key="size" placeholder="数量 / USD"></label>
          <label>进场价<input data-key="entryPrice" inputmode="decimal" placeholder="可选" value="${esc(values.entryPrice || values.entry?.replace("进场价 ", "") || "")}"></label>
          <label>TP<input data-key="takeProfit" inputmode="decimal" placeholder="止盈价" value="${esc(values.takeProfit || values.exitPlan?.replace("止盈价 ", "") || "")}"></label>
          <label>SL<input data-key="stopLoss" inputmode="decimal" placeholder="止损价" value="${esc(values.stopLoss || values.invalidation?.replace("止损价 ", "") || "")}"></label>
          <label>最大风险 USD<input data-key="maxRisk" type="number" min="0" step="0.01" placeholder="可选" value="${esc(values.maxRisk ?? "")}"></label>
          <button type="button" class="quiet remove-position" aria-label="删除品种">删除</button>`;
        row.querySelector('[data-key="direction"]').value = values.direction || "";
        row.querySelector('[data-key="size"]').value = values.size || "";
        row.querySelector(".remove-position").addEventListener("click", () => {
          if (positionList.children.length > 1) row.remove();
        });
        positionList.append(row);
        return row;
      }
      $("#add-position").addEventListener("click", () => addPosition());
      function resetForm() {
        editingId = null;
        $("#trade-form").reset();
        $("#trade-date").value = today();
        positionList.innerHTML = "";
        addPosition();
        $("#form-title").textContent = "新建一笔交易";
        $("#save-trade").textContent = "保存交易计划";
        $("#cancel-edit").classList.add("hidden");
      }
      function startEdit(t) {
        editingId = t.id;
        const f = $("#trade-form");
        f.date.value = t.date || "";
        f.timeframe.value = t.timeframe || "";
        f.thesis.value = t.thesis || "";
        positionList.innerHTML = "";
        addPosition(t);
        f.anchor.checked = !!t.psychology?.anchor;
        f.regret.checked = !!t.psychology?.regret;
        f.evidence.checked = !!t.psychology?.evidence;
        f.flatCheck.checked = !!t.psychology?.flatCheck;
        $("#form-title").textContent = "编辑交易计划";
        $("#save-trade").textContent = "保存修改";
        $("#cancel-edit").classList.remove("hidden");
        setTab("new-view");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      $("#trade-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.currentTarget;
        const shared = {
          date: f.date.value,
          timeframe: f.timeframe.value.trim(),
          thesis: f.thesis.value.trim(),
          psychology: {
            anchor: f.anchor.checked,
            regret: f.regret.checked,
            evidence: f.evidence.checked,
            flatCheck: f.flatCheck.checked,
          },
        };
        const rows = [...positionList.querySelectorAll(".position-row")];
        const items = rows.map((row) => {
          const value = (key) => row.querySelector(`[data-key="${key}"]`).value.trim();
          const entryPrice = value("entryPrice");
          const takeProfit = value("takeProfit");
          const stopLoss = value("stopLoss");
          return { ...shared, asset: value("asset"), direction: value("direction"), size: value("size"),
            entry: entryPrice ? `进场价 ${entryPrice}` : "",
            invalidation: stopLoss ? `止损价 ${stopLoss}` : "",
            exitPlan: takeProfit ? `止盈价 ${takeProfit}` : "",
            maxRisk: value("maxRisk") === "" ? null : Number(value("maxRisk")),
          };
        }).filter((item) => item.asset);
        if (!items.length) return;
        const isNew = !editingId;
        const savedTrades = [];
        if (editingId) {
          const saved = trades.find((x) => x.id === editingId);
          if (saved) { Object.assign(saved, items[0], { updatedAt: stamp() }); savedTrades.push(saved); }
          $("#form-status").textContent = "计划已更新，原有操作流水保留。";
        } else {
          for (const item of items) {
            const saved = { ...item, id: id(), createdAt: stamp(), status: "planned", actions: [], review: "" };
            trades.unshift(saved); savedTrades.push(saved);
          }
          $("#form-status").textContent = `已保存 ${savedTrades.length} 条独立交易计划。`;
        }
        if (persist()) {
          render();
          resetForm();
          if (cloudUser && savedTrades.length)
            Promise.all(savedTrades.map((saved) => cloudWriteTrade(saved, isNew)))
              .then(() => cloudMessage("交易计划已保存并同步到云端。"))
              .catch(cloudReport);
          setTimeout(() => ($("#form-status").textContent = ""), 3500);
        }
      });
      $("#cancel-edit").addEventListener("click", resetForm);
      $("#trade-form").addEventListener("reset", () =>
        setTimeout(() => {
          if (!editingId) $("#trade-date").value = today();
        }, 0),
      );
      document.addEventListener("click", (e) => {
        const tab = e.target.closest("[data-tab]");
        if (tab) {
          setTab(tab.dataset.tab);
          return;
        }
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const card = btn.closest("[data-id]");
        if (!card) return;
        const t = trades.find((x) => x.id === card.dataset.id);
        if (!t) return;
        if (btn.dataset.action === "edit") startEdit(t);
        if (
          btn.dataset.action === "delete" &&
          confirm(`删除 ${t.asset} 的整笔记录及其操作流水？此操作无法撤销。`)
        ) {
          trades = trades.filter((x) => x.id !== t.id);
          persist();
          render();
          if (cloudUser)
            cloudDb
              .from("trade_records")
              .delete()
              .eq("id", t.id)
              .then(requireCloud)
              .then(() => cloudMessage("云端记录已删除。"))
              .catch(cloudReport);
        }
        if (
          btn.dataset.action === "remove-event" &&
          confirm("删除这条操作及其盈亏记录？")
        ) {
          const eventId = btn.dataset.eventId;
          t.actions = t.actions.filter((a) => a.id !== eventId);
          persist();
          render();
          if (cloudUser)
            cloudDb
              .from("trade_actions")
              .delete()
              .eq("id", eventId)
              .then(requireCloud)
              .then(() => cloudMessage("云端操作流水已删除。"))
              .catch(cloudReport);
        }
      });
      document.addEventListener("submit", (e) => {
        const form = e.target.closest("[data-action-form]");
        if (!form) return;
        e.preventDefault();
        const t = trades.find((x) => x.id === form.dataset.actionForm);
        if (!t) return;
        const fd = new FormData(form);
        const type = String(fd.get("type"));
        const raw = String(fd.get("pnl")).trim();
        const ev = {
          id: id(),
          at: stamp(),
          type,
          note: String(fd.get("note")).trim(),
          pnl: raw === "" ? null : Number(raw),
        };
        t.actions.push(ev);
        t.updatedAt = stamp();
        if (type === "entry" || type === "add") t.status = "open";
        if (type === "exit" || type === "stopped") t.status = "closed";
        if (type === "cancel") t.status = "cancelled";
        if (persist()) {
          render();
          if (cloudUser)
            cloudWriteAction(t, ev)
              .then(() => cloudMessage("后续操作已同步到云端。"))
              .catch(cloudReport);
        }
      });
      ["search", "status-filter", "sort-filter"].forEach((x) =>
        $("#" + x).addEventListener(
          x === "search" ? "input" : "change",
          render,
        ),
      );
      $("#export-btn").addEventListener("click", () => {
        const blob = new Blob(
          [
            JSON.stringify(
              {
                schema: "investing-psychology-journal-v2",
                exportedAt: stamp(),
                trades,
              },
              null,
              2,
            ),
          ],
          { type: "application/json;charset=utf-8" },
        );
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `交易日志备份-${today()}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
      $("#import-btn").addEventListener("click", () =>
        $("#import-file").click(),
      );
      $("#import-file").addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const data = JSON.parse(await file.text());
          const incoming = Array.isArray(data) ? data : data.trades;
          if (!Array.isArray(incoming)) throw new Error("备份格式不正确");
          const ids = new Set(trades.map((t) => t.id));
          const fresh = incoming.filter((t) => t && t.id && !ids.has(t.id));
          if (!fresh.length) {
            alert("备份中没有新的记录。");
            return;
          }
          trades = [...fresh, ...trades];
          if (persist()) {
            render();
            alert(`已导入 ${fresh.length} 条记录。`);
          }
        } catch (err) {
          alert(`导入失败：${err.message}`);
        } finally {
          e.target.value = "";
        }
      });
      $("#cloud-login").addEventListener("click", cloudLogin);
      $("#cloud-register").addEventListener("click", cloudRegister);
      $("#cloud-password").addEventListener("keydown", (e) => {
        if (e.key === "Enter") cloudLogin();
      });
      $("#cloud-import-local").addEventListener("click", cloudImportLocal);
      $("#cloud-logout").addEventListener("click", async () => {
        try {
          const result = await cloudAuth.signOut();
          if (result?.error) throw result.error;
          cloudUser = null;
          trades = structuredClone(localSnapshot);
          persist();
          render();
          $("#cloud-user-controls").classList.add("hidden");
          $("#cloud-login-controls").classList.remove("hidden");
          cloudMessage("已退出云端账户；本机原有记录仍保留。");
        } catch (error) {
          cloudReport(error);
        }
      });
      $("#trade-date").value = today();
      addPosition();
      render();
      cloudInit();
    });
}
