"use client"

import { Fragment, useEffect, useState } from "react"

const nutrientKeys = {
  calory: ["calory", "calorie", "energy"],
  protein: ["protein"],
  fat: ["fat"],
  carb: ["carbohydrate", "carb", "carbs"]
}

function pickValue(item, keys) {
  for (const key of keys) {
    const value = item?.[key]
    if (value !== undefined && value !== null && value !== "") {
      return value
    }
  }
  return "-"
}

function formatImage(item) {
  return item?.thumb_image_url || item?.image_url || item?.image || ""
}

export default function Home() {
  const [foods, setFoods] = useState([])
  const [filters, setFilters] = useState({ categories: [] })
  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [activeItem, setActiveItem] = useState(null)
  const [editedItem, setEditedItem] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [cardScale, setCardScale] = useState(0.7)
  const [textScale, setTextScale] = useState(1.4)
  const [preferMaterials, setPreferMaterials] = useState(false)
  const [jumpPage, setJumpPage] = useState("1")
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    fetch("/api/filters")
      .then((res) => res.json())
      .then((data) => setFilters(data))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (selectedCategories.length)
      params.set("category", selectedCategories.join(","))
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
  }, [search, selectedCategories, page, pageSize, preferMaterials])

  useEffect(() => {
    setJumpPage(String(page))
  }, [page])

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
    const res = await fetch(`/api/foods/${item.id}`)
    const data = await res.json()
    setActiveItem(data.item || item)
    setEditedItem(structuredClone(data.item || item))
  }

  const closeDetail = () => {
    setActiveItem(null)
    setEditedItem(null)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
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
    }
  }

  const handleDeleteDetail = async () => {
    if (!activeItem) return
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

  const toggleSelectAll = () => {
    if (selectedIds.length === foods.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(foods.map((item) => item.id))
  }

  const handleFieldChange = (key, value) => {
    setEditedItem((prev) => ({ ...prev, [key]: value }))
  }

  const renderValue = (key, value) => {
    if (key === "image_file") {
      if (!value) return "-"
      return "[binary] " + String(value).slice(0, 120) + "..."
    }
    if (value === null || value === undefined) return "-"
    if (typeof value === "object") {
      return JSON.stringify(value)
    }
    return String(value)
  }

  const renderEditor = (key, value) => {
    if (key === "_id" || key === "image_file") {
      return (
        <div className="kv-value muted">{renderValue(key, value)}</div>
      )
    }
    if (typeof value === "object" && value !== null) {
      return (
        <textarea
          className="inline-editor"
          value={JSON.stringify(value)}
          onChange={(e) => {
            try {
              handleFieldChange(key, JSON.parse(e.target.value))
            } catch (error) {
              handleFieldChange(key, e.target.value)
            }
          }}
        />
      )
    }
    return (
      <input
        className="inline-input"
        value={value ?? ""}
        onChange={(e) => handleFieldChange(key, e.target.value)}
      />
    )
  }

  return (
    <div className="app" style={{ gridTemplateColumns: sidebarHidden ? "1fr" : undefined }}>
      {!sidebarHidden && (
      <aside className="sidebar">
        <div>
          <h2>筛选</h2>
          <div className="filters">
            <div className="filter-group">
              <h3>分类</h3>
              <div className="filter-list">
                {filters.categories?.map((category) => (
                  <label className="filter-item" key={category}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
      )}
      <main className="content">
        <div className="header">
          <div className="search">
            <input
              placeholder="搜索名称 / ID / 编码"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <span className="muted">
              {loading ? "加载中..." : `共 ${total} 条`}
            </span>
          </div>
          <div className="top-actions">
            <button
              className="toggle"
              onClick={() => setSidebarHidden((prev) => !prev)}
            >
              {sidebarHidden ? "显示边栏" : "隐藏边栏"}
            </button>
            <button className="toggle" onClick={() => setShowSettings(true)}>
              设置
            </button>
          </div>
        </div>
        <div className="scale-bars">
          <div className="scale-bar">
            <span>卡片缩放</span>
            <input
              type="range"
              min="0.4"
              max="1.5"
              step="0.05"
              value={cardScale}
              onChange={(e) => setCardScale(Number(e.target.value))}
            />
            <span className="muted">{Math.round(cardScale * 100)}%</span>
          </div>
          <div className="scale-bar">
            <span>文字缩放</span>
            <input
              type="range"
              min="0.6"
              max="3"
              step="0.05"
              value={textScale}
              onChange={(e) => setTextScale(Number(e.target.value))}
            />
            <span className="muted">{Math.round(textScale * 100)}%</span>
          </div>
        </div>
        {editMode && (
          <div className="toolbar">
            <button className="primary" onClick={toggleSelectAll}>
              {selectedIds.length === foods.length ? "取消全选" : "全选"}
            </button>
            <button className="danger" onClick={handleBulkDelete}>
              批量删除
            </button>
            <span className="muted">已选择 {selectedIds.length} 项</span>
          </div>
        )}
        {foods.length === 0 && !loading ? (
          <div className="empty-state">暂无数据</div>
        ) : (
          <div
            className="grid"
            style={{
              "--card-scale": String(cardScale),
              "--text-scale": String(textScale)
            }}
          >
            {foods.map((item) => (
              <div className="card-wrap" key={item.id}>
                {editMode && (
                  <label className="card-select">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id]
                        )
                      }
                    />
                    选中
                  </label>
                )}
                <div className="card" onClick={() => openDetail(item)}>
                  <div className="card-media">
                    {formatImage(item) ? (
                      <img src={formatImage(item)} alt={item.name} />
                    ) : (
                      <div className="card-image-placeholder" />
                    )}
                    <div className="card-id-badge">ID {item.id}</div>
                    <div className="card-info">
                      <div className="card-title">{item.name || "未命名"}</div>
                      <div className="card-meta">
                        <span>热量 {pickValue(item, nutrientKeys.calory)}</span>
                        <span>蛋白质 {pickValue(item, nutrientKeys.protein)}</span>
                        <span>脂肪 {pickValue(item, nutrientKeys.fat)}</span>
                        <span>碳水 {pickValue(item, nutrientKeys.carb)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
            上一页
          </button>
          <span>
            第 {page} / {totalPages} 页
          </span>
          <div className="page-jump">
            <input
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="页码"
            />
            <button
              onClick={() => {
                const next = Math.min(
                  totalPages,
                  Math.max(1, Number(jumpPage || 1))
                )
                setPage(next)
              }}
            >
              跳转
            </button>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            下一页
          </button>
        </div>
      </main>
      {activeItem && (
        <div className="modal-backdrop" onClick={closeDetail}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="card-title">{activeItem.name || "未命名"}</div>
                <div className="muted">ID {activeItem.id}</div>
              </div>
              <div className="top-actions">
                {editMode && (
                  <>
                    <button className="primary" onClick={handleSaveDetail}>
                      保存
                    </button>
                    <button className="danger" onClick={handleDeleteDetail}>
                      删除
                    </button>
                  </>
                )}
                <button className="toggle" onClick={closeDetail}>
                  关闭
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="detail-image">
                {formatImage(activeItem) ? (
                  <img src={formatImage(activeItem)} alt={activeItem.name} />
                ) : (
                  <div className="detail-image-placeholder">暂无图片</div>
                )}
              </div>
              <div className="kv-list">
                {Object.entries(editMode ? editedItem || {} : activeItem).map(
                  ([key, value]) => (
                    <Fragment key={key}>
                      <div className="kv-key">{key}</div>
                      {editMode ? (
                        renderEditor(key, value)
                      ) : (
                        <div className="kv-value">{renderValue(key, value)}</div>
                      )}
                    </Fragment>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">设置</div>
              <button className="toggle" onClick={() => setShowSettings(false)}>
                关闭
              </button>
            </div>
            <div className="settings-list">
              <div className="settings-row">
                <span>模式</span>
                <button
                  className={`toggle ${editMode ? "active" : ""}`}
                  onClick={toggleEditMode}
                >
                  {editMode ? "编辑模式" : "只读模式"}
                </button>
              </div>
              <div className="settings-row">
                <span>优先显示菜</span>
                <button
                  className={`toggle ${preferMaterials ? "active" : ""}`}
                  onClick={() => {
                    setPage(1)
                    setPreferMaterials((prev) => !prev)
                  }}
                >
                  {preferMaterials ? "已开启" : "未开启"}
                </button>
              </div>
              <div className="settings-row">
                <span>每页数量</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPage(1)
                    setPageSize(Number(e.target.value))
                  }}
                >
                  {[12, 24, 36, 48, 60, 80, 100, 120].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
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
