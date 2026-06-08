import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Search,
  Home,
  Library,
  ListMusic,
  Clock3,
  Plus,
  Music2,
} from "lucide-react"

import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { GlareCard } from "@/components/ui/glare-card"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                   types                                     */
/* -------------------------------------------------------------------------- */

type Track = {
  id: string
  title: string
  artist: string
  album: string
  durationSec: number
}

type Playlist = {
  id: string
  name: string
  curator: string
  description: string
  seed: string
  tracks: Track[]
}

/* -------------------------------------------------------------------------- */
/*                                 mock data                                   */
/* -------------------------------------------------------------------------- */

const PLAYLISTS: Playlist[] = [
  {
    id: "focus",
    name: "Deep Focus",
    curator: "Vitrine Music",
    description:
      "Texturas instrumentais e batidas suaves para entrar no fluxo de trabalho sem distrações.",
    seed: "deep-focus-cover",
    tracks: [
      {
        id: "f1",
        title: "Liquid Mind Drift",
        artist: "Aurora Fields",
        album: "Slow Currents",
        durationSec: 214,
      },
      {
        id: "f2",
        title: "Paper Lanterns Over the Bay at Midnight",
        artist: "Hiroshi Nakamura",
        album: "Quiet Geometry",
        durationSec: 268,
      },
      {
        id: "f3",
        title: "Glasshouse",
        artist: "Noa Vellum",
        album: "Slow Currents",
        durationSec: 191,
      },
      {
        id: "f4",
        title: "Static Rain",
        artist: "The Hollow Coast",
        album: "Analog Skies",
        durationSec: 233,
      },
      {
        id: "f5",
        title: "Northbound",
        artist: "Aurora Fields",
        album: "Slow Currents",
        durationSec: 246,
      },
    ],
  },
  {
    id: "indie",
    name: "Indie Sunrise",
    curator: "Vitrine Music",
    description:
      "Guitarras brilhantes e vozes calorosas para começar o dia com energia leve.",
    seed: "indie-sunrise-cover",
    tracks: [
      {
        id: "i1",
        title: "Cardboard Cities",
        artist: "Marlowe & The Tides",
        album: "Sunward",
        durationSec: 201,
      },
      {
        id: "i2",
        title: "Honeylight",
        artist: "Petra Vance",
        album: "Golden Hour Demos",
        durationSec: 178,
      },
      {
        id: "i3",
        title: "We Were Electric in the Summer of '09",
        artist: "Coastlines",
        album: "Sunward",
        durationSec: 252,
      },
      {
        id: "i4",
        title: "Paper Planes",
        artist: "Petra Vance",
        album: "Golden Hour Demos",
        durationSec: 195,
      },
    ],
  },
  {
    id: "synth",
    name: "Neon Drive",
    curator: "Vitrine Music",
    description:
      "Synthwave retrô para estradas noturnas, luzes de neon e nostalgia dos anos 80.",
    seed: "neon-drive-cover",
    tracks: [
      {
        id: "s1",
        title: "Midnight Protocol",
        artist: "VHS Dreams",
        album: "Chrome Horizon",
        durationSec: 287,
      },
      {
        id: "s2",
        title: "Outrun",
        artist: "Sable Circuit",
        album: "Chrome Horizon",
        durationSec: 224,
      },
      {
        id: "s3",
        title: "Pixel Sunset",
        artist: "Neon District",
        album: "Afterglow",
        durationSec: 209,
      },
      {
        id: "s4",
        title: "Turbo Lover Mirage",
        artist: "VHS Dreams",
        album: "Chrome Horizon",
        durationSec: 241,
      },
      {
        id: "s5",
        title: "Starfield",
        artist: "Sable Circuit",
        album: "Afterglow",
        durationSec: 263,
      },
    ],
  },
  {
    id: "jazz",
    name: "Late Night Jazz",
    curator: "Vitrine Music",
    description:
      "Piano, contrabaixo e sopros para fechar a noite com elegância e aconchego.",
    seed: "late-jazz-cover",
    tracks: [
      {
        id: "j1",
        title: "Blue Hour",
        artist: "The Selene Trio",
        album: "After Midnight",
        durationSec: 312,
      },
      {
        id: "j2",
        title: "Velvet Avenue",
        artist: "Marcus Doyle Quartet",
        album: "Smoke & Brass",
        durationSec: 278,
      },
      {
        id: "j3",
        title: "Raincheck",
        artist: "The Selene Trio",
        album: "After Midnight",
        durationSec: 246,
      },
    ],
  },
]

type AlbumCard = { id: string; title: string; subtitle: string; seed: string }

const FEATURED_ALBUMS: AlbumCard[] = [
  { id: "a1", title: "Chrome Horizon", subtitle: "VHS Dreams", seed: "album-chrome" },
  { id: "a2", title: "Slow Currents", subtitle: "Aurora Fields", seed: "album-slow" },
  { id: "a3", title: "Sunward", subtitle: "Marlowe & The Tides", seed: "album-sunward" },
  { id: "a4", title: "After Midnight", subtitle: "The Selene Trio", seed: "album-midnight" },
  { id: "a5", title: "Afterglow", subtitle: "Sable Circuit", seed: "album-afterglow" },
  { id: "a6", title: "Analog Skies", subtitle: "The Hollow Coast", seed: "album-analog" },
]

const ARTIST_CARDS = [
  { quote: "Synthwave que parece a trilha de um filme dos anos 80.", name: "VHS Dreams", title: "12,4M ouvintes mensais" },
  { quote: "Texturas ambientais perfeitas para concentração profunda.", name: "Aurora Fields", title: "8,1M ouvintes mensais" },
  { quote: "Indie solar com guitarras que abraçam.", name: "Petra Vance", title: "5,7M ouvintes mensais" },
  { quote: "Jazz noturno gravado em fitas analógicas.", name: "The Selene Trio", title: "3,9M ouvintes mensais" },
  { quote: "Batidas retrô e baixos hipnóticos para a estrada.", name: "Sable Circuit", title: "6,3M ouvintes mensais" },
]

/* -------------------------------------------------------------------------- */
/*                                  helpers                                    */
/* -------------------------------------------------------------------------- */

function coverUrl(seed: string, size = 600) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/* -------------------------------------------------------------------------- */
/*                                MarqueeText                                  */
/* -------------------------------------------------------------------------- */

type MarqueeTextProps = {
  text: string
  className?: string
}

/**
 * Texto que rola horizontalmente (marquee) apenas quando seu conteúdo
 * excede a largura disponível — caso contrário fica estático.
 */
function MarqueeText({ text, className }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const measure = () => {
      const cw = container.clientWidth
      setContainerWidth(cw)
      setOverflowing(inner.scrollWidth > cw + 1)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [text])

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
    >
      <span
        ref={innerRef}
        className={cn(
          "inline-block whitespace-nowrap will-change-transform",
          overflowing && "animate-music-marquee"
        )}
        style={
          overflowing
            ? ({ "--marquee-w": `${containerWidth}px` } as React.CSSProperties &
                Record<`--${string}`, string>)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 TrackRow                                    */
/* -------------------------------------------------------------------------- */

type TrackRowProps = {
  index: number
  track: Track
  isCurrent: boolean
  isPlaying: boolean
  liked: boolean
  onPlay: () => void
  onToggleLike: () => void
}

function TrackRow({
  index,
  track,
  isCurrent,
  isPlaying,
  liked,
  onPlay,
  onToggleLike,
}: TrackRowProps) {
  return (
    <div
      className={cn(
        "group grid grid-cols-[2rem_minmax(0,3fr)_minmax(0,2fr)_auto] items-center gap-4 rounded-md px-3 py-2 transition-colors sm:grid-cols-[2rem_minmax(0,3fr)_minmax(0,2fr)_5rem_auto]",
        isCurrent ? "bg-accent" : "hover:bg-accent/60"
      )}
    >
      {/* index / play */}
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Reproduzir ${track.title} de ${track.artist}`}
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <span
          className={cn(
            "text-sm tabular-nums",
            isCurrent ? "hidden" : "group-hover:hidden"
          )}
        >
          {index + 1}
        </span>
        {isCurrent && isPlaying ? (
          <Pause className="size-4 text-primary" />
        ) : (
          <Play
            className={cn(
              "size-4",
              isCurrent ? "block text-primary" : "hidden group-hover:block"
            )}
          />
        )}
      </button>

      {/* title + artist */}
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={coverUrl(`${track.album}-${track.id}`, 80)}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="size-10 shrink-0 rounded object-cover"
        />
        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-sm font-medium",
              isCurrent ? "text-primary" : "text-foreground"
            )}
          >
            {track.title}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {track.artist}
          </div>
        </div>
      </div>

      {/* album */}
      <div className="hidden truncate text-sm text-muted-foreground sm:block">
        {track.album}
      </div>

      {/* like */}
      <button
        type="button"
        onClick={onToggleLike}
        aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        aria-pressed={liked}
        className={cn(
          "hidden size-8 items-center justify-center rounded-full transition-colors sm:flex",
          liked
            ? "text-rose-500"
            : "text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
        )}
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
      </button>

      {/* duration */}
      <div className="flex items-center justify-end gap-1 text-xs tabular-nums text-muted-foreground">
        <Clock3 className="size-3.5 sm:hidden" />
        {formatTime(track.durationSec)}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                MusicPlayer                                  */
/* -------------------------------------------------------------------------- */

export function MusicPlayer() {
  const [activePlaylistId, setActivePlaylistId] = useState<string>(
    PLAYLISTS[0].id
  )
  const [nowPlaying, setNowPlaying] = useState<{
    playlistId: string
    index: number
  }>({ playlistId: PLAYLISTS[0].id, index: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(72)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({
    f2: true,
    s1: true,
  })

  const activePlaylist = useMemo(
    () => PLAYLISTS.find((p) => p.id === activePlaylistId) ?? PLAYLISTS[0],
    [activePlaylistId]
  )
  const playingPlaylist = useMemo(
    () => PLAYLISTS.find((p) => p.id === nowPlaying.playlistId) ?? PLAYLISTS[0],
    [nowPlaying.playlistId]
  )
  const currentTrack = playingPlaylist.tracks[nowPlaying.index]

  const totalDuration = activePlaylist.tracks.reduce(
    (sum, t) => sum + t.durationSec,
    0
  )

  const goToTrack = useCallback(
    (playlistId: string, index: number) => {
      const playlist = PLAYLISTS.find((p) => p.id === playlistId)
      if (!playlist) return
      const safeIndex = (index + playlist.tracks.length) % playlist.tracks.length
      setNowPlaying({ playlistId, index: safeIndex })
      setProgress(0)
      setIsPlaying(true)
    },
    []
  )

  const playNext = useCallback(() => {
    const list = playingPlaylist.tracks
    const next = shuffle
      ? Math.floor(Math.random() * list.length)
      : nowPlaying.index + 1
    goToTrack(playingPlaylist.id, next)
  }, [goToTrack, nowPlaying.index, playingPlaylist, shuffle])

  const playPrev = useCallback(() => {
    if (progress > 4) {
      setProgress(0)
      return
    }
    goToTrack(playingPlaylist.id, nowPlaying.index - 1)
  }, [goToTrack, nowPlaying.index, playingPlaylist.id, progress])

  // Simulação do tempo de reprodução.
  useEffect(() => {
    if (!isPlaying) return
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + 1 >= currentTrack.durationSec) {
          if (repeat) return 0
          window.setTimeout(() => playNext(), 0)
          return currentTrack.durationSec
        }
        return prev + 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isPlaying, currentTrack.durationSec, repeat, playNext])

  const effectiveVolume = muted ? 0 : volume

  return (
    <div className="flex h-[82vh] flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground">
      {/* ── Top: sidebar + main ──────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
          <div className="flex items-center gap-2 px-5 py-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Music2 className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Vitrine Music
            </span>
          </div>

          <nav className="flex flex-col gap-1 px-3 pb-2">
            <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground">
              <Home className="size-4" /> Início
            </span>
            <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <Search className="size-4" /> Buscar
            </span>
            <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <Library className="size-4" /> Sua biblioteca
            </span>
          </nav>

          <div className="mt-2 flex items-center justify-between px-5 py-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ListMusic className="size-3.5" /> Playlists
            </span>
            <button
              type="button"
              aria-label="Criar playlist"
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
            {PLAYLISTS.map((playlist) => {
              const active = playlist.id === activePlaylistId
              const isSource = playlist.id === nowPlaying.playlistId
              return (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => setActivePlaylistId(playlist.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-2 py-2 text-left transition-colors",
                    active
                      ? "border-border bg-accent"
                      : "border-transparent hover:bg-accent/60"
                  )}
                >
                  <img
                    src={coverUrl(playlist.seed, 96)}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className="size-11 shrink-0 rounded object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {playlist.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {isSource && isPlaying ? (
                        <span className="text-primary">▶ Tocando agora</span>
                      ) : (
                        `${playlist.tracks.length} faixas`
                      )}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main scroll area */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {/* Hero da playlist */}
          <section className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end">
            <div className="w-44 shrink-0 self-center sm:self-end">
              <GlareCard className="flex items-center justify-center">
                <img
                  src={coverUrl(activePlaylist.seed)}
                  alt={`Capa da playlist ${activePlaylist.name}`}
                  className="h-full w-full object-cover"
                />
              </GlareCard>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <Badge variant="secondary" className="w-fit">
                Playlist
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {activePlaylist.name}
              </h1>
              <p className="max-w-prose text-sm text-muted-foreground">
                {activePlaylist.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {activePlaylist.curator}
                </span>
                <span aria-hidden="true">•</span>
                <span>{activePlaylist.tracks.length} faixas</span>
                <span aria-hidden="true">•</span>
                <span>cerca de {formatTime(totalDuration)}</span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (nowPlaying.playlistId === activePlaylist.id) {
                      setIsPlaying((p) => !p)
                    } else {
                      goToTrack(activePlaylist.id, 0)
                    }
                  }}
                  className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  {nowPlaying.playlistId === activePlaylist.id && isPlaying ? (
                    <>
                      <Pause className="size-4" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="size-4" /> Reproduzir
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShuffle((s) => !s)}
                  aria-pressed={shuffle}
                  aria-label="Modo aleatório"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border border-border transition-colors",
                    shuffle
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Shuffle className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Lista de faixas */}
          <section className="px-6">
            <div className="grid grid-cols-[2rem_minmax(0,3fr)_minmax(0,2fr)_auto] items-center gap-4 border-b border-border px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[2rem_minmax(0,3fr)_minmax(0,2fr)_5rem_auto]">
              <span className="text-center">#</span>
              <span>Título</span>
              <span className="hidden sm:block">Álbum</span>
              <span className="hidden sm:block" aria-hidden="true" />
              <span className="flex justify-end">
                <Clock3 className="size-4" />
              </span>
            </div>
            <div className="mt-2 flex flex-col">
              {activePlaylist.tracks.map((track, index) => {
                const isCurrent =
                  nowPlaying.playlistId === activePlaylist.id &&
                  nowPlaying.index === index
                return (
                  <TrackRow
                    key={track.id}
                    index={index}
                    track={track}
                    isCurrent={isCurrent}
                    isPlaying={isCurrent && isPlaying}
                    liked={!!liked[track.id]}
                    onPlay={() => {
                      if (isCurrent) {
                        setIsPlaying((p) => !p)
                      } else {
                        goToTrack(activePlaylist.id, index)
                      }
                    }}
                    onToggleLike={() =>
                      setLiked((prev) => ({
                        ...prev,
                        [track.id]: !prev[track.id],
                      }))
                    }
                  />
                )
              })}
            </div>
          </section>

          {/* Grid de álbuns em destaque */}
          <section className="px-6 pt-10">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Álbuns em destaque
              </h2>
              <span className="text-sm text-muted-foreground">Ver tudo</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {FEATURED_ALBUMS.map((album) => (
                <div
                  key={album.id}
                  className="group flex flex-col gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-card/60"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={coverUrl(album.seed, 300)}
                      alt={`Capa do álbum ${album.title}`}
                      width={300}
                      height={300}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 flex size-10 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Play className="size-4" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {album.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {album.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Artistas em destaque */}
          <section className="px-6 pb-10 pt-10">
            <h2 className="mb-2 text-xl font-semibold tracking-tight">
              Artistas em destaque
            </h2>
            <InfiniteMovingCards
              items={ARTIST_CARDS}
              direction="left"
              speed="slow"
              className="py-2"
            />
          </section>
        </main>
      </div>

      {/* ── Player fixo no rodapé ────────────────────────────────────────── */}
      <footer className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border bg-card/80 px-4 py-3 backdrop-blur md:grid-cols-3">
        {/* Faixa atual */}
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={coverUrl(`${currentTrack.album}-${currentTrack.id}`, 120)}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <MarqueeText
              text={currentTrack.title}
              className="text-sm font-semibold"
            />
            <MarqueeText
              text={currentTrack.artist}
              className="text-xs text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              setLiked((prev) => ({
                ...prev,
                [currentTrack.id]: !prev[currentTrack.id],
              }))
            }
            aria-label={
              liked[currentTrack.id]
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
            }
            aria-pressed={!!liked[currentTrack.id]}
            className={cn(
              "ml-1 hidden size-8 shrink-0 items-center justify-center rounded-full transition-colors sm:flex",
              liked[currentTrack.id]
                ? "text-rose-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart
              className={cn("size-4", liked[currentTrack.id] && "fill-current")}
            />
          </button>
        </div>

        {/* Controles + progresso */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShuffle((s) => !s)}
              aria-pressed={shuffle}
              aria-label="Aleatório"
              className={cn(
                "hidden size-8 items-center justify-center rounded-full transition-colors sm:flex",
                shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shuffle className="size-4" />
            </button>
            <button
              type="button"
              onClick={playPrev}
              aria-label="Faixa anterior"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <SkipBack className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              className="flex size-11 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 translate-x-px" />
              )}
            </button>
            <button
              type="button"
              onClick={playNext}
              aria-label="Próxima faixa"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <SkipForward className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setRepeat((r) => !r)}
              aria-pressed={repeat}
              aria-label="Repetir"
              className={cn(
                "hidden size-8 items-center justify-center rounded-full transition-colors sm:flex",
                repeat ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Repeat className="size-4" />
            </button>
          </div>

          <div className="flex w-full max-w-md items-center gap-2">
            <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
              {formatTime(progress)}
            </span>
            <Slider
              value={[Math.min(progress, currentTrack.durationSec)]}
              min={0}
              max={currentTrack.durationSec}
              step={1}
              onValueChange={(values) => setProgress(values[0] ?? 0)}
              aria-label="Progresso da faixa"
              className="flex-1"
            />
            <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
              {formatTime(currentTrack.durationSec)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden items-center justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Reativar som" : "Silenciar"}
            aria-pressed={muted}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            {muted || volume === 0 ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
          <Slider
            value={[effectiveVolume]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => {
              setMuted(false)
              setVolume(values[0] ?? 0)
            }}
            aria-label="Volume"
            className="w-28"
          />
          <span className="w-8 text-[11px] tabular-nums text-muted-foreground">
            {effectiveVolume}%
          </span>
        </div>
      </footer>
    </div>
  )
}
