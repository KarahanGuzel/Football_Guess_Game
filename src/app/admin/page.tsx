import { WhatsAppReminderButton } from "@/components/admin/whatsapp-reminder-button";
import { AdminStandingsPanel } from "@/components/admin/standings-panel";
import { AdminWeeksList } from "@/components/admin/weeks-list";
import { CreateWeekForm } from "@/components/admin/create-week-form";
import { requireAdmin } from "@/lib/auth/current-user";
import { getPublicAppUrl } from "@/lib/app-url";
import {
  getCurrentPlayableWeek,
  getStandings,
  listWeeks,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function AdminPage() {
  await requireAdmin();
  const [weeks, standings, playable] = await Promise.all([
    listWeeks(),
    getStandings(),
    getCurrentPlayableWeek(),
  ]);
  const appUrl = getPublicAppUrl();
  const openWeek = playable?.status === "open" ? playable : null;
  const lockAtLabel = openWeek?.lockAt
    ? formatDateTime(openWeek.lockAt.toISOString())
    : undefined;

  return (
    <div className="stack-lg">
      <header className="page-header">
        <h1 className="page-title">Yönetim</h1>
        <p className="page-sub">
          Manuel hafta ekleyebilir, bonus seçip yayınlayabilir, kilitleyip skor
          girebilirsin.
        </p>
      </header>

      <section className="panel reveal">
        <div className="section-head">
          <h2 className="section-title">WhatsApp hatırlatma</h2>
        </div>
        <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.9rem" }}>
          Gruba “tahminler kilitleniyor” mesajını site linkiyle açar. Telefonda
          WhatsApp paylaşım ekranı gelir.
        </p>
        {openWeek ? (
          <div className="admin-action-row">
            <WhatsAppReminderButton
              className="btn btn-primary"
              weekLabel={openWeek.week.label}
              lockAtLabel={lockAtLabel}
              appUrl={appUrl}
            />
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {openWeek.week.label}
              {lockAtLabel ? ` · kilit ${lockAtLabel}` : null}
            </span>
          </div>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Şu an yayında açık bir hafta yok. Haftayı yayınladıktan sonra buton
            aktif mesajla gelir; yine de genel link göndermek için:
          </p>
        )}
        {!openWeek ? (
          <div className="admin-action-row" style={{ marginTop: "0.85rem" }}>
            <WhatsAppReminderButton appUrl={appUrl} />
          </div>
        ) : null}
      </section>

      <CreateWeekForm />

      <section className="panel reveal">
        <div className="section-head">
          <h2 className="section-title">Haftalar</h2>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {weeks.length} hafta
          </span>
        </div>
        <AdminWeeksList weeks={weeks} />
      </section>

      <AdminStandingsPanel rows={standings} />
    </div>
  );
}
