import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#060D18] border-t border-white/5 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
                <span className="font-display font-extrabold text-foreground text-lg">VN</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">Player Rating</h2>
                <p className="text-xs text-[#A8A29E]">Vietnamese Football</p>
              </div>
            </Link>
            <p className="text-sm text-[#A8A29E] leading-relaxed">
              Data-driven player analysis and performance ratings for Vietnamese football leagues.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Players', 'Matches', 'Leagues', 'Analytics'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-sm text-[#A8A29E] hover:text-[#00D9FF] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Leagues */}
          <div>
            <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-4">
              Leagues
            </h3>
            <ul className="space-y-2">
              {['V.League 1', 'V.League 2', 'National Cup', 'Super Cup'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#A8A29E] hover:text-[#00D9FF] transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-4">
              Platform Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono-data text-2xl font-bold text-[#00D9FF]">500+</p>
                <p className="text-xs text-[#A8A29E]">Players Tracked</p>
              </div>
              <div>
                <p className="font-mono-data text-2xl font-bold text-[#FF4444]">1,200+</p>
                <p className="text-xs text-[#A8A29E]">Matches Analyzed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A8A29E]">
            © 2024 Player Rating Engine. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-[#A8A29E] hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-[#A8A29E] hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
