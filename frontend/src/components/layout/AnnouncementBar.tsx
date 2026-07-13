/** Slim promo bar above the header (Bella Vita pattern). */
export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-310 items-center justify-center gap-4 px-4 py-2 text-center">
        <span className="text-[11px] tracking-[0.08em] md:text-xs">
          Nationwide delivery across Ghana · Free on orders over GH₵ 300
        </span>
      </div>
    </div>
  );
}
