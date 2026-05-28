import { NavLink } from 'react-router-dom'
import { BookOpen, ShoppingCart, CalendarDays, Sparkles, Settings } from 'lucide-react'

const tabs = [
  { to: '/recettes', icon: BookOpen, label: 'Recettes' },
  { to: '/epicerie', icon: ShoppingCart, label: 'Épicerie' },
  { to: '/plan', icon: CalendarDays, label: 'Plan' },
  { to: '/suggestions', icon: Sparkles, label: 'Suggestions' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            <Icon size={24} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
