import type { Todo } from '@/lib/types';

export default function TodosCard({ todos }: { todos: Todo[] }) {
  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-800 mb-4">✅ Follow-up Todos</h2>
      <div className="space-y-3">
        {todos.map((todo, i) => (
          <div key={todo.id || i} className="glass p-4">
            <p className="font-semibold text-[var(--color-warm-text)]">{todo.task}</p>
            <p className="text-sm text-[var(--color-warm-text)]/70">
              {todo.clientName} {todo.suggestedTime && `· Suggested: ${todo.suggestedTime}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
