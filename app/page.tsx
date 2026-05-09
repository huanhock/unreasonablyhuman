import GreetingCard from '@/components/cards/GreetingCard';
import SummaryCard from '@/components/cards/SummaryCard';
import CalendarCard from '@/components/cards/CalendarCard';
import TodosCard from '@/components/cards/TodosCard';
import BirthdaysCard from '@/components/cards/BirthdaysCard';
import CheckinsCard from '@/components/cards/CheckinsCard';
import NewsCard from '@/components/cards/NewsCard';
import ClosingCard from '@/components/cards/ClosingCard';
import AudioPlayer from '@/components/AudioPlayer';
import PostMeetingPrompt from '@/components/PostMeetingPrompt';

export default function DailyBriefPage() {
  return (
    <>
      <div className="space-y-4 p-4 pb-24">
        <PostMeetingPrompt />
        <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <GreetingCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SummaryCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CalendarCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <TodosCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <BirthdaysCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <CheckinsCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <NewsCard />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <ClosingCard />
        </div>
      </div>
      <AudioPlayer />
    </>
  );
}
