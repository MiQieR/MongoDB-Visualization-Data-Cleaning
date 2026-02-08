import { Check } from "lucide-react";

export function FoodCard({ item, selected, onSelect, onClick, editMode }) {
  const imageUrl = item.thumb_image_url || item.image_url || item.image;

  return (
    <div 
      className={`
        group relative flex flex-col bg-white dark:bg-neutral-900 
        rounded-2xl overflow-hidden shadow-sm border border-white/50 dark:border-neutral-800
        hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20 
        transition-all duration-300 ease-out cursor-pointer
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-950' : ''}
      `}
      onClick={onClick}
      style={{
        aspectRatio: '1/1'
      }}
    >
      {/* Selection Overlay (Edit Mode Only) */}
      {editMode && (
        <div 
          className="absolute top-2.5 right-2.5 z-30"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center border transition-all shadow-sm
            ${selected 
              ? 'bg-blue-500 border-blue-500 text-white scale-110' 
              : 'bg-white/90 dark:bg-black/60 border-neutral-200 dark:border-neutral-700 hover:border-blue-400 backdrop-blur-md'}
          `}>
            {selected && <Check size={14} strokeWidth={3} />}
          </div>
        </div>
      )}

      {/* Image Area */}
      <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</span>
          </div>
        )}
      </div>
      
      {/* ID Badge */}
      <div className="absolute top-2.5 left-2.5 z-20">
        <div className="bg-black/30 dark:bg-black/50 backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center justify-center min-w-[32px]">
          <span className="text-[9px] font-bold text-white tracking-wider leading-none font-mono">
            #{item.id}
          </span>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-20">
        <div className="bg-white/95 dark:bg-black/70 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-2.5 border border-white/20 dark:border-neutral-800/50 shadow-lg">
           <h3 
             className="font-bold text-neutral-900 dark:text-neutral-100 truncate leading-tight mb-1 sm:mb-1.5 tracking-tight"
             style={{ fontSize: 'calc(10px * var(--text-scale, 1.4))' }}
           >
            {item.name || "未命名"}
          </h3>
          
          <div 
            className="flex flex-wrap gap-1.5 sm:gap-2 text-neutral-500 dark:text-neutral-400 font-medium"
            style={{ fontSize: 'calc(8.5px * var(--text-scale, 1.4))' }}
          >
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.4)]"></span>
              <span>{item.calory || '-'}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]"></span>
              <span>P:{item.protein || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}