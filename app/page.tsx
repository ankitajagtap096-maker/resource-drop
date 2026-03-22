'use client'

// 'use client' tells Next.js this component runs in the browser,
// not on the server. We need this because we're using React state
// (useState, useEffect) which only works in the browser.

import { useState, useEffect } from 'react'
import { supabase, Resource } from '@/lib/supabase'

// --- Tag colours ---
// Each tag gets its own colour so cards are visually scannable at a glance.
const TAG_STYLES: Record<Resource['tag'], string> = {
  design:  'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30',
  product: 'bg-blue-500/20   text-blue-300   ring-1 ring-blue-500/30',
  tech:    'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
  career:  'bg-amber-500/20  text-amber-300  ring-1 ring-amber-500/30',
  general: 'bg-gray-500/20   text-gray-300   ring-1 ring-gray-500/30',
}

// --- Relative time helper ---
// Converts a UTC timestamp into a human-readable "X ago" string.
// We do this ourselves to avoid adding a whole library for one function.
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60)    return `${seconds}s ago`
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// --- Empty form state ---
// Defined once here so we can reset back to it after a successful submit.
const EMPTY_FORM = { title: '', url: '', tag: 'general' as Resource['tag'], submitted_by: '' }

export default function Home() {
  // form holds what the user is currently typing
  const [form, setForm] = useState(EMPTY_FORM)

  // resources holds all the cards fetched from Supabase
  const [resources, setResources] = useState<Resource[]>([])

  // status tracks what's happening: idle / submitting / error message
  const [status, setStatus] = useState<'idle' | 'submitting' | string>('idle')

  // --- Fetch all resources on first load ---
  // useEffect with [] runs once when the page first opens,
  // like an "on mount" event. We use it to load existing data.
  useEffect(() => {
    fetchResources()
  }, [])

  async function fetchResources() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false }) // newest first

    if (error) {
      console.error('Failed to fetch resources:', error.message)
      return
    }
    setResources(data as Resource[])
  }

  // --- Handle form submission ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // stops the browser from reloading the page on submit

    // Basic validation — all fields are required
    if (!form.title.trim() || !form.url.trim() || !form.submitted_by.trim()) {
      setStatus('Please fill in all fields.')
      return
    }

    // Make sure the URL is actually a URL
    try {
      new URL(form.url)
    } catch {
      setStatus('Please enter a valid URL (include https://)')
      return
    }

    setStatus('submitting')

    const { error } = await supabase.from('resources').insert([
      {
        title:        form.title.trim(),
        url:          form.url.trim(),
        tag:          form.tag,
        submitted_by: form.submitted_by.trim(),
      },
    ])

    if (error) {
      setStatus(`Error: ${error.message}`)
      return
    }

    // Success — clear the form and reload the feed
    setForm(EMPTY_FORM)
    setStatus('idle')
    fetchResources()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Resource Drop</h1>
          <p className="text-gray-400 text-sm mt-1">Share a useful link with the team.</p>
        </div>

        {/* ── Submit Form ── */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g. The best Figma shortcuts"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">URL</label>
            <input
              type="text"
              placeholder="https://"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Tag + Name — side by side on wider screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tag */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tag</label>
              <select
                value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value as Resource['tag'] }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="design">Design</option>
                <option value="product">Product</option>
                <option value="tech">Tech</option>
                <option value="career">Career</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Your name */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Your name</label>
              <input
                type="text"
                placeholder="e.g. Ankita"
                value={form.submitted_by}
                onChange={e => setForm(f => ({ ...f, submitted_by: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error message — only shown when status is a string other than 'idle'/'submitting' */}
          {status !== 'idle' && status !== 'submitting' && (
            <p className="text-red-400 text-xs">{status}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {status === 'submitting' ? 'Submitting…' : 'Drop it'}
          </button>
        </form>

        {/* ── Feed ── */}
        <div className="space-y-3">
          {/* Empty state — shown when there are no resources yet */}
          {resources.length === 0 && (
            <div className="text-center text-gray-600 py-16 text-sm">
              No resources yet. Be the first to drop one.
            </div>
          )}

          {/* Resource cards */}
          {resources.map(r => (
            <div
              key={r.id}
              className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 hover:border-gray-700 transition-colors"
            >
              {/* Top row: title link + tag badge */}
              <div className="flex items-start justify-between gap-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-100 hover:text-indigo-400 transition-colors leading-snug"
                >
                  {r.title}
                </a>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${TAG_STYLES[r.tag]}`}>
                  {r.tag}
                </span>
              </div>

              {/* Bottom row: who submitted + when */}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{r.submitted_by}</span>
                <span>·</span>
                <span>{timeAgo(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
