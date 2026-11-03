import homeStyles from '../problemArt.module.css'

export function PolynomialArt() {
  return (
    <div className={homeStyles['mini-polynomial']}>
      <span>P(x)</span>
      <b>≟</b>
      <span>Q(x)</span>
      <small>evaluate at r</small>
    </div>
  )
}
