export interface Client {
  id: string;
  name: string;
  company: string;
  status: 'cold' | 'warm' | 'hot';
  howWeMet: string;
  lastContacted: string;
  birthday: string;
  needs: string;
  howHelped: string;
  plans: string;
  preferences: {
    family: string[];
    holidays: { date: string; destination: string }[];
    food: string[];
    hobbies: string[];
  };
  budget: '$' | '$$' | '$$$';
  meetingHistory: MeetingNote[];
}

export interface MeetingNote {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  location: string;
  topics: string[];
  followUps: { task: string; done: boolean }[];
  smallTalk: {
    family?: string;
    holidays?: string;
    food?: string;
    hobbies?: string;
  };
}

export interface CalendarEvent {
  time: string;
  title: string;
  location: string;
  clientId?: string;
}

export interface Todo {
  id?: string;
  task: string;
  clientId: string;
  clientName: string;
  suggestedTime?: string;
  done?: boolean;
}

export interface NewsItem {
  headline: string;
  source: string;
  relevantClients: string[];
  shareNote: string;
}
