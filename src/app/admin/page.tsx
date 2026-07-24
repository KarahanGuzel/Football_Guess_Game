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
import { getConfiguredWhatsAppPhone } from "@/lib/whatsapp";

export default async function AdminPage() {
  await requireAdmin();
  const [weeks, standings, playable] = await Promise.all([
    listWeeks(),
    getStandings(),
    getCurrentPlayableWeek(),
  ]);
  const appUrl = getPublicAppUrl();
  const whatsappPhone = getConfiguredWhatsAppPhone();
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
          Mesaj hazır gelir (kilit uyarısı + site linki). WhatsApp bir gruba
          otomatik bağlanamaz — butona basınca{" "}
          {whatsappPhone
            ? `ayarlı numarayı (${whatsappPhone}) açar.`
            : "sohbet seçici açılır; grup sohbetinizi sen seçersin."}
        </p>
        {openWeek ? (
          <div className="admin-action-row">
            <WhatsAppReminderButton
              className="btn btn-primary"
              weekLabel={openWeek.week.label}
              lockAtLabel={lockAtLabel}
              appUrl={appUrl}
              phone={whatsappPhone}
            />
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {openWeek.week.label}
              {lockAtLabel ? ` · kilit ${lockAtLabel}` : null}
            </span>
          </div>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Şu an yayında açık bir hafta yok. Yine de genel hatırlatma için:
          </p>
        )}
        {!openWeek ? (
          <div className="admin-action-row" style={{ marginTop: "0.85rem" }}>
            <WhatsAppReminderButton appUrl={appUrl} phone={whatsappPhone} />
          </div>
        ) : null}
        <p className="muted" style={{ margin: "0.85rem 0 0", fontSize: "0.8rem" }}>
          İstersen Vercel’de <code>NEXT_PUBLIC_WHATSAPP_PHONE</code> ile sabit bir
          numara verebilirsin (örn. 905551112233). Grup için boş bırakıp her
          seferinde grubu seçmek en kolayı.
        </p>
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
