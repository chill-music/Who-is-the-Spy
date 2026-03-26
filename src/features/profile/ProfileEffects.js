/**
 * ProfileEffects.js
 * Modular components for profile visual effects, including particle systems and GIF overlays.
 * Part of Phase 4: Batch 4 modularization.
 */

/**
 * GIF Profile Effect Component
 * Renders a GIF or image overlay that can optionally fade out after a certain duration.
 * 
 * @param {Object} props
 * @param {Object} props.effect - The effect configuration object from SHOP_ITEMS.
 */
var GifProfileEffect = ({ effect }) => {
    const [visible, setVisible] = React.useState(true);
    const [fading, setFading] = React.useState(false);
    const dur = effect?.displayDuration || 2000;

    React.useEffect(() => {
        if (!effect?.showOnce) return; // if not showOnce, stay visible forever
        const fadeTimer = setTimeout(() => setFading(true), dur);
        const hideTimer = setTimeout(() => setVisible(false), dur + 600);
        return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
    }, [effect?.id, dur]);

    if (!visible) return null;
    return (
        <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit', overflow: 'hidden',
            pointerEvents: 'none', zIndex: 1,
            opacity: fading ? 0 : 1,
            transition: fading ? 'opacity 0.6s ease-out' : 'none',
        }}>
            <img src={effect.imageUrl} alt="" style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                opacity: effect.opacity ?? 0.82,
                mixBlendMode: effect.blendMode || 'normal',
            }} />
            {effect.hasGlow && (
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(0,242,255,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
            )}
        </div>
    );
};

/**
 * Profile Effect Overlay (Inline Version)
 * Renders particle effects confined within the avatar circle.
 * 
 * @param {Object} props
 * @param {string} props.effectId - The ID of the effect to render.
 * @param {number} [props.loopEvery=2500] - Loop interval in milliseconds.
 */
var ProfileEffectOverlayInline = ({ effectId, loopEvery = 2500 }) => {
    const [particles, setParticles] = React.useState([]);
    const effect = (SHOP_ITEMS.profileEffects || []).find(e => e.id === effectId);

    const spawnParticles = React.useCallback(() => {
        if (!effect || !Array.isArray(effect.particles)) return;
        const all = effect.particles.flatMap(p =>
            Array.from({ length: Math.ceil(p.count * 0.6) }, (_, i) => ({
                id: `${p.emoji}-${i}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                emoji: p.emoji,
                x: 5 + Math.random() * 90,
                delay: Math.random() * 0.8,
                size: 9 + Math.random() * 8,
                dur: 0.9 + Math.random() * 0.6,
            }))
        );
        setParticles(all);
        setTimeout(() => setParticles([]), (effect.duration || 2200));
    }, [effect, effectId]);

    // Trigger on mount
    React.useEffect(() => { spawnParticles(); }, [effectId, spawnParticles]);
    
    // Loop
    React.useEffect(() => {
        if (!effect) return;
        const interval = setInterval(spawnParticles, loopEvery);
        return () => clearInterval(interval);
    }, [effect, effectId, loopEvery, spawnParticles]);

    // GIF effect inline on avatar
    if (effect && effect.imageUrl && effect.imageUrl.trim() !== '') {
        return <GifProfileEffect effect={effect} />;
    }

    if (!effect || !Array.isArray(effect.particles) || particles.length === 0) return null;
    return (
        <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:20,overflow:'hidden',borderRadius:'50%'}}>
            {particles.map(p => (
                <div key={p.id} style={{
                    position:'absolute', left:`${p.x}%`, top:'-10%',
                    fontSize:`${p.size}px`, lineHeight:1, userSelect:'none',
                    animation:`pef_inline_fall ${p.dur}s ease-in ${p.delay}s forwards`,
                    opacity:0,
                }}>{p.emoji}</div>
            ))}
            <style>{`@keyframes pef_inline_fall{0%{opacity:0;transform:translateY(0) rotate(0deg)}15%{opacity:1}80%{opacity:.8}100%{opacity:0;transform:translateY(115%) rotate(180deg)}}`}</style>
        </div>
    );
};

/**
 * Profile Effect Overlay
 * Renders full-card visual effects (GIFs or falling particles).
 * 
 * @param {Object} props
 * @param {string} props.effectId - The ID of the effect to render.
 */
var ProfileEffectOverlay = ({ effectId }) => {
    const [particles, setParticles] = React.useState([]);
    const [alive, setAlive] = React.useState(false);
    const timerRef = React.useRef(null);
    const loopRef  = React.useRef(null);

    const effect = (SHOP_ITEMS.profileEffects || []).find(e => e.id === effectId);

    const loopEvery       = effect?.loopEvery       || 4000;
    const displayDuration = effect?.displayDuration || (effect?.duration || 2200);

    const triggerBurst = React.useCallback(() => {
        if (!effect || !Array.isArray(effect.particles) || effect.particles.length === 0) return;
        const all = [];
        effect.particles.forEach(p => {
            for (let i = 0; i < p.count; i++) all.push({
                id: `${p.emoji}-${i}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                emoji: p.emoji,
                x: 5 + Math.random() * 90,
                delay: Math.random() * 1.4,
                size: 13 + Math.random() * 17,
                dur: 1.5 + Math.random() * 0.9,
            });
        });
        setParticles(all);
        setAlive(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setAlive(false), displayDuration + 1200);
    }, [effect, effectId, displayDuration]);

    React.useEffect(() => {
        if (!effect) return;
        if (Array.isArray(effect.particles) && effect.particles.length > 0) {
            triggerBurst();
            loopRef.current = setInterval(triggerBurst, loopEvery);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (loopRef.current) clearInterval(loopRef.current);
        };
    }, [effect, effectId, loopEvery, triggerBurst]);

    if (!effect) return null;

    // GIF / Image effect
    if (effect.imageUrl && effect.imageUrl.trim() !== '') {
        return <GifProfileEffect effect={effect} />;
    }

    // Particle effect
    if (!alive || particles.length === 0) return null;
    return (
        <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit', overflow: 'hidden',
            pointerEvents: 'none', zIndex: 1,
        }}>
            {particles.map(p => (
                <div key={p.id} style={{
                    position: 'absolute', left: `${p.x}%`, top: '-8%',
                    fontSize: `${p.size}px`, lineHeight: 1, userSelect: 'none',
                    animation: `pef_card_fall ${p.dur}s ease-in ${p.delay}s forwards`,
                    opacity: 0,
                }}>{p.emoji}</div>
            ))}
            <style>{`@keyframes pef_card_fall{0%{opacity:0;transform:translateY(0) rotate(0deg)}10%{opacity:1}80%{opacity:.9}100%{opacity:0;transform:translateY(110%) rotate(360deg)}}`}</style>
        </div>
    );
};

// Export to global scope
window.GifProfileEffect = GifProfileEffect;
window.ProfileEffectOverlayInline = ProfileEffectOverlayInline;
window.ProfileEffectOverlay = ProfileEffectOverlay;
