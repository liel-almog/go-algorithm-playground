import { PageSection } from './PageLayout'
import { Eyebrow } from './Eyebrow'
import { Link } from '@tanstack/react-router'

interface LabHeaderProps {
  eyebrow: string
  title: string
  description: string
  badge: string
}

export function LabHeader({
  eyebrow,
  title,
  description,
  badge,
}: LabHeaderProps) {
  return (
    <PageSection className="pt-[38px] pb-[34px] max-[620px]:pt-[25px]">
      <Link
        to="/"
        className="text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        ← All problems
      </Link>
      <div className="flex items-end justify-between gap-10 pt-[34px] max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-[18px]">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-[7px] mb-[9px] text-[clamp(2.4rem,5vw,4.3rem)] leading-none font-semibold tracking-[-0.06em] max-[620px]:text-[2.8rem]">
            {title}
          </h1>
          <p className="max-w-[650px] text-[0.84rem] leading-[1.65] text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-[5px] bg-[#e8eee8] px-[11px] py-2 text-xs font-bold text-primary">
          ◇ {badge}
        </span>
      </div>
    </PageSection>
  )
}
