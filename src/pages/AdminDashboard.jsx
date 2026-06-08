import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BsSearch } from 'react-icons/bs'
import DEPARTMENTS from '../constants/departments'
import ChangeRequestsPanel from '../components/ChangeRequestsPanel'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
  leave_study: 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  formal: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
}

const STATUS_LABELS = {
  active: 'Active',
  leave_study: 'Study Leave',
  formal: 'Formal',
}

const EMPTY_FORM = {
  name: '',
  designation: '',
  code: '',
  contact_no: '',
  email: '',
  img_src: '',
  department: '',
  status: 'active',
}

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition'

const LABEL_CLASS =
  'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('faculty-images')
    .upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('faculty-images').getPublicUrl(fileName)
  return data.publicUrl
}

export default function AdminDashboard({ session }) {
  const [faculty, setFaculty] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [listQuery, setListQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState(null)
  const [role, setRole] = useState(null)
  const [requestsVersion, setRequestsVersion] = useState(0)
  const fileInputRef = useRef(null)
  const deptScrollRef = useRef(null)

  const isSuperadmin = role === 'superadmin'

  useEffect(() => {
    fetchFaculty()
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setRole(data?.role ?? 'admin')
      })
    return () => {
      cancelled = true
    }
  }, [session.user.id])

  function refreshRequests() {
    setRequestsVersion((v) => v + 1)
  }

  useEffect(() => {
    const el = deptScrollRef.current
    if (!el) return
    const onWheel = (e) => {
      if (e.deltaY === 0 && e.deltaX === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY || e.deltaX
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  async function fetchFaculty() {
    const { data, error } = await supabase
      .from('faculty_members')
      .select('*')
      .order('department')
      .order('name')
    if (error) {
      setFetchError(error.message)
    } else {
      setFaculty(data)
      setFetchError(null)
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const processFile = useCallback((file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) processFile(file)
  }

  function handleDragEnter(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragging(false)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    setForm((prev) => ({ ...prev, img_src: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function submitChangeRequest(action, targetId, payload) {
    await supabase.from('faculty_change_requests').insert([
      {
        action,
        target_id: targetId,
        payload,
        requested_by: session.user.id,
        requested_by_email: session.user.email,
      },
    ])
    refreshRequests()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      let finalImgSrc = form.img_src
      if (imageFile) {
        finalImgSrc = await uploadImage(imageFile)
      }
      const payload = { ...form, img_src: finalImgSrc }
      if (isSuperadmin) {
        if (editingId) {
          await supabase.from('faculty_members').update(payload).eq('id', editingId)
        } else {
          await supabase.from('faculty_members').insert([payload])
        }
        await fetchFaculty()
      } else {
        await submitChangeRequest(editingId ? 'update' : 'insert', editingId, payload)
      }
      setEditingId(null)
      setForm(EMPTY_FORM)
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(member) {
    setEditingId(member.id)
    setForm({
      name: member.name,
      designation: member.designation,
      code: member.code ?? '',
      contact_no: member.contact_no ?? '',
      email: member.email,
      img_src: member.img_src ?? '',
      department: member.department,
      status: member.status,
    })
    setImageFile(null)
    setImagePreview(member.img_src ?? null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(id, name) {
    if (isSuperadmin) {
      if (!window.confirm(`Delete "${name}"?\n\nThis action cannot be undone.`)) return
      await supabase.from('faculty_members').delete().eq('id', id)
      await fetchFaculty()
    } else {
      if (!window.confirm(`Submit deletion of "${name}" for superadmin approval?`)) return
      const member = faculty.find((m) => m.id === id) ?? null
      await submitChangeRequest('delete', id, member)
      window.alert('Submitted — waiting for superadmin approval. The member will remain visible until approved.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const filteredFaculty = faculty
    .filter((m) => !deptFilter || m.department === deptFilter)
    .filter((m) =>
      !listQuery.trim() ||
      [m.name, m.code, m.designation, m.department, m.email, m.contact_no].some((f) =>
        f?.toLowerCase().includes(listQuery.toLowerCase())
      )
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">Faculty Admin Dashboard</h1>
            <Link to="/" className="text-xs text-green-700 hover:underline">
              ← View Public Directory
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 sm:px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              {editingId ? 'Edit Faculty Member' : 'Add New Faculty Member'}
            </h2>
            {!isSuperadmin && role && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                Your changes are submitted to a superadmin for approval and won&apos;t appear on the public site until accepted.
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className={LABEL_CLASS}>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Dr. Jane Smith"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className={INPUT_CLASS + ' bg-white'}
                >
                  <option value="" disabled className="text-gray-400">
                    Select a department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.dbValue} value={dept.dbValue}>
                      {dept.full}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Designation</label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  required
                  placeholder="Associate Professor"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Code</label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="JS"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@university.edu"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Contact No</label>
                <input
                  name="contact_no"
                  value={form.contact_no}
                  onChange={handleChange}
                  placeholder="01700000000"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={INPUT_CLASS + ' bg-white'}
                >
                  <option value="active">Active</option>
                  <option value="leave_study">Leave Study</option>
                  <option value="formal">Formal</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Photo</label>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex-1 relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                      ${isDragging
                        ? 'border-green-500 bg-green-50 scale-[1.01]'
                        : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                      }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center py-5 sm:py-6 px-4 text-center pointer-events-none">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <svg className={`w-5 h-5 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      {isDragging ? (
                        <p className="text-sm font-semibold text-green-600">Drop to upload</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-600">
                            Drag & drop or <span className="text-green-700 underline">browse</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {imageFile ? imageFile.name : 'JPG, PNG, WEBP'}
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {imagePreview && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold flex items-center justify-center shadow transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-lg transition-colors"
              >
                {submitting
                  ? 'Saving…'
                  : isSuperadmin
                  ? editingId
                    ? 'Update Member'
                    : 'Add Member'
                  : 'Submit for Approval'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <ChangeRequestsPanel role={role} session={session} refreshKey={requestsVersion} onApplied={fetchFaculty} />

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:flex-1">
              <h2 className="text-base font-semibold text-gray-900">All Faculty Members</h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                {filteredFaculty.length}{(listQuery.trim() || deptFilter) && faculty.length !== filteredFaculty.length ? ` of ${faculty.length}` : ''} records
              </span>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name, code, department…"
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50"
              />
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              {listQuery && (
                <button
                  onClick={() => setListQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Department filter row */}
          <div ref={deptScrollRef} className="px-4 sm:px-6 py-2.5 border-b border-gray-100 overflow-x-auto scrollbar-hide cursor-ew-resize">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setDeptFilter(null)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                  deptFilter === null
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.short}
                  onClick={() => setDeptFilter(deptFilter === dept.dbValue ? null : dept.dbValue)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                    deptFilter === dept.dbValue
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dept.dbValue}
                </button>
              ))}
            </div>
          </div>

          {fetchError && (
            <div className="px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
              {fetchError}
            </div>
          )}

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredFaculty.map((m) => (
              <div key={m.id} className="p-4 flex gap-3">
                <div className="flex-shrink-0">
                  {m.img_src ? (
                    <img
                      src={m.img_src}
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{m.name}</p>
                      {m.code && (
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                          {m.code}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[m.status]}`}>
                      {STATUS_LABELS[m.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{m.department}</p>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredFaculty.length === 0 && !fetchError && (
              <div className="px-6 py-14 text-center text-gray-400 text-sm">
                {listQuery.trim() ? `No results for "${listQuery}"` : 'No faculty members yet. Add the first one above.'}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Photo
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Code
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFaculty.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      {m.img_src ? (
                        <img
                          src={m.img_src}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {m.code ? (
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {m.code}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                      {m.department}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[m.status]}`}>
                        {STATUS_LABELS[m.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleEdit(m)}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFaculty.length === 0 && !fetchError && (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-gray-400">
                      {listQuery.trim() ? `No results for "${listQuery}"` : 'No faculty members yet. Add the first one above.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
