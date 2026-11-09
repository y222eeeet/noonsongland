import { Suspense, useState } from 'react'
import CampusIllustration from './CampusIllustration'
import { useWorldStore } from './game/store'

export default function App() {
  const theme = useWorldStore((state) => state.theme)
  const [helpOpen, setHelpOpen] = useState(true)

  return (
    <main className="page">
      <section className={`app theme-${theme}`} aria-label="눈송랜드 모바일 미리보기">
        <Suspense fallback={<div className="loading">눈송랜드를 가꾸는 중…</div>}>
          <CampusIllustration theme={theme} />
        </Suspense>

      <header className="brand" aria-label="눈송랜드">
        <span className="brand-snow">✦</span>
        <div>
          <p>SONG-I&apos;S CAMPUS</p>
          <h1>눈송랜드</h1>
        </div>
      </header>

      <div className="status-pill" aria-live="polite">
        <span className="status-dot" />
        {theme === 'day' ? '햇살 좋은 캠퍼스' : '별빛 아래의 캠퍼스'}
      </div>

      <button className="help-toggle" type="button" onClick={() => setHelpOpen((open) => !open)} aria-expanded={helpOpen}>
        {helpOpen ? '안내 숨기기' : '조작 안내'}
      </button>

      {helpOpen && (
        <aside className="guide" aria-label="캠퍼스 탐색 안내">
          <span className="guide-icon">☁</span>
          <div>
            <strong>천천히 둘러보세요</strong>
            <p>드래그해 시선을 돌리고, 스크롤 또는 두 손가락으로 확대·축소할 수 있어요.</p>
          </div>
        </aside>
      )}

        <footer>STAGE 1 · CAMPUS WALK</footer>
      </section>
    </main>
  )
}
