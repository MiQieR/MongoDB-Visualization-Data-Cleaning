import { Layers, X } from "lucide-react";

export function Sidebar({ filters, selectedCategories, onToggleCategory, hidden, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {!hidden && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
        w-[280px] flex-shrink-0 h-screen
        bg-white dark:bg-neutral-900 lg:bg-white/40 lg:dark:bg-neutral-900/60 lg:backdrop-blur-2xl
        border-r border-neutral-200 dark:border-neutral-800
        flex flex-col
        transition-all duration-300 ease-in-out
        ${hidden ? '-translate-x-full lg:hidden' : 'translate-x-0'}
      `}>
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Layers size={16} strokeWidth={2.5} />
            </span>
            FOOD DATA
          </h1>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden text-neutral-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="mb-4 px-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
            Categories
          </div>
          
          <div className="space-y-1">
            {filters.categories?.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => onToggleCategory(category)}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                    flex items-center gap-3 group
                    ${isSelected 
                      ? 'bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:shadow-sm'}
                  `}
                >
                  <div className={`
                    w-4 h-4 rounded-md border flex items-center justify-center transition-all
                    ${isSelected
                      ? 'bg-white border-white scale-110'
                      : 'border-neutral-300 dark:border-neutral-600 group-hover:border-blue-400'}
                  `}>
                    {isSelected && <svg className="w-2.5 h-2.5 text-blue-500" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="truncate">{category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}