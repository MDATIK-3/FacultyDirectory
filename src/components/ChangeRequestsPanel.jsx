import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const ACTION_LABELS = {
  insert: 'New member',
  update: 'Edit member',
  delete: 'Remove member',
}

const REQUEST_STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  approved: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
  rejected: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
}

const FIELD_LABELS = {
  name: 'Name',
  designation: 'Designation',
  code: 'Code',
  contact_no: 'Contact No',
  email: 'Email',
  department: 'Department',
  status: 'Status',
}

const HIDDEN_FIELDS = ['id', 'created_at', 'img_src']

function payloadEntries(payload) {
  if (!payload) return []
  return Object.entries(payload).filter(([key, value]) => !HIDDEN_FIELDS.includes(key) && value)
}

export default function ChangeRequestsPanel({ role, session, refreshKey, onApplied }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)
  const isSuperadmin = role === 'superadmin'

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const base = supabase.from('faculty_change_requests').select('*').order('created_at', { ascending: false })
    const query = isSuperadmin ? base.eq('status', 'pending') : base.eq('requested_by', session.user.id)
    const { data, error } = await query
    if (!error) setRequests(data ?? [])
    setLoading(false)
  }, [isSuperadmin, session.user.id])

  useEffect(() => {
    if (!role) return
    fetchRequests()
  }, [role, refreshKey, fetchRequests])

  async function handleApprove(request) {
    setActingId(request.id)
    try {
      if (request.action === 'insert') {
        await supabase.from('faculty_members').insert([request.payload])
      } else if (request.action === 'update') {
        await supabase.from('faculty_members').update(request.payload).eq('id', request.target_id)
      } else if (request.action === 'delete') {
        await supabase.from('faculty_members').delete().eq('id', request.target_id)
      }
      await supabase
        .from('faculty_change_requests')
        .update({
          status: 'approved',
          reviewed_by: session.user.id,
          reviewed_by_email: session.user.email,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id)
      onApplied?.()
      await fetchRequests()
    } finally {
      setActingId(null)
    }
  }

  async function handleReject(request) {
    const note = window.prompt('Optional note for the requester (visible to them):', '')
    if (note === null) return
    setActingId(request.id)
    try {
      await supabase
        .from('faculty_change_requests')
        .update({
          status: 'rejected',
          reviewed_by: session.user.id,
          reviewed_by_email: session.user.email,
          reviewed_at: new Date().toISOString(),
          review_note: note || null,
        })
        .eq('id', request.id)
      await fetchRequests()
    } finally {
      setActingId(null)
    }
  }

  if (!role || loading) return null

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          {isSuperadmin ? 'Pending Approvals' : 'My Submitted Changes'}
        </h2>
        {isSuperadmin && requests.length > 0 && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
            {requests.length} awaiting review
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-400">
          {isSuperadmin ? 'No pending changes to review.' : "You haven't submitted any changes yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full mr-2">
                    {ACTION_LABELS[request.action]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${REQUEST_STATUS_STYLES[request.status]}`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {isSuperadmin ? `Requested by ${request.requested_by_email ?? 'unknown'} · ` : ''}
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                {isSuperadmin && request.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      disabled={actingId === request.id}
                      onClick={() => handleApprove(request)}
                      className="text-xs font-semibold bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actingId === request.id}
                      onClick={() => handleReject(request)}
                      className="text-xs font-semibold bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {payloadEntries(request.payload).map(([key, value]) => (
                  <div key={key} className="flex gap-1.5 text-xs">
                    <dt className="font-semibold text-gray-500">{FIELD_LABELS[key] ?? key}:</dt>
                    <dd className="text-gray-700 truncate">{String(value)}</dd>
                  </div>
                ))}
              </dl>

              {request.review_note && (
                <p className="text-xs text-gray-500 mt-2 italic">Reviewer note: {request.review_note}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
