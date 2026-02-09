"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, Settings, ChevronLeft, ChevronRight, X, Loader2, CheckSquare, Square, Type, Maximize } from "lucide-react"
import { Sidebar } from "./components/Sidebar"
import { FoodCard } from "./components/FoodCard"
import { DetailView } from "./components/DetailView"

export default function Home() {
  // State
  const [foods, setFoods] = useState([])
  const [filters, setFilters] = useState({ categories: [] })
  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [total, setTotal] = useState(0)
  const [dbTotal, setDbTotal] = useState(0) // Total items in DB
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [activeItem, setActiveItem] = useState(null)
  const [editedItem, setEditedItem] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [preferMaterials, setPreferMaterials] = useState(false)
  const [jumpPage, setJumpPage] = useState("1")
  const [sidebarHidden, setSidebarHidden] = useState(true)
  
  // Settings State with persistence initialization
  const [cardScale, setCardScale] = useState(1.0)
  const [textScale, setTextScale] = useState(1.0)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Initialization Effect (Load from LocalStorage)
  useEffect(() => {
    // Set initial sidebar state based on screen width
    if (window.innerWidth >= 1024) {
      setSidebarHidden(false)
    }

    // Load Settings
    const savedCardScale = localStorage.getItem('food-admin-card-scale')
    if (savedCardScale) setCardScale(parseFloat(savedCardScale))
    
    const savedTextScale = localStorage.getItem('food-admin-text-scale')
    if (savedTextScale) setTextScale(parseFloat(savedTextScale))
    
    const savedPageSize = localStorage.getItem('food-admin-page-size')
    if (savedPageSize) setPageSize(parseInt(savedPageSize))

    setIsInitialized(true)
    
    fetch("/api/filters")
      .then((res) => res.json())
      .then((data) => setFilters(data))
      
    // Fetch initial DB total (no filters)
    fetch("/api/foods?page=1&pageSize=1")
      .then((res) => res.json())
      .then((data) => setDbTotal(data.total || 0))
  }, [])
  
  // Persistence Effects
  useEffect(() => {
      if (isInitialized) localStorage.setItem('food-admin-card-scale', cardScale.toString())
  }, [cardScale, isInitialized])

  // Theme 固定为深色，无需系统或用户设置

  useEffect(() => {
      if (isInitialized) localStorage.setItem('food-admin-text-scale', textScale.toString())
  }, [textScale, isInitialized])
  
  useEffect(() => {
      if (isInitialized) localStorage.setItem('food-admin-page-size', pageSize.toString())
  }, [pageSize, isInitialized])

  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (selectedCategories.length) params.set("category", selectedCategories.join(","))
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (preferMaterials) params.set("preferMaterials", "1")
    
    setLoading(true)
    fetch(`/api/foods?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setFoods(data.items || [])
        setTotal(data.total || 0)
        setLoading(false)
        setSelectedIds([])
      })
      .catch(() => setLoading(false))
  }, [search, selectedCategories, page, pageSize, preferMaterials, isInitialized])

  useEffect(() => {
    setJumpPage(String(page))
  }, [page])

  // Handlers
  const toggleCategory = (category) => {
    setPage(1)
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    )
  }

  const toggleEditMode = () => {
    if (!editMode) {
      let token = window.localStorage.getItem("editToken") || ""
      if (!token) {
        token = window.prompt("请输入编辑令牌") || ""
        if (token) {
          window.localStorage.setItem("editToken", token)
        }
      }
    }
    setEditMode((prev) => !prev)
  }

  const openDetail = async (item) => {
    setActiveItem(item)
    if (editMode) {
        setEditedItem(structuredClone(item))
    }
    
    try {
        const res = await fetch(`/api/foods/${item.id}`)
        const data = await res.json()
        if (data.item) {
            setActiveItem(data.item)
            if (editMode) {
                setEditedItem(structuredClone(data.item))
            }
        }
    } catch (e) {
        console.error("Failed to fetch details", e)
    }
  }

  const closeDetail = () => {
    setActiveItem(null)
    setEditedItem(null)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    if (!confirm(`确定要删除 ${selectedIds.length} 项吗？`)) return
    
    const res = await fetch("/api/foods/bulk-delete", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-edit-token": window.localStorage.getItem("editToken") || ""
      },
      body: JSON.stringify({ ids: selectedIds })
    })
    if (res.ok) {
      setFoods((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      setSelectedIds([])
    }
  }

  const handleSaveDetail = async () => {
    if (!activeItem || !editedItem) return
    const payload = { ...editedItem }
    delete payload._id
    
    const res = await fetch(`/api/foods/${activeItem.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-edit-token": window.localStorage.getItem("editToken") || ""
      },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const data = await res.json()
      setActiveItem(data.item)
      setEditedItem(structuredClone(data.item))
      setFoods((prev) =>
        prev.map((item) => (item.id === data.item.id ? data.item : item))
      )
      alert("保存成功")
    } else {
        alert("保存失败")
    }
  }

  const handleDeleteDetail = async () => {
    if (!activeItem) return
    if (!confirm("确定要删除此项吗？")) return

    const res = await fetch(`/api/foods/${activeItem.id}`, {
      method: "DELETE",
      headers: {
        "x-edit-token": window.localStorage.getItem("editToken") || ""
      }
    })
    if (res.ok) {
      setFoods((prev) => prev.filter((item) => item.id !== activeItem.id))
      closeDetail()
    }
  }

  const handleSelectAll = () => {
     const pageIds = foods.map(f => f.id);
     const allSelected = pageIds.every(id => selectedIds.includes(id));
     if (allSelected) {
         setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
     } else {
         const newSelection = [...selectedIds];
         pageIds.forEach(id => {
             if (!newSelection.includes(id)) newSelection.push(id);
         });
         setSelectedIds(newSelection);
     }
  }
  
  const handleInverseSelect = () => {
      const pageIds = foods.map(f => f.id);
      const newSelection = [...selectedIds];
      const itemsToRemove = [];
      const itemsToAdd = [];
      pageIds.forEach(id => {
          if (newSelection.includes(id)) {
              itemsToRemove.push(id);
          } else {
              itemsToAdd.push(id);
          }
      });
      const finalSelection = newSelection
          .filter(id => !itemsToRemove.includes(id))
          .concat(itemsToAdd);
      setSelectedIds(finalSelection);
  }

  const handleFieldChange = (key, value) => {
    setEditedItem((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex min-h-screen font-sans selection:bg-blue-500/30 selection:text-blue-100 transition-colors duration-500">
      
      <Sidebar 
        filters={filters} 
        selectedCategories={selectedCategories} 
        onToggleCategory={toggleCategory}
        hidden={sidebarHidden}
        onClose={() => setSidebarHidden(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden relative transition-all duration-300">
        
        <header className="flex-shrink-0 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between z-20 backdrop-blur-md bg-black/40 sticky top-0 transition-all duration-500 border-b border-neutral-800 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-5">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
            <button 
              onClick={() => setSidebarHidden(!sidebarHidden)}
              className="p-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400"
            >
              <SlidersHorizontal size={20} />
            </button>
            
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                className="w-full pl-10 pr-4 sm:pr-24 py-2 sm:py-2.5 rounded-xl glass border border-neutral-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm text-sm sm:text-base text-white placeholder:text-neutral-400"
                placeholder="搜索..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-3 text-[10px] font-bold text-neutral-400 pointer-events-none uppercase tracking-tight">
                  <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">当前: {total}</span>
                  <span className="w-px h-3 bg-neutral-700"></span>
                  <span>总库: {dbTotal}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-3 sm:ml-4">
            {editMode && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <button 
                        onClick={handleSelectAll}
                        className="p-2 sm:px-3 sm:py-2 glass hover:shadow-md text-neutral-300 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                        title="全选/取消全选当前页"
                    >
                        <CheckSquare size={16} />
                        <span className="hidden md:inline">全选</span>
                    </button>
                    
                    {selectedIds.length > 0 && (
                        <>
                            <div className="w-px h-6 bg-neutral-700 mx-1 hidden sm:block"></div>
                            <span className="text-xs sm:text-sm font-medium text-neutral-400 tabular-nums">已选 {selectedIds.length}</span>
                            <button 
                                onClick={handleBulkDelete}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors"
                            >
                                删除
                            </button>
                        </>
                    )}
                </div>
            )}
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 sm:p-2.5 rounded-full glass shadow-sm hover:shadow-md transition-all text-neutral-400"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div 
            className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32 custom-scrollbar"
            style={{
                "--card-scale": cardScale,
                "--text-scale": textScale
            }}
        >
            {loading ? (
                <div className="h-full flex items-center justify-center text-neutral-400 flex-col gap-4">
                    <Loader2 size={40} className="animate-spin text-blue-500" />
                    <p>正在加载数据库...</p>
                </div>
            ) : foods.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-neutral-400 flex-col gap-2 border-2 border-dashed border-neutral-800 rounded-3xl mt-10">
                    <p className="font-medium text-lg text-neutral-400">暂无数据</p>
                    <p className="text-sm text-neutral-300">尝试调整筛选条件或搜索关键词</p>
                </div>
            ) : (
                <div 
                    className="grid gap-4 sm:gap-6 transition-all duration-300"
                    style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(calc(160px * var(--card-scale, 1)), 1fr))`
                    }}
                >
                    {foods.map(item => (
                        <FoodCard 
                            key={item.id} 
                            item={item} 
                            editMode={editMode}
                            selected={selectedIds.includes(item.id)}
                            onSelect={() => {
                                setSelectedIds(prev => 
                                    prev.includes(item.id) 
                                    ? prev.filter(id => id !== item.id) 
                                    : [...prev, item.id]
                                )
                            }}
                            onClick={() => openDetail(item)}
                        />
                    ))}
                </div>
            )}
        </div>

        <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-full px-4 flex justify-center">
             <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 glass rounded-xl sm:rounded-2xl shadow-2xl transition-colors duration-500">
                <button 
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-neutral-400"
                >
                    <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 text-xs sm:text-sm font-medium text-neutral-400">
                    <span className="hidden xs:inline">第</span>
                    <input 
                        className="w-10 sm:w-12 text-center py-0.5 sm:py-1 rounded-md glass focus:ring-2 focus:ring-blue-500 outline-none text-white font-mono"
                        value={jumpPage}
                        onChange={(e) => setJumpPage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const next = Math.min(totalPages, Math.max(1, Number(jumpPage || 1)))
                                setPage(next)
                            }
                        }}
                    />
                    <span className="opacity-50">/ {totalPages} <span className="hidden xs:inline">页</span></span>
                </div>

                <button 
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-neutral-400"
                >
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                </button>
             </div>
        </div>
      </main>

      {activeItem && (
        <DetailView 
            item={activeItem}
            editedItem={editedItem}
            editMode={editMode}
            onClose={closeDetail}
            onSave={handleSaveDetail}
            onDelete={handleDeleteDetail}
            onChange={handleFieldChange}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <div className="relative glass w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transition-colors duration-500">
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <h3 className="font-semibold text-lg text-white">设置</h3>
                    <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-neutral-800 transition-colors text-neutral-400"><X size={20}/></button>
                </div>
                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Switches */}
                    <div className="space-y-4">
                        
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300 font-medium text-sm">编辑模式</span>
                            <button 
                                onClick={toggleEditMode}
                                className={`w-11 h-6 rounded-full transition-colors relative ${editMode ? 'bg-blue-500' : 'bg-neutral-700'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${editMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                             <span className="text-neutral-300 font-medium text-sm">优先显示菜</span>
                             <button 
                                onClick={() => {
                                    setPage(1)
                                    setPreferMaterials(prev => !prev)
                                }}
                                className={`w-11 h-6 rounded-full transition-colors relative ${preferMaterials ? 'bg-blue-500' : 'bg-neutral-700'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${preferMaterials ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Scale Sliders */}
                    <div className="space-y-6 pt-2 border-t border-neutral-800">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Maximize size={12} />
                                    卡片大小
                                </label>
                                <span className="text-xs font-mono text-neutral-400">{Math.round(cardScale * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="1.5" 
                                step="0.1"
                                value={cardScale}
                                onChange={(e) => setCardScale(Number(e.target.value))}
                                className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Type size={12} />
                                    字体大小
                                </label>
                                <span className="text-xs font-mono text-neutral-400">{Math.round(textScale * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.8" 
                                max="2.0" 
                                step="0.1"
                                value={textScale}
                                onChange={(e) => setTextScale(Number(e.target.value))}
                                className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-neutral-800">
                        <span className="text-neutral-300 text-sm block font-medium">每页数量</span>
                        <select 
                            value={pageSize}
                            onChange={(e) => {
                                setPage(1)
                                setPageSize(Number(e.target.value))
                            }}
                            className="w-full px-3 py-2.5 rounded-xl glass outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-white"
                        >
                            {[12, 24, 36, 48, 60, 80, 100, 120].map((size) => (
                                <option key={size} value={size}>{size} 项 / 页</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}
