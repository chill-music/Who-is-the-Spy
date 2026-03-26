/**
 * WinRateCircle.js
 * Renders a circular win rate indicator.
 */
var WinRateCircleV11 = ({ wins, losses, lang }) => {
    var total = wins + losses;
    var rate = total > 0 ? Math.round((wins / total) * 100) : 0;

    var getColor = (percentage) => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 50) return '#facc15';
        if (percentage >= 30) return '#f97316';
        return '#ef4444';
    };

    var gradient = `conic-gradient(${getColor(rate)} ${rate}%, #1f2937 ${rate}%)`;

    return (
        <div className="profile-winrate-circle" style={{ background: gradient, width:'64px', height:'64px', flexShrink:0 }}>
            <div className="profile-winrate-content">
                <span className="profile-winrate-value" style={{ color: getColor(rate), fontSize:'13px' }}>{rate}%</span>
                <span className="profile-winrate-label" style={{fontSize:'7px'}}>{lang === 'ar' ? 'معدل' : 'Win%'}</span>
            </div>
        </div>
    );
};

window.WinRateCircleV11 = WinRateCircleV11;
