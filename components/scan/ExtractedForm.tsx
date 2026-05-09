'use client';

import { MeetingNote } from '@/data/mock';

interface ExtractedFormProps {
  data: MeetingNote;
  onChange: (data: MeetingNote) => void;
  onSave: () => void;
  onReset: () => void;
}

export default function ExtractedForm({ data, onChange, onSave, onReset }: ExtractedFormProps) {
  function updateTopic(index: number, value: string) {
    const updated = [...data.topics];
    updated[index] = value;
    onChange({ ...data, topics: updated });
  }

  function addTopic() {
    onChange({ ...data, topics: [...data.topics, ''] });
  }

  function removeTopic(index: number) {
    onChange({ ...data, topics: data.topics.filter((_, i) => i !== index) });
  }

  function updateFollowUp(index: number, value: string) {
    const updated = [...data.followUps];
    updated[index] = { ...updated[index], task: value };
    onChange({ ...data, followUps: updated });
  }

  function toggleFollowUp(index: number) {
    const updated = [...data.followUps];
    updated[index] = { ...updated[index], done: !updated[index].done };
    onChange({ ...data, followUps: updated });
  }

  function addFollowUp() {
    onChange({ ...data, followUps: [...data.followUps, { task: '', done: false }] });
  }

  function removeFollowUp(index: number) {
    onChange({ ...data, followUps: data.followUps.filter((_, i) => i !== index) });
  }

  function updateSmallTalk(key: keyof NonNullable<MeetingNote['smallTalk']>, value: string) {
    onChange({ ...data, smallTalk: { ...data.smallTalk, [key]: value || undefined } });
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
        ✅ Notes extracted! Review and edit below, then save.
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-500">Client</label>
        <input
          value={data.clientName}
          onChange={(e) => onChange({ ...data, clientName: e.target.value })}
          className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white focus:border-orange-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-slate-500">Date</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => onChange({ ...data, date: e.target.value })}
            className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white focus:border-orange-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-500">Location</label>
          <input
            value={data.location}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            className="w-full mt-1 p-3 rounded-lg border border-orange-200 bg-white focus:border-orange-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-slate-500">Topics Discussed</label>
          <button onClick={addTopic} className="text-xs text-orange-500 font-semibold hover:underline">+ Add topic</button>
        </div>
        <div className="space-y-2">
          {data.topics.map((topic, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-orange-400">•</span>
              <input
                value={topic}
                onChange={(e) => updateTopic(i, e.target.value)}
                className="flex-1 p-2 rounded-lg border border-orange-200 bg-white text-sm focus:border-orange-400 focus:outline-none"
                placeholder="Topic..."
              />
              <button onClick={() => removeTopic(i)} className="text-slate-400 hover:text-red-400 text-sm">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-slate-500">Follow-ups</label>
          <button onClick={addFollowUp} className="text-xs text-orange-500 font-semibold hover:underline">+ Add follow-up</button>
        </div>
        <div className="space-y-2">
          {data.followUps.map((fu, i) => (
            <div key={i} className="flex items-center gap-2 glass p-3">
              <input
                type="checkbox"
                checked={fu.done}
                onChange={() => toggleFollowUp(i)}
                className="size-4 rounded accent-orange-500"
              />
              <input
                value={fu.task}
                onChange={(e) => updateFollowUp(i, e.target.value)}
                className="flex-1 p-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-orange-300"
                placeholder="Follow-up task..."
              />
              <button onClick={() => removeFollowUp(i)} className="text-slate-400 hover:text-red-400 text-sm">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-500">Personal Notes</label>
        <div className="space-y-2 mt-1">
          <div className="glass p-3">
            <span className="text-xs font-semibold text-rose-600">👨‍👩‍👧‍👦 FAMILY</span>
            <input
              value={data.smallTalk?.family || ''}
              onChange={(e) => updateSmallTalk('family', e.target.value)}
              className="w-full mt-1 p-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-orange-300"
              placeholder="Family details mentioned..."
            />
          </div>
          <div className="glass p-3">
            <span className="text-xs font-semibold text-blue-600">✈️ HOLIDAYS</span>
            <input
              value={data.smallTalk?.holidays || ''}
              onChange={(e) => updateSmallTalk('holidays', e.target.value)}
              className="w-full mt-1 p-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-orange-300"
              placeholder="Travel/holiday plans mentioned..."
            />
          </div>
          <div className="glass p-3">
            <span className="text-xs font-semibold text-amber-600">🍽️ FOOD</span>
            <input
              value={data.smallTalk?.food || ''}
              onChange={(e) => updateSmallTalk('food', e.target.value)}
              className="w-full mt-1 p-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-orange-300"
              placeholder="Food preferences mentioned..."
            />
          </div>
          <div className="glass p-3">
            <span className="text-xs font-semibold text-green-600">🎨 HOBBIES</span>
            <input
              value={data.smallTalk?.hobbies || ''}
              onChange={(e) => updateSmallTalk('hobbies', e.target.value)}
              className="w-full mt-1 p-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-orange-300"
              placeholder="Hobbies mentioned..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-semibold hover:opacity-90"
        >
          💾 Save to Client
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-200 text-[var(--color-warm-text)] rounded-xl font-semibold hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
