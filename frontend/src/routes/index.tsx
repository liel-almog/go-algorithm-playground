import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Algorithm } from '../lib/api'
import { kargerAlgorithm, puzzleAlgorithms } from '../lib/algorithms'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [algorithms, setAlgorithms] = useState(puzzleAlgorithms)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .algorithms()
      .then(({ algorithms: available }) => {
        setAlgorithms(available)
        setBackendOnline(true)
      })
      .catch(() => setBackendOnline(false))
  }, [])

  return (
    <div className="home-page">
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Interactive algorithm playground
          </div>
          <h1>
            See the search.
            <br />
            <em>Understand the choice.</em>
          </h1>
          <p>
            Generate a fresh problem, send it to a real Go implementation, then
            watch the solution unfold one decision at a time.
          </p>
          <div className="hero-actions">
            <Link
              to="/algorithms/$algorithmId"
              params={{ algorithmId: 'astar' }}
              className="button button-primary"
            >
              Try A* search <span aria-hidden="true">→</span>
            </Link>
            <a href="#algorithms" className="button button-quiet">
              Browse algorithms
            </a>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Illustration of a search graph"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="node node-start">S</div>
          <div className="node node-a">A</div>
          <div className="node node-b">B</div>
          <div className="node node-c">C</div>
          <div className="node node-goal">G</div>
          <svg viewBox="0 0 540 420" aria-hidden="true">
            <path d="M115 220 C160 160 200 110 260 110" />
            <path d="M120 225 C190 235 230 300 300 300" />
            <path d="M275 110 C355 105 370 185 425 200" />
            <path d="M305 296 C370 285 385 230 430 207" />
            <path
              className="active-path"
              d="M115 220 C160 160 200 110 260 110 C355 105 370 185 425 200"
            />
          </svg>
          <div className="floating-note note-score">
            <span>heuristic</span>
            <strong>h(n) = 4</strong>
          </div>
          <div className="floating-note note-route">
            <span>best route</span>
            <strong>S → A → G</strong>
          </div>
        </div>
      </section>

      <section className="intro-strip">
        <div className="section-wrap strip-grid">
          <div>
            <strong>{algorithms.length + 1}</strong>
            <span>algorithms to explore</span>
          </div>
          <div>
            <strong>2</strong>
            <span>problem families</span>
          </div>
          <div>
            <strong>Live</strong>
            <span>step-by-step playback</span>
          </div>
          <div
            className={`backend-state ${backendOnline === false ? 'offline' : ''}`}
          >
            <i />
            <span>
              {backendOnline === null
                ? 'Checking Go backend'
                : backendOnline
                  ? 'Go backend connected'
                  : 'Start backend to run demos'}
            </span>
          </div>
        </div>
      </section>

      <section className="algorithm-section section-wrap" id="algorithms">
        <div className="section-heading">
          <div>
            <span className="kicker">Choose a lab</span>
            <h2>Different ideas. One simple workflow.</h2>
          </div>
          <p>Generate a problem, run the algorithm, inspect what happened.</p>
        </div>
        <div className="algorithm-grid">
          {algorithms.map((algorithm, index) => (
            <AlgorithmCard
              key={algorithm.id}
              algorithm={algorithm}
              index={index}
            />
          ))}
          <AlgorithmCard
            algorithm={kargerAlgorithm}
            index={algorithms.length}
          />
        </div>
      </section>

      <section className="workflow-section section-wrap" id="workflow">
        <div className="workflow-copy">
          <span className="kicker">How it works</span>
          <h2>From a random problem to an explainable answer.</h2>
          <p>
            Every lab follows the same rhythm, so you can focus on how the
            algorithms differ—not on learning a new interface.
          </p>
        </div>
        <ol className="workflow-steps">
          <li>
            <span>01</span>
            <div>
              <strong>Generate</strong>
              <p>Create a fresh, valid problem with adjustable complexity.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Solve</strong>
              <p>Send it to the selected algorithm on the Go backend.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Explore</strong>
              <p>Replay the path and compare the work behind the answer.</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  )
}

function AlgorithmCard({
  algorithm,
  index,
}: {
  algorithm: Algorithm
  index: number
}) {
  const isKarger = algorithm.id === 'karger'
  const symbols = ['A*', 'B', 'G', 'D', 'K']

  const content = (
    <>
      <div className={`algorithm-icon tone-${index % 5}`}>
        {symbols[index % 5]}
      </div>
      <div className="card-meta">
        <span>{algorithm.category}</span>
        <i>
          {algorithm.optimal ? 'Optimal' : isKarger ? 'Probabilistic' : 'Fast'}
        </i>
      </div>
      <h3>{algorithm.name}</h3>
      <p>{algorithm.description}</p>
      <div className="card-link">
        Open lab <span aria-hidden="true">↗</span>
      </div>
    </>
  )

  return isKarger ? (
    <Link to="/algorithms/karger" className="algorithm-card">
      {content}
    </Link>
  ) : (
    <Link
      to="/algorithms/$algorithmId"
      params={{ algorithmId: algorithm.id }}
      className="algorithm-card"
    >
      {content}
    </Link>
  )
}
