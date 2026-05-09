import { createClient } from '@/lib/supabase/server';
import { getProfile, getClients, getCalendarEvents, getTodos, getMeetingNotes, getBirthdaysToday, getBirthdaysUpcoming, getStaleClients } from '@/lib/db';
import { todayNews } from '@/data/mock';
import GreetingCard from '@/components/cards/GreetingCard';
import SummaryCard from '@/components/cards/SummaryCard';
import StatsCard from '@/components/cards/StatsCard';
import CalendarCard from '@/components/cards/CalendarCard';
import TodosCard from '@/components/cards/TodosCard';
import BirthdaysCard from '@/components/cards/BirthdaysCard';
import CheckinsCard from '@/components/cards/CheckinsCard';
import NewsCard from '@/components/cards/NewsCard';
import ClosingCard from '@/components/cards/ClosingCard';
import AudioPlayer from '@/components/AudioPlayer';
import SeedPrompt from '@/components/SeedPrompt';
import CardDeck from '@/components/CardDeck';
import Onboarding from '@/components/Onboarding';

export default async function DailyBriefPage() {
  const supabase = await createClient();
  const profile = await getProfile(supabase);
  const userName = profile?.display_name || 'there';

  const today = new Date().toISOString().split('T')[0];
  const [clients, events, todos, meetingNotes, allTodos] = await Promise.all([
    getClients(supabase),
    getCalendarEvents(supabase, today),
    getTodos(supabase, false),
    getMeetingNotes(supabase),
    getTodos(supabase),
  ]);

  const hasData = clients.length > 0;
  const birthdaysToday = getBirthdaysToday(clients);
  const birthdaysUpcoming = getBirthdaysUpcoming(clients);
  const staleClients = getStaleClients(clients);

  const clientCount = clients.length;
  const meetingCount = meetingNotes.length;
  const todosDone = allTodos.filter(t => t.done).length;
  const todosTotal = allTodos.length;
  const hotClients = clients.filter(c => c.status === 'hot').length;
  const warmClients = clients.filter(c => c.status === 'warm').length;
  const coldClients = clients.filter(c => c.status === 'cold').length;

  if (!hasData) {
    return (
      <div className="space-y-4 p-4 pb-24">
        <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <GreetingCard userName={userName} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SeedPrompt />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <CardDeck>
        <GreetingCard userName={userName} />
        <SummaryCard />
        <StatsCard
          clientCount={clientCount}
          meetingCount={meetingCount}
          todosDone={todosDone}
          todosTotal={todosTotal}
          hotClients={hotClients}
          warmClients={warmClients}
          coldClients={coldClients}
        />
        <CalendarCard events={events} />
        <TodosCard todos={todos} />
        <BirthdaysCard birthdaysToday={birthdaysToday} birthdaysUpcoming={birthdaysUpcoming} />
        <CheckinsCard staleClients={staleClients} />
        <NewsCard news={todayNews} />
        <ClosingCard userName={userName} />
      </CardDeck>
      <AudioPlayer />
      <Onboarding />
    </div>
  );
}
