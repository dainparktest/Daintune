import React, { useState } from 'react'
import { render } from 'ink'
import MenuPage from './pages_ex/MenuPage.js'
import { Page, Track } from './types.js'
import SearchPage from './pages_ex/SearchPage.js'
import LibraryPage from './pages_ex/LibraryPage.js'
import NowPlayingPage from './pages_ex/NowPlayingPage.js'
import SettingsPage from './pages_ex/SettingsPage.js'

const App = () => {
  const [page, setPage] = useState<Page>('menu')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)

  const handlePlay = (track: Track) => {
    setCurrentTrack(track)
    setPage('nowPlaying')
  }


  if (page === 'menu')     return <MenuPage onNavigate={setPage} />
  if (page === 'search')     return <SearchPage     onBack={() => setPage('menu')} onPlay={handlePlay} />
  if (page === 'library')    return <LibraryPage    onBack={() => setPage('menu')} onPlay={handlePlay} />
  if (page === 'nowPlaying') return <NowPlayingPage track={currentTrack}           onBack={() => setPage('menu')} />
  if (page === 'settings')   return <SettingsPage   onBack={() => setPage('menu')} />


  return <MenuPage onNavigate={setPage} />
}


render(<App />)
