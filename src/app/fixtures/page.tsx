import { FixturesWeeksAccordion } from "@/components/fixtures-weeks-accordion";
import { requirePlayer } from "@/lib/auth/current-user";
import { getNextFixturesWeeks } from "@/lib/data";

export default async function FixturesPage() {
  await requirePlayer();
  const weeks = await getNextFixturesWeeks(3);

  return (
    <div className="stack-md">
      <header className="page-header">
        <h1 className="page-title">Gelecek Haftalar</h1>
        <p className="page-sub">Önümüzdeki 3 haftanın fikstürü.</p>
      </header>

      {weeks.length === 0 ? (
        <div className="panel muted">Henüz gelecek hafta fikstürü yayınlanmadı.</div>
      ) : (
        <FixturesWeeksAccordion weeks={weeks} />
      )}
    </div>
  );
}
