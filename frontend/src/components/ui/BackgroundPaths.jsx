// Fondo tipo "humo" fluido: manchas de color desenfocadas que se mueven lento
// sobre blanco (rojo + verde). CSS puro, sin WebGL ni dependencias.

const BLOBS = [
  { c: 'var(--color-primary)', t: 'a', x: '8%',  y: '18%', s: 620 },
  { c: 'var(--color-accent)',  t: 'b', x: '70%', y: '12%', s: 560 },
  { c: 'var(--color-primary)', t: 'c', x: '78%', y: '68%', s: 680 },
  { c: 'var(--color-accent)',  t: 'a', x: '18%', y: '74%', s: 600 },
  { c: 'var(--color-primary)', t: 'b', x: '44%', y: '46%', s: 520 },
  { c: 'var(--color-accent)',  t: 'c', x: '52%', y: '86%', s: 480 },
]

export default function BackgroundPaths() {
  return (
    <div className="smoke" aria-hidden="true">
      {BLOBS.map((b, i) => (
        <span
          key={i}
          className={`smoke-blob smoke-${b.t}`}
          style={{
            left: b.x, top: b.y, width: b.s, height: b.s,
            background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, transparent 68%)`,
            animationDelay: `${-i * 3.5}s`,
          }}
        />
      ))}
    </div>
  )
}
