import type { WorldTheme } from './game/types'

function Tree({ className = '' }: { className?: string }) {
  return (
    <span className={`tree ${className}`} aria-hidden="true">
      <i className="tree-crown crown-one" />
      <i className="tree-crown crown-two" />
      <i className="tree-trunk" />
    </span>
  )
}

export default function CampusIllustration({ theme }: { theme: WorldTheme }) {
  return (
    <div className={`campus-illustration campus-${theme}`} aria-hidden="true">
      <div className="soft-cloud cloud-a"><i /><i /><i /></div>
      <div className="soft-cloud cloud-b"><i /><i /><i /></div>
      <div className="sun-or-moon" />
      <div className="hills hill-back" />
      <div className="hills hill-front" />
      <div className="walkway" />
      <div className="building">
        <span className="building-roof" />
        <span className="building-sign">눈송관</span>
        <span className="door" />
        <span className="window window-a" /><span className="window window-b" />
        <span className="window window-c" /><span className="window window-d" />
      </div>
      <Tree className="tree-left" />
      <Tree className="tree-right" />
      <Tree className="tree-far-left" />
      <Tree className="tree-far-right" />
      <div className="bench"><i /><i /><i /></div>
      <div className="flower flower-one">✦</div>
      <div className="flower flower-two">✦</div>
    </div>
  )
}
