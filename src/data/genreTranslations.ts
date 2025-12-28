const GENRE_TRANSLATIONS: Record<string, string> = {
  'fiction': 'Ficção',
  'literary fiction': 'Drama',
  'science fiction': 'Ficção científica',
  'sci-fi': 'Ficção científica',
  'fantasy': 'Fantasia',
  'romance': 'Romance',
  'mystery': 'Mistério',
  'thrillers': 'Suspense',
  'thriller': 'Suspense',
  'suspense': 'Suspense',
  'horror': 'Terror',
  'adventure': 'Aventura',
  'action & adventure': 'Aventura',
  'young adult fiction': 'Young Adult',
  'young adult nonfiction': 'Young Adult',
  'young adult': 'Young Adult',
  'juvenile fiction': 'Infantil',
  'juvenile nonfiction': 'Infantil',
  'children': 'Infantil',
  'poetry': 'Poesia',
  'drama': 'Drama',
  'history': 'História',
  'biography & autobiography': 'Biografia',
  'biography': 'Biografia',
  'nonfiction': 'Não ficção',
  'self-help': 'Autodesenvolvimento',
  'health & fitness': 'Saúde e fitness',
  'business & economics': 'Negócios',
  'psychology': 'Psicologia',
  'philosophy': 'Filosofia',
  'religion': 'Religião',
  'travel': 'Viagem',
  'cooking': 'Culinária',
  'sports & recreation': 'Esportes',
  'technology & engineering': 'Tecnologia',
  'science': 'Ciência',
  'social science': 'Ciências sociais',
  'education': 'Educação',
  'computers': 'Computação',
  'humor': 'Humor',
  'true crime': 'Crime real',
  'art': 'Arte',
  'music': 'Música',
  'photography': 'Fotografia',
  'language arts & disciplines': 'Linguagem',
  'house & home': 'Casa',
  'pets': 'Animais',
  'games & activities': 'Jogos',
  'family & relationships': 'Família',
  'medical': 'Medicina',
  'nature': 'Natureza',
  'political science': 'Política',
  'law': 'Direito',
  'reference': 'Referência',
  'comics & graphic novels': 'Quadrinhos'
};

const normalizeGenreKey = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const translateGenreSegment = (value: string) => {
  const normalized = normalizeGenreKey(value);
  return GENRE_TRANSLATIONS[normalized] || value.trim();
};

export const translateGenre = (value: string): string => {
  if (!value) {
    return value;
  }

  const cleaned = value.trim();
  if (!cleaned) {
    return value;
  }

  const direct = translateGenreSegment(cleaned);
  if (direct !== cleaned) {
    return direct;
  }

  const splitByHierarchy = cleaned.split(/[\/>]/).map((item) => item.trim()).filter(Boolean);
  for (let index = splitByHierarchy.length - 1; index >= 0; index -= 1) {
    const translated = translateGenreSegment(splitByHierarchy[index]);
    if (translated !== splitByHierarchy[index]) {
      return translated;
    }
  }

  return cleaned;
};
