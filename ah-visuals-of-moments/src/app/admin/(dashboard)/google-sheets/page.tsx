"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  FileSpreadsheet,
  Upload,
  Download,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Star,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { ImportPreviewResult, GoogleLog } from "@/types/admin";

export default function AdminGoogleSheetsPage() {
  const [activeTab, setActiveTab] = useState<"import" | "export" | "logs">("import");

  // Google Connection State
  const [configured, setConfigured] = useState(false);
  const [serviceAccountEmail, setServiceAccountEmail] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [defaultSpreadsheetId, setDefaultSpreadsheetId] = useState("");
  const [defaultSource, setDefaultSource] = useState<"database" | "env" | "none">("none");
  const [defaultTitle, setDefaultTitle] = useState<string | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(false);
  const [primarySuccess, setPrimarySuccess] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ah_google_spreadsheet_id");
    if (saved) {
      setSpreadsheetId(saved);
    }
  }, []);
  const [sheetName, setSheetName] = useState("Products");
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [accessResult, setAccessResult] = useState<{
    accessible: boolean;
    title?: string;
    sheets?: string[];
    error?: string;
  } | null>(null);

  // Import State
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Export State
  const [exportResource, setExportResource] = useState<string>("INVENTORY");
  const [exportTabTitle, setExportTabTitle] = useState("Остатки");
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Logs State
  const [logs, setLogs] = useState<GoogleLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  // Check Google service account status and fetch default spreadsheet ID
  const checkStatus = async () => {
    try {
      const res = await fetch("/api/admin/google/status");
      const data = await res.json();
      setConfigured(data.configured);
      setServiceAccountEmail(data.serviceAccountEmail);

      if (data.defaultSpreadsheetId) {
        setDefaultSpreadsheetId(data.defaultSpreadsheetId);
        setDefaultSource(data.defaultSpreadsheetSource);
        setDefaultTitle(data.defaultSpreadsheetTitle);

        // Если поле ещё не заполнено пользователем, автоматически заполняем default ID
        setSpreadsheetId((current) => {
          if (!current || current.trim() === "") {
            return data.defaultSpreadsheetId;
          }
          return current;
        });

        // Если текущий ID совпадает с default, выставляем признак primary
        if (data.defaultSpreadsheetSource === "database") {
          setIsPrimary(true);
        }
      }
    } catch {
      // Ignored
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/google/logs");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {
      // Ignored
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    loadLogs();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyAccess = async () => {
    if (!spreadsheetId.trim()) return;
    setCheckingAccess(true);
    setAccessResult(null);
    localStorage.setItem("ah_google_spreadsheet_id", spreadsheetId.trim());

    try {
      const res = await fetch(
        `/api/admin/google/status?spreadsheetId=${encodeURIComponent(spreadsheetId.trim())}`
      );
      const data = await res.json();
      setAccessResult(data.spreadsheetCheck);
      setIsPrimary(Boolean(data.isPrimary));
      if (data.defaultSpreadsheetId) {
        setDefaultSpreadsheetId(data.defaultSpreadsheetId);
        setDefaultSource(data.defaultSpreadsheetSource);
        setDefaultTitle(data.defaultSpreadsheetTitle);
      }
    } catch (err: unknown) {
      setAccessResult({
        accessible: false,
        error: err instanceof Error ? err.message : "Ошибка проверки доступа",
      });
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleSetAsPrimary = async () => {
    if (!spreadsheetId.trim()) return;
    setSettingPrimary(true);
    setPrimarySuccess(null);

    try {
      const res = await fetch("/api/admin/google/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId: spreadsheetId.trim(),
          sheetTitle: accessResult?.title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения основной таблицы");

      setDefaultSpreadsheetId(data.defaultSpreadsheetId);
      setDefaultSource("database");
      setDefaultTitle(data.defaultSpreadsheetTitle);
      setIsPrimary(true);
      setPrimarySuccess(data.message || "Таблица успешно сохранена как основная");
      setTimeout(() => setPrimarySuccess(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка назначения основной таблицы");
    } finally {
      setSettingPrimary(false);
    }
  };

  const handleResetToDefault = () => {
    if (defaultSpreadsheetId) {
      setSpreadsheetId(defaultSpreadsheetId);
      localStorage.setItem("ah_google_spreadsheet_id", defaultSpreadsheetId);
      setAccessResult(null);
      setIsPrimary(defaultSource === "database");
    }
  };

  const handleLoadPreview = async () => {
    if (!spreadsheetId.trim()) return;
    setPreviewLoading(true);
    setPreviewResult(null);
    setImportSuccess(null);

    try {
      const res = await fetch("/api/admin/google/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheet_id: spreadsheetId.trim(),
          sheet_name: sheetName.trim() || "Products",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка предпросмотра");
      setPreviewResult(data.preview);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка предпросмотра");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewResult || !spreadsheetId.trim()) return;
    setImporting(true);
    setImportSuccess(null);

    try {
      const res = await fetch("/api/admin/google/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheet_id: spreadsheetId.trim(),
          sheet_name: sheetName.trim() || "Products",
          items: previewResult.items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка импорта");

      setImportSuccess(
        `Импорт успешно завершён! Создано: ${data.created}, обновлено: ${data.updated}, пропущено ошибок/конфликтов: ${data.failed}.`
      );
      setPreviewResult(null);
      loadLogs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка импорта");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (!spreadsheetId.trim()) {
      alert("Укажите ID целевой таблицы Google Sheets");
      return;
    }

    setExporting(true);
    setExportSuccess(null);

    try {
      const res = await fetch("/api/admin/google/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheet_id: spreadsheetId.trim(),
          resource_type: exportResource,
          tab_title: exportTabTitle.trim() || "Export",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка экспорта");

      setExportSuccess(
        `Данные успешно экспортированы в таб "${exportTabTitle}"! Выгружено строк: ${data.rowsExported}.`
      );
      loadLogs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка экспорта");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Интеграция с Google Sheets" />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Google Sheets API Layer
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Контролируемый импорт с Preview и проверкой конфликтов • Прямой экспорт остатков, заказов и отчётов
          </p>
        </div>

        {/* Connection Setup Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  configured
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    Google Service Account
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      configured
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {configured ? "Ключи настроены" : "Требуются ключи в .env"}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Email сервисного аккаунта:</span>
                  <code className="font-mono text-[11px] bg-[var(--bg-elevated)] px-2 py-0.5 rounded text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    {serviceAccountEmail}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-[11px] text-[var(--accent-warm)] hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Скопировано!" : "Копировать"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] max-w-sm">
              Предоставьте доступ с правами <strong>Editor</strong> к вашей Google Таблице на указанный email сервисного аккаунта.
            </div>
          </div>

          {/* Spreadsheet ID Input & Access Verification */}
          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[var(--text-primary)]">Идентификатор таблицы (Spreadsheet ID):</span>
                {defaultSpreadsheetId && spreadsheetId.trim() === defaultSpreadsheetId ? (
                  defaultSource === "database" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Star className="w-3 h-3 fill-emerald-500" />
                      Основная таблица (БД)
                      {defaultTitle ? ` • ${defaultTitle}` : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <FileSpreadsheet className="w-3 h-3" />
                      По умолчанию из ENV
                    </span>
                  )
                ) : defaultSpreadsheetId && spreadsheetId.trim() !== defaultSpreadsheetId ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Пользовательский ID для текущей операции
                  </span>
                ) : null}
              </div>

              {defaultSpreadsheetId && spreadsheetId.trim() !== defaultSpreadsheetId && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[11px] text-[var(--accent-warm)] hover:underline flex items-center gap-1 font-medium ml-auto"
                  title="Вернуть идентификатор основной таблицы"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Вернуть основную</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Вставьте ID вашей таблицы Google Sheets (Spreadsheet ID)..."
                value={spreadsheetId}
                onChange={(e) => {
                  setSpreadsheetId(e.target.value);
                  setAccessResult(null);
                  setIsPrimary(
                    defaultSource === "database" &&
                      Boolean(defaultSpreadsheetId) &&
                      e.target.value.trim() === defaultSpreadsheetId
                  );
                }}
                className="flex-1 px-3.5 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] font-mono"
              />
              <button
                type="button"
                onClick={handleVerifyAccess}
                disabled={checkingAccess || !spreadsheetId.trim()}
                className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
              >
                {checkingAccess ? "Проверка..." : "Проверить доступ к таблице"}
              </button>
            </div>
          </div>

          {/* Success message when marked as primary */}
          {primarySuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium">{primarySuccess}</span>
            </div>
          )}

          {/* Verification feedback */}
          {accessResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                accessResult.accessible
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {accessResult.accessible ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div>
                  {accessResult.accessible ? (
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">Доступ подтверждён:</span>
                        <span>«{accessResult.title}»</span>
                      </div>
                      {accessResult.sheets && accessResult.sheets.length > 0 && (
                        <span className="text-[11px] block text-[var(--text-secondary)] mt-0.5">
                          Доступные листы: {accessResult.sheets.join(", ")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>{accessResult.error}</span>
                  )}
                </div>
              </div>

              {/* Action: Сделать основной таблицей (если доступ подтверждён) */}
              {accessResult.accessible && (
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {isPrimary ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 font-semibold text-xs text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      Основная таблица системы
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSetAsPrimary}
                      disabled={settingPrimary}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] hover:opacity-90 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                      title="Сохранить эту таблицу в базу данных как основную по умолчанию для всех будущих сессий"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{settingPrimary ? "Сохранение..." : "Сделать основной"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs: Import / Export / Logs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "import"
                ? "bg-[var(--accent-warm)] text-[var(--accent-foreground)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Импорт с предпросмотром (Preview)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "export"
                ? "bg-[var(--accent-warm)] text-[var(--accent-foreground)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Экспорт в Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "logs"
                ? "bg-[var(--accent-warm)] text-[var(--accent-foreground)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Журнал операций</span>
          </button>
        </div>

        {/* TAB 1: IMPORT WITH PREVIEW */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Параметры источника импорта
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Ожидаемые колонки: SKU | Товар | Цвет | Размер | Цена | Остаток (On Hand) | Активен
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Имя листа (например: Products)"
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)] w-48"
                  />
                  <button
                    type="button"
                    onClick={handleLoadPreview}
                    disabled={previewLoading || !spreadsheetId.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold text-xs shadow hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${previewLoading ? "animate-spin" : ""}`} />
                    <span>{previewLoading ? "Загрузка..." : "Загрузить предпросмотр"}</span>
                  </button>
                </div>
              </div>

              {importSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>

            {/* Preview Results Card */}
            {previewResult && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Результат предварительного анализа (BEFORE → AFTER)
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Источник: {previewResult.source} • Строк в файле: {previewResult.total_rows}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      disabled={importing || !previewResult.can_import}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
                      title={previewResult.can_import ? "Применить физические остатки и цены к базе данных" : "Импорт недоступен из-за ошибок в структуре данных"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{importing ? "Применение..." : "Подтвердить и применить импорт"}</span>
                    </button>
                  </div>
                </div>

                {/* Header resolution error alert */}
                {previewResult.header_error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm">Ошибка структуры колонок Google Sheets</span>
                      <span className="mt-0.5 block">{previewResult.header_error}</span>
                      <span className="mt-1 block text-[11px] text-[var(--text-secondary)]">
                        Импорт использует сопоставление по заголовкам (header-based mapping). Позиционный fallback отключен для предотвращения искажения цен и остатков.
                      </span>
                    </div>
                  </div>
                )}

                {/* Counters badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-emerald-500 font-medium">Новые товары</span>
                    <div className="text-xl font-bold text-emerald-500 mt-1">
                      {previewResult.new_count}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-center">
                    <span className="text-[10px] text-sky-500 font-medium">Обновления (Факт/Цена)</span>
                    <div className="text-xl font-bold text-sky-500 mt-1">
                      {previewResult.update_count}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-[10px] text-amber-500 font-medium">Конфликты резерва</span>
                    <div className="text-xl font-bold text-amber-500 mt-1">
                      {previewResult.conflict_count}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-[10px] text-rose-500 font-medium">Ошибки валидации</span>
                    <div className="text-xl font-bold text-rose-500 mt-1">
                      {previewResult.error_count}
                    </div>
                  </div>
                </div>

                {/* Preview Diff Table */}
                <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-muted)]">
                        <th className="py-2.5 px-3 font-semibold">Статус</th>
                        <th className="py-2.5 px-3 font-semibold font-mono">Product Code</th>
                        <th className="py-2.5 px-3 font-semibold font-mono">SKU</th>
                        <th className="py-2.5 px-3 font-semibold">Товар / Вариант</th>
                        <th className="py-2.5 px-3 font-semibold">Коллекция</th>
                        <th className="py-2.5 px-3 font-semibold">На складе (On Hand): BEFORE → AFTER</th>
                        <th className="py-2.5 px-3 font-semibold text-center text-amber-500">Резерв (Supabase)</th>
                        <th className="py-2.5 px-3 font-semibold text-center text-sky-500">Доступно: BEFORE → AFTER</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Цена (€): BEFORE → AFTER</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Активен</th>
                        <th className="py-2.5 px-3 font-semibold">Примечание</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {previewResult.items.map((item, idx) => {
                        const isNew = item.status === "NEW";
                        const onHandZero = !isNew && item.new_on_hand === 0;
                        const onHandDrop = !isNew && item.new_on_hand < item.current_on_hand;
                        const onHandRise = !isNew && item.new_on_hand > item.current_on_hand;
                        const priceChanged = !isNew && item.current_price !== item.new_price;
                        const activeChanged = !isNew && item.current_active !== item.new_active;

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-[var(--bg-elevated)]/30 ${
                              onHandZero
                                ? "bg-rose-500/5"
                                : item.status === "CONFLICT"
                                ? "bg-amber-500/5"
                                : ""
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  item.status === "NEW"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : item.status === "UPDATE"
                                    ? "bg-sky-500/10 text-sky-500 border-sky-500/20"
                                    : item.status === "CONFLICT"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                }`}
                              >
                                {item.status === "NEW"
                                  ? "Новый"
                                  : item.status === "UPDATE"
                                  ? "Обновление"
                                  : item.status === "CONFLICT"
                                  ? "Конфликт"
                                  : "Ошибка"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent-warm)]">
                              {item.product_code}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium">{item.sku}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-[var(--text-primary)]">{item.product_name}</div>
                              <div className="text-[11px] text-[var(--text-secondary)]">
                                {item.color} / {item.size}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              {item.collection_name ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    item.collection_type === "LIMITED"
                                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  }`}
                                >
                                  {item.collection_name} {item.collection_type ? `(${item.collection_type})` : ""}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[var(--text-muted)] italic">Не указана</span>
                              )}
                            </td>

                            {/* On Hand Diff with strong visual distinction */}
                            <td className="py-2.5 px-3 font-mono">
                              {isNew ? (
                                <span className="text-emerald-500 font-bold">
                                  — → {item.new_on_hand}
                                </span>
                              ) : onHandZero ? (
                                <span className="inline-flex items-center gap-1 text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                                  {item.current_on_hand} → 0 (Обнуление склада!)
                                </span>
                              ) : onHandDrop ? (
                                <span className="inline-flex items-center gap-1 text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {item.current_on_hand} → {item.new_on_hand} (↓ {item.new_on_hand - item.current_on_hand})
                                </span>
                              ) : onHandRise ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {item.current_on_hand} → {item.new_on_hand} (+{item.new_on_hand - item.current_on_hand})
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">
                                  {item.current_on_hand} → {item.new_on_hand} (Без изм.)
                                </span>
                              )}
                            </td>

                            {/* Reserved column: untouched by Sheets */}
                            <td className="py-2.5 px-3 text-center font-mono font-semibold text-amber-500">
                              {isNew ? (
                                "—"
                              ) : (
                                <span title="Резерв фиксируется исключительно Supabase и не перезаписывается таблицей">
                                  {item.current_reserved}
                                </span>
                              )}
                            </td>

                            {/* Available column diff */}
                            <td className="py-2.5 px-3 text-center font-mono font-medium">
                              {isNew ? (
                                <span className="text-sky-400 font-bold">{item.new_available}</span>
                              ) : (
                                <span>
                                  {item.current_available} →{" "}
                                  <strong className="text-sky-400">{item.new_available}</strong>
                                </span>
                              )}
                            </td>

                            {/* Price Diff */}
                            <td className="py-2.5 px-3 text-right font-mono">
                              {isNew ? (
                                <span className="text-emerald-400 font-bold">€{item.new_price}</span>
                              ) : priceChanged ? (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  €{item.current_price} → €{item.new_price}
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">
                                  €{item.current_price} → €{item.new_price}
                                </span>
                              )}
                            </td>

                            {/* Active Diff */}
                            <td className="py-2.5 px-3 text-center">
                              {isNew ? (
                                <span className="text-emerald-400 font-medium">
                                  {item.new_active ? "Да" : "Нет"}
                                </span>
                              ) : activeChanged ? (
                                <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  {item.current_active ? "Да" : "Нет"} → {item.new_active ? "Да" : "Нет"}
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)]">
                                  {item.current_active ? "Да" : "Нет"}
                                </span>
                              )}
                            </td>

                            {/* Note / Error Reason */}
                            <td className="py-2.5 px-3 text-[11px] text-[var(--text-muted)] max-w-xs">
                              {item.reason || "Готов к импорту"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === "export" && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-5 max-w-2xl shadow-sm">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Экспорт данных в Google Sheets
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Выгрузка будет создана или обновлена в виде отдельного таба (worksheet) внутри подключенной таблицы
              </p>
            </div>

            {exportSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{exportSuccess}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Объект для экспорта
                </label>
                <select
                  value={exportResource}
                  onChange={(e) => {
                    setExportResource(e.target.value);
                    if (e.target.value === "INVENTORY") setExportTabTitle("Остатки");
                    else if (e.target.value === "ORDERS") setExportTabTitle("Заказы");
                    else if (e.target.value === "STOCK_MOVEMENTS") setExportTabTitle("Движения склада");
                    else if (e.target.value === "MONTHLY_REPORT") setExportTabTitle("Отчет за период");
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                >
                  <option value="INVENTORY">Текущие остатки (Inventory: Факт, Резерв, Доступно)</option>
                  <option value="ORDERS">Заказы клиентов (Orders: позиции, клиенты, статусы)</option>
                  <option value="STOCK_MOVEMENTS">Движения склада (Stock Movements: полная история)</option>
                  <option value="MONTHLY_REPORT">Сводный отчет за период (поступления, списания, продажи)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Название листа в Google Таблице (Tab Title)
                </label>
                <input
                  type="text"
                  value={exportTabTitle}
                  onChange={(e) => setExportTabTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-warm)]"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || !spreadsheetId.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-warm)] text-[var(--accent-foreground)] font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{exporting ? "Выгрузка данных..." : "Экспортировать в Google Sheets"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGS */}
        {activeTab === "logs" && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
            {logs.length === 0 && !logsLoading ? (
              <div className="p-12 text-center text-xs text-[var(--text-muted)]">
                Журнал операций Google Sheets пока пуст.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-muted)]">
                      <th className="py-3 px-4 font-semibold">Дата / Время</th>
                      <th className="py-3 px-4 font-semibold">Операция</th>
                      <th className="py-3 px-4 font-semibold">Ресурс</th>
                      <th className="py-3 px-4 font-semibold">Статус</th>
                      <th className="py-3 px-4 font-semibold">Назначение / Источник</th>
                      <th className="py-3 px-4 font-semibold text-center">Создано / Обновлено / Ошибок</th>
                      <th className="py-3 px-4 font-semibold">Автор</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--bg-elevated)]/30">
                        <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("ru-RU")}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {log.operation_type === "IMPORT" ? "Импорт" : "Экспорт"}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {log.resource_type}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : log.status === "PARTIAL"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}
                          >
                            {log.status === "SUCCESS" ? "Успешно" : log.status === "PARTIAL" ? "Частично" : "Ошибка"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)] max-w-xs truncate">
                          {log.source_destination}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="text-emerald-500 font-semibold">{log.items_created}</span> /{" "}
                          <span className="text-sky-500 font-semibold">{log.items_updated}</span> /{" "}
                          <span className="text-rose-500 font-semibold">{log.items_failed}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[var(--text-secondary)]">
                          {log.performed_by || "Admin"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
