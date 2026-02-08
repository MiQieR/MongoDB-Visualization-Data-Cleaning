import { X, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export function DetailView({ item, editedItem, editMode, onClose, onSave, onDelete, onChange }) {
  const [localItem, setLocalItem] = useState(editMode && editedItem ? editedItem : item);

  useEffect(() => {
    setLocalItem(editMode && editedItem ? editedItem : item);
  }, [item, editedItem, editMode]);

  const handleChange = (key, value) => {
    onChange(key, value);
    setLocalItem(prev => ({ ...prev, [key]: value }));
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return <span className="text-neutral-300">-</span>;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const renderEditor = (key, value) => {
    if (key === "_id" || key === "id") {
       return <div className="py-2 text-neutral-500 font-mono text-xs">{value}</div>;
    }

    if (typeof value === "object" && value !== null) {
      return (
        <textarea
          className="w-full h-32 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-sm font-mono focus:ring-2 focus:ring-blue-500/50 resize-y text-neutral-900 dark:text-white"
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
             try {
               handleChange(key, JSON.parse(e.target.value));
             } catch (err) {
               // Allow typing invalid JSON temporarily
             }
          }}
        />
      );
    }

    // Long text detection
    if (String(value).length > 50) {
        return (
            <textarea
              className="w-full h-24 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-neutral-900 dark:text-white"
              value={value || ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
        )
    }

    return (
      <input
        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-neutral-900 dark:text-white"
        value={value || ""}
        onChange={(e) => handleChange(key, e.target.value)}
      />
    );
  };

  const imageUrl = localItem?.thumb_image_url || localItem?.image_url || localItem?.image;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="
        relative z-10 w-full sm:max-w-2xl h-[100dvh] sm:h-full 
        bg-white dark:bg-neutral-900 backdrop-blur-2xl
        sm:border-l border-white/20 dark:border-neutral-800 shadow-2xl
        flex flex-col animate-in slide-in-from-right duration-500 ease-out
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white truncate">
              {editMode ? "编辑数据" : "数据详情"}
            </h2>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">ID: {item.id}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-4 flex-shrink-0">
            {editMode && (
              <>
                <button 
                  onClick={onDelete}
                  className="p-2 sm:p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={onSave}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <Save size={18} />
                  <span className="hidden xs:inline">保存</span>
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8 sm:mb-10">
                <div className="w-full sm:w-40 aspect-square sm:h-40 flex-shrink-0 rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-xl">
                    {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs font-bold uppercase tracking-widest">No Image</div>
                    )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                     {editMode ? (
                        <div className="space-y-4">
                             <div>
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">食物名称</label>
                                <input 
                                    className="w-full mt-1 text-xl sm:text-2xl font-black bg-transparent border-b-2 border-neutral-100 dark:border-neutral-800 focus:border-blue-500 outline-none pb-2 text-neutral-900 dark:text-white"
                                    value={localItem.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                             </div>
                        </div>
                     ) : (
                         <div className="space-y-2">
                            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{localItem.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Category ID: {localItem.category_id}</span>
                            </div>
                         </div>
                     )}
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(localItem).map(([key, value]) => {
                    if (key === 'image_file' || key === 'name') return null;
                    return (
                        <div key={key} className="space-y-2 py-4 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0">
                            <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
                                {key}
                            </div>
                            <div className="min-w-0">
                                {editMode ? renderEditor(key, value) : (
                                    <div className="text-sm text-neutral-700 dark:text-neutral-300 break-words leading-relaxed font-medium">
                                        {renderValue(key, value)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
}