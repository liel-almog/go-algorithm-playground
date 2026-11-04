import { Link, useRouter } from '@tanstack/react-router'
import { Button } from './ui/button'

export function PageNotFound() {
  return (
    <section className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="my-5 text-base text-muted-foreground">
        Choose an algorithm from the library to get started.
      </p>
      <Link to="/" className="font-semibold text-primary underline">
        Back to the library
      </Link>
    </section>
  )
}

export function PageError() {
  const router = useRouter()
  return (
    <section role="alert" className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold">This page could not be loaded</h1>
      <p className="my-5 text-base text-muted-foreground">
        Try again or return to the library to choose another algorithm.
      </p>
      <div className="flex items-center justify-center gap-6">
        <Button onClick={() => void router.invalidate()}>Try again</Button>
        <Link to="/" className="font-semibold text-primary underline">
          Back to the library
        </Link>
      </div>
    </section>
  )
}
