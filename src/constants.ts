import { SiteConfig, Product, Post, TrendItem } from './types';

export const defaultConfig: SiteConfig = {
  name: 'OTAMONO',
  banners: [
    {
      id: '1',
      title: '현대적인 디자인의 새로운 기준',
      subtitle: '쇼핑몰과 커뮤니티가 결합된 하이브리드 플랫폼, Animation에서 당신의 감각을 깨우세요.',
      imageUrl: 'https://picsum.photos/seed/banner1/1920/1080',
    },
    {
      id: '2',
      title: '프리미엄 로고 제작 패키지',
      subtitle: '브랜드의 가치를 높여주는 고품격 로고 디자인 서비스를 만나보세요.',
      imageUrl: 'https://picsum.photos/seed/banner2/1920/1080',
    },
    {
      id: '3',
      title: '크리에이티브 커뮤니티',
      subtitle: '다양한 창작자들과 소통하며 새로운 영감을 얻으세요.',
      imageUrl: 'https://picsum.photos/seed/banner3/1920/1080',
    }
  ],
  primaryColor: '#FFFFFF',
  accentColor: '#000000',
  backgroundColor: '#FFFFFF',
  fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  logoUrl: 'https://picsum.photos/seed/animation-logo/200/50',
  productCategories: ['의상', '가발', '소품', '신발', '피규어', '문구', '인형', '코스프레', '기타'],
  communityTabs: ['HOT', '랭킹', '코스프레', '트렌드', '카테고리'],
  footerDescription: '현대적인 디자인과 커뮤니티가 만나는 곳. OTAMONO은 당신의 창의성을 현실로 바꿉니다.',
};

export const defaultProducts: Product[] = [
  {
    id: '1',
    name: '한정판 프리미엄 피규어',
    price: 185000,
    description: '디테일이 살아있는 한정판 컬렉션 피규어입니다.',
    imageUrl: 'https://picsum.photos/seed/fig1/800/800',
    category: '피규어',
    discountRate: 15,
  },
  {
    id: '2',
    name: '캐릭터 다이어리 세트',
    price: 28000,
    description: '매일매일이 즐거워지는 귀여운 캐릭터 다이어리 패키지입니다.',
    imageUrl: 'https://picsum.photos/seed/stat1/800/800',
    category: '문구',
    discountRate: 10,
  },
  {
    id: '3',
    name: '대형 곰인형 쿠션',
    price: 55000,
    description: '폭신폭신한 촉감의 대형 캐릭터 인형입니다.',
    imageUrl: 'https://picsum.photos/seed/doll1/800/800',
    category: '인형',
  }
];

export const defaultPosts: Post[] = [
  {
    id: '1',
    title: '새로운 피규어 시리즈 출시 안내',
    content: '이번 시즌 새롭게 선보이는 프리미엄 피규어 시리즈를 만나보세요.',
    author: '관리자',
    createdAt: '2024-01-20',
    type: 'notice',
    category: 'Notice',
    likes: 0,
    isPinned: true,
  },
  {
    id: '2',
    title: '커뮤니티 이용 규칙 안내',
    content: '모두가 즐거운 커뮤니티를 위해 다음의 규칙을 준수해 주세요.',
    author: '관리자',
    createdAt: '2024-01-15',
    type: 'notice',
    category: 'Notice',
    likes: 0,
  }
];

export const defaultTrendItems: TrendItem[] = [
  { id: '1', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-34332-large.mp4', title: '네온 시티 코스프레', thumbnail: 'https://picsum.photos/seed/trend1/400/600', likes: 0 },
  { id: '2', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mysterious-woman-in-a-dark-forest-4332-large.mp4', title: '숲속의 요정', thumbnail: 'https://picsum.photos/seed/trend2/400/600', likes: 0 },
  { id: '3', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-blue-hair-in-a-futuristic-setting-34335-large.mp4', title: '사이버펑크 2077', thumbnail: 'https://picsum.photos/seed/trend3/400/600', likes: 0 },
];

export const defaultReviews = [
  { id: '1', imageUrl: 'https://picsum.photos/seed/rev1/400/400', rating: 5, title: '최고의 퀄리티!', content: '정말 디테일이 살아있네요. 대만족입니다.', author: '김철수' },
  { id: '2', imageUrl: 'https://picsum.photos/seed/rev2/400/400', rating: 4, title: '배송이 빨라요', content: '포장도 꼼꼼하고 배송도 빨라서 좋았습니다.', author: '이영희' },
  { id: '3', imageUrl: 'https://picsum.photos/seed/rev3/400/400', rating: 5, title: '선물용으로 딱이에요', content: '친구 생일 선물로 샀는데 너무 좋아하네요.', author: '박지민' },
  { id: '4', imageUrl: 'https://picsum.photos/seed/rev4/400/400', rating: 5, title: '인생 피규어', content: '이 가격에 이 퀄리티라니 믿기지 않습니다.', author: '최민수' },
  { id: '5', imageUrl: 'https://picsum.photos/seed/rev5/400/400', rating: 4, title: '귀여워요', content: '생각보다 더 귀엽고 인테리어 소품으로도 좋네요.', author: '정다은' },
  { id: '6', imageUrl: 'https://picsum.photos/seed/rev6/400/400', rating: 5, title: '강력 추천', content: '고민하지 마세요. 정말 예쁩니다.', author: '강하늘' },
  { id: '7', imageUrl: 'https://picsum.photos/seed/rev7/400/400', rating: 5, title: '너무 예뻐요', content: '실물이 훨씬 예쁩니다. 다른 시리즈도 모으고 싶어지네요.', author: '유재석' },
  { id: '8', imageUrl: 'https://picsum.photos/seed/rev8/400/400', rating: 4, title: '깔끔해요', content: '마감이 아주 깔끔하고 디자인이 세련됐습니다.', author: '송은이' },
];
