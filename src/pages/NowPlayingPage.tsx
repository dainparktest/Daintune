import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'
import { startPlayback, stopPlayback, pausePlayback, resumePlayback } from '../player.js'
import Header from '../components/Header.js'
import { Playlist } from './LibraryPage.js'

interface Props {
  track: Track | null
  queue: Track[]
  queueIndex: number
  repeat: boolean
  shuffle: boolean
  autoplayNext: boolean
  playlists: Playlist[]
  onAddToPlaylist: (track: Track, playlistIndex: number) => void
  onBack: () => void
}

const getNextIndex = (current: number, length: number, shuffle: boolean): number => {
  if (!shuffle || length <= 1) return (current + 1) % length
  let next: number
  do { next = Math.floor(Math.random() * length) } while (next === current)
  return next
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const progressBar = (current: number, total: number, width = 32) => {
  if (total === 0) return '-'.repeat(width)
  const filled = Math.min(Math.floor((current / total) * width), width - 1)
  return '='.repeat(filled) + 'O' + '-'.repeat(Math.max(0, width - filled - 1))
}

type Status = 'loading' | 'playing' | 'paused' | 'ended' | 'error'

const NowPlayingPage = ({ track, queue, queueIndex, repeat, shuffle, autoplayNext, playlists, onAddToPlaylist, onBack }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(queueIndex)
  const [status, setStatus] = useState<Status>('loading')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [playKey, setPlayKey] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [selectedPlaylistForAdd, setSelectedPlaylistForAdd] = useState(0)
  const [addResult, setAddResult] = useState<{ type: 'added' | 'duplicate'; name: string } | null>(null)

  // queue가 있으면 큐에서, 없으면 단일 track 사용
  const activeTrack = queue.length > 0 ? queue[currentIndex] : track
  const nextTrack   = queue.length > 1 && !shuffle ? queue[(currentIndex + 1) % queue.length] : null

  const repeatRef    = useRef(repeat)
  const shuffleRef   = useRef(shuffle)
  const autoplayRef  = useRef(autoplayNext)
  const queueRef     = useRef(queue)

  useEffect(() => {
    repeatRef.current   = repeat
    shuffleRef.current  = shuffle
    autoplayRef.current = autoplayNext
    queueRef.current    = queue
  }, [repeat, shuffle, autoplayNext, queue])

  useEffect(() => {
    if (!activeTrack?.youtubeId) return

    setStatus('loading')
    setProgress(0)
    setError(null)

    startPlayback(activeTrack.youtubeId, {
      onPosition: (pos) => {
        setProgress(pos)
        setStatus((s) => (s === 'loading' ? 'playing' : s))
      },
      onEnd: () => {
        if (repeatRef.current) {
          setPlayKey(k => k + 1)
        } else if (queueRef.current.length > 1 && autoplayRef.current) {
          setCurrentIndex(i => getNextIndex(i, queueRef.current.length, shuffleRef.current))
        } else {
          setStatus('ended')
        }
      },
      onError: (msg) => {
        setError(msg)
        setStatus('error')
      },
    }).catch((e: Error) => {
      setError(e.message)
      setStatus('error')
    })

    return () => stopPlayback()
  }, [activeTrack?.youtubeId, playKey])

  useInput((input, key) => {
    if (key.escape) { stopPlayback(); onBack() }
    if (input === ' ') {
      if (status === 'playing') { pausePlayback(); setStatus('paused') }
      else if (status === 'paused') { resumePlayback(); setStatus('playing') }
    }
    if (input === 'r' && (status === 'ended' || status === 'paused' || status === 'playing')) {
      setPlayKey(k => k + 1)
    }
    if (input === 'n' && queue.length > 1) {
      setCurrentIndex(i => getNextIndex(i, queue.length, shuffle))
    }
    if (input === 'a' && activeTrack) {
      setSelectedPlaylistForAdd(0)
      setAddResult(null)
      setShowPicker(true)
    }
  }, { isActive: !showPicker })

  useInput((_input, key) => {
    if (key.escape)    { setShowPicker(false); return }
    if (key.upArrow)   setSelectedPlaylistForAdd(prev => (prev - 1 + playlists.length) % playlists.length)
    if (key.downArrow) setSelectedPlaylistForAdd(prev => (prev + 1) % playlists.length)
    if (key.return && activeTrack) {
      const pl = playlists[selectedPlaylistForAdd]
      const isDuplicate = pl.tracks.some(t =>
        t.youtubeId ? t.youtubeId === activeTrack.youtubeId : t.title === activeTrack.title
      )
      if (isDuplicate) {
        setAddResult({ type: 'duplicate', name: pl.name })
      } else {
        onAddToPlaylist(activeTrack, selectedPlaylistForAdd)
        setAddResult({ type: 'added', name: pl.name })
      }
      setShowPicker(false)
    }
  }, { isActive: showPicker })

  const statusLabel =
    status === 'loading' ? '  >> LOADING...' :
    status === 'playing' ? '  >> PLAYING' :
    status === 'paused'  ? '  || PAUSED ' :
    status === 'ended'   ? '  [] ENDED  ' :
                           '  !! ERROR  '

  const statusColor =
    status === 'playing' ? 'green' :
    status === 'paused'  ? 'yellow' :
    status === 'error'   ? 'red' : 'gray'

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Now playing" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} paddingY={1} gap={1}>
        {!activeTrack ? (
          <Text color="gray">No track selected. Go to Search or Library.</Text>
        ) : (
          <>
            <Box flexDirection="column">
              <Text color="green" bold>{activeTrack.title}</Text>
              <Text color="gray">{activeTrack.artist}</Text>
            </Box>

            {status === 'loading' && <Text color="yellow">Connecting to YouTube...</Text>}

            {(status === 'playing' || status === 'paused') && (
              <Box flexDirection="column">
                <Text color="green">[{progressBar(progress, activeTrack.duration)}]</Text>
                <Box>
                  <Text color="gray">{fmt(progress)}</Text>
                  <Text color="gray">{'                                '.slice(0, 28)}</Text>
                  <Text color="gray">{fmt(activeTrack.duration)}</Text>
                </Box>
              </Box>
            )}

            {status === 'ended' && <Text color="gray">Playback ended. Press r to replay.</Text>}
            {status === 'error' && <Text color="red">Error: {error}</Text>}

            <Text color={statusColor} bold>{statusLabel}</Text>

            {nextTrack && (
              <Text color="gray">Next: {nextTrack.title}</Text>
            )}

            {addResult && (
              <Text color={addResult.type === 'added' ? 'green' : 'yellow'}>
                {addResult.type === 'added'
                  ? `Added to "${addResult.name}"!`
                  : `Already in "${addResult.name}".`}
              </Text>
            )}

            {showPicker && (
              <Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1}>
                <Text color="yellow">Add to playlist:</Text>
                {playlists.map((pl, i) => (
                  <Text
                    key={pl.name}
                    color={i === selectedPlaylistForAdd ? 'black' : 'white'}
                    backgroundColor={i === selectedPlaylistForAdd ? 'yellow' : undefined}
                  >
                    {` ${pl.name.padEnd(22)} ${pl.tracks.length} tracks`}
                  </Text>
                ))}
              </Box>
            )}
          </>
        )}

        <Box flexDirection="column">
          <Text color="gray">Repeat: {repeat ? 'ON' : 'OFF'}</Text>
          <Text color="gray">Shuffle: {shuffle ? 'ON' : 'OFF'}</Text>
          <Text color="gray">Autoplay next: {autoplayNext ? 'ON' : 'OFF'}</Text>
        </Box>
      </Box>

      <Text color="gray">
        {showPicker
          ? `up/down navigate  Enter add  Esc cancel`
          : `Space pause/play  r restart  ${queue.length > 1 ? 'n next  ' : ''}a add to playlist  Esc back`}
      </Text>
    </Box>
  )
}

export default NowPlayingPage
