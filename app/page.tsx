import GreetingCard from '@/components/cards/GreetingCard';
import SummaryCard from '@/components/cards/SummaryCard';
import CalendarCard from '@/components/cards/CalendarCard';
import TodosCard from '@/components/cards/TodosCard';
import BirthdaysCard from '@/components/cards/BirthdaysCard';
import CheckinsCard from '@/components/cards/CheckinsCard';
import NewsCard from '@/components/cards/NewsCard';
import ClosingCard from '@/components/cards/ClosingCard';
import AudioPlayer from '@/components/AudioPlayer';

export default function DailyBriefPage() {
  return (
    <>
      <div className="space-y-4 p-4 pb-24">
        <GreetingCard />
        <SummaryCard />
        <CalendarCard />
        <TodosCard />
        <BirthdaysCard />
        <CheckinsCard />
        <NewsCard />
        <ClosingCard />
      </div>
      <AudioPlayer />
    </>
  );
}
