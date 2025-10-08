export interface StoryMoodMeta {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

const STORY_MOOD_MAP: Record<string, StoryMoodMeta> = {
  'inspirado': {
    id: 'inspirado',
    label: 'inspirado',
    emoji: '✨',
    gradient: DEFAULT_GRADIENT
  },
  'emocionado': {
    id: 'emocionado',
    label: 'emocionado',
    emoji: '❤️',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  'reflexivo': {
    id: 'reflexivo',
    label: 'reflexivo',
    emoji: '🤔',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  'entretido': {
    id: 'entretido',
    label: 'entretido',
    emoji: '😄',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  'surpreso': {
    id: 'surpreso',
    label: 'surpreso',
    emoji: '😮',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  'relaxado': {
    id: 'relaxado',
    label: 'relaxado',
    emoji: '😌',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  'ansioso': {
    id: 'ansioso',
    label: 'ansioso',
    emoji: '😰',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  'nostálgico': {
    id: 'nostálgico',
    label: 'nostálgico',
    emoji: '💭',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  }
};

const DEFAULT_STORY_MOOD: StoryMoodMeta = {
  id: 'default',
  label: 'default',
  emoji: '📚',
  gradient: DEFAULT_GRADIENT
};

export const getStoryMoodMeta = (mood?: string): StoryMoodMeta => {
  if (!mood) {
    return DEFAULT_STORY_MOOD;
  }

  const normalized = mood.trim().toLowerCase();

  if (!normalized) {
    return DEFAULT_STORY_MOOD;
  }

  return STORY_MOOD_MAP[normalized] || {
    ...DEFAULT_STORY_MOOD,
    label: normalized
  };
};

export const storyMoodOptions: StoryMoodMeta[] = Object.values(STORY_MOOD_MAP);
