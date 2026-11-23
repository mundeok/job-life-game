// 직업 인생게임 - 성장기 시제품 데이터
// 숫자와 문장은 여기서 고치면 게임에 바로 반영됩니다.

const STATS = [
  { id: 'body', name: '체력·손재주', short: '체력', icon: '💪', type: '현실형' },
  { id: 'inquiry', name: '탐구력', short: '탐구', icon: '🔬', type: '탐구형' },
  { id: 'creative', name: '창의력', short: '창의', icon: '🎨', type: '예술형' },
  { id: 'care', name: '배려심', short: '배려', icon: '🤝', type: '사회형' },
  { id: 'lead', name: '리더십', short: '리더', icon: '📣', type: '진취형' },
  { id: 'detail', name: '꼼꼼함', short: '꼼꼼', icon: '📋', type: '관습형' },
];

const LIFE = [
  { id: 'health', name: '건강', icon: '❤️' },
  { id: 'happy', name: '행복', icon: '😊' },
  { id: 'social', name: '인간관계', icon: '👫' },
  { id: 'money', name: '돈', icon: '💰' },
];

const UNLOCK = { main: 70, sub: 50 }; // 직업 해금 기본 조건

// ---------- 태어난 곳과 가족 ----------
const REGIONS = [
  { id: 'city', name: '도시', icon: '🏙️', desc: '과학관과 박물관이 가까워요.', bonus: { inquiry: 3, creative: 2 } },
  { id: 'farm', name: '농촌', icon: '🌾', desc: '논밭과 텃밭이 가까워요.', bonus: { body: 3, care: 2 } },
  { id: 'sea', name: '어촌·섬', icon: '🌊', desc: '바다와 항구가 가까워요.', bonus: { body: 3, inquiry: 2 } },
  { id: 'mountain', name: '산골·소도시', icon: '⛰️', desc: '숲과 계곡이 가까워요.', bonus: { body: 2, care: 3 } },
];

const FAMILIES = [
  { id: 'sport', name: '운동을 좋아하는 가족', bonus: { body: 4 } },
  { id: 'book', name: '책을 좋아하는 가족', bonus: { inquiry: 4 } },
  { id: 'art', name: '음악과 미술을 좋아하는 가족', bonus: { creative: 4 } },
  { id: 'kind', name: '이웃을 잘 돕는 가족', bonus: { care: 4 } },
  { id: 'talk', name: '이야기 나누기를 좋아하는 가족', bonus: { lead: 4 } },
  { id: 'neat', name: '정리정돈을 잘하는 가족', bonus: { detail: 4 } },
  { id: 'multi', name: '두 나라 문화를 함께 나누는 다문화 가족', bonus: { social: 3, lead: 2 }, rare: true },
  { id: 'grand', name: '할머니, 할아버지와 함께 사는 가족', bonus: { care: 3, detail: 1 }, rare: true },
];

// ---------- 성격 카드 (강점만 있음) ----------
const CARDS = {
  challenge: { name: '도전적인', icon: '🔥', desc: '대회·선발 주사위 +1' },
  careful: { name: '신중한', icon: '🐢', desc: '꼼꼼함이 15% 더 잘 올라요' },
  active: { name: '활발한', icon: '☀️', desc: '리더십·인간관계가 더 잘 올라요' },
  calm: { name: '차분한', icon: '🌙', desc: '탐구력이 15% 더 잘 올라요' },
  curious: { name: '호기심 많은', icon: '🔍', desc: '탐구력·창의력이 10% 더 잘 올라요' },
  warm: { name: '따뜻한', icon: '💗', desc: '배려심이 15% 더 잘 오르고 우정이 잘 쌓여요' },
  brave: { name: '용기 있는', icon: '🦁', desc: '선거·발표 주사위 +1' },
  gritty: { name: '끈기 있는', icon: '🐜', desc: '같은 활동을 이어 하면 효과 +20%' },
  neat: { name: '꼼꼼한', icon: '📏', desc: '꼼꼼함이 15% 더 잘 올라요' },
  imaginative: { name: '상상력 풍부한', icon: '🌈', desc: '창의력이 15% 더 잘 올라요' },
  diligent: { name: '성실한', icon: '⏰', desc: '두 학기마다 에너지 +1' },
  funny: { name: '유머 있는', icon: '😄', desc: '행복이 잘 떨어지지 않아요' },
};

const COMBOS = [
  { a: 'calm', b: 'brave', name: '차분한 발표왕', icon: '✨', desc: '선거·발표 주사위 +2' },
  { a: 'curious', b: 'neat', name: '꼼꼼한 탐험가', icon: '✨', desc: '탐구력이 20% 더 잘 올라요' },
  { a: 'active', b: 'warm', name: '분위기 메이커', icon: '✨', desc: '인간관계가 떨어지지 않아요' },
  { a: 'challenge', b: 'gritty', name: '포기 모르는 도전자', icon: '✨', desc: '주사위에서 지면 한 번 더 굴려요' },
];

// 시작할 때 "나는 이런 아이" 질문 5개
const QUESTIONS = [
  { q: '쉬는 시간에 나는?', a: [
    { t: '밖에서 신나게 뛰어놀아요', c: ['active', 'challenge'] },
    { t: '책을 읽거나 그림을 그려요', c: ['calm', 'imaginative'] },
    { t: '친구 이야기를 들어 줘요', c: ['warm', 'funny'] },
  ] },
  { q: '처음 보는 일을 만나면?', a: [
    { t: '일단 해 봐요', c: ['challenge', 'brave'] },
    { t: '계획부터 세워요', c: ['careful', 'neat'] },
    { t: '왜 그런지 궁금해요', c: ['curious'] },
  ] },
  { q: '모둠 활동에서 나는?', a: [
    { t: '앞장서서 이끌어요', c: ['active'] },
    { t: '자료를 꼼꼼히 정리해요', c: ['neat'] },
    { t: '새로운 아이디어를 내요', c: ['imaginative'] },
    { t: '친구들을 챙겨요', c: ['warm'] },
  ] },
  { q: '어려운 문제를 만나면?', a: [
    { t: '풀릴 때까지 붙잡고 있어요', c: ['gritty'] },
    { t: '다른 방법을 찾아봐요', c: ['curious'] },
    { t: '하루하루 조금씩 해요', c: ['diligent'] },
  ] },
  { q: '친구들은 나를 이렇게 말해요', a: [
    { t: '재미있는 아이', c: ['funny'] },
    { t: '믿음직한 아이', c: ['diligent'] },
    { t: '용감한 아이', c: ['brave'] },
    { t: '차분한 아이', c: ['calm'] },
  ] },
];

// ---------- 직업 21개 ----------
// main/sub: 주 능력치/보조 능력치, road: 꿈 로드맵 5단계
const JOBS = [
  { id: 'athlete', name: '운동선수(축구·야구)', icon: '⚽', type: '현실형', main: 'body', sub: 'lead',
    desc: '경기에서 실력을 겨루고 팀과 함께 승리를 만들어요.', good: '땀 흘린 만큼 실력이 늘어요.', hard: '부상과 짧은 선수 생활',
    road: ['동네 클럽 가입', '유소년팀 선발', '중학교 운동부', '고등학교 운동부·전국대회', '프로 입단 테스트'],
    quiz: { q: '운동선수는 운동만 잘하면 된다.', a: false, exp: '경기 분석, 팀워크, 몸 관리 공부도 꼭 필요해요.' } },
  { id: 'police', name: '경찰관', icon: '🚓', type: '현실형', main: 'body', sub: 'care',
    desc: '시민의 안전을 지키고 범죄를 막고 수사해요.', good: '사람들이 안심하고 살게 도와요.', hard: '위험한 현장과 교대 근무',
    road: ['체력 기르기', '안전 지킴이 활동', '무도·체력 단련', '경찰 관련 학과 알아보기', '경찰공무원 시험'],
    quiz: { q: '경찰관은 어린이 교통안전 교육도 한다.', a: true, exp: '사고를 미리 막는 예방 활동도 경찰관의 중요한 일이에요.' } },
  { id: 'firefighter', name: '소방관', icon: '🚒', type: '현실형', main: 'body', sub: 'care',
    desc: '불을 끄고 위험에 빠진 사람을 구조하고 응급처치를 해요.', good: '생명을 구하는 보람이 커요.', hard: '위험한 현장과 야간 출동',
    road: ['체력 기르기', '안전 체험관 체험', '응급처치 배우기', '소방 관련 학과 알아보기', '소방공무원 시험'],
    quiz: { q: '소방관은 불만 끄는 일을 한다.', a: false, exp: '구조, 응급처치, 화재 예방 교육도 해요.' } },
  { id: 'smartfarm', name: '스마트팜 농업인', icon: '🌱', type: '현실형', main: 'body', sub: 'inquiry',
    desc: '센서와 데이터를 활용해 농작물을 똑똑하게 길러요.', good: '내가 기른 먹거리가 식탁에 올라요.', hard: '날씨와 가격 변화',
    road: ['텃밭 가꾸기', '식물 관찰 일지 쓰기', '농업 체험·코딩 배우기', '농업 계열 학교 알아보기', '스마트팜 창업'],
    quiz: { q: '스마트팜에서는 컴퓨터로 온도와 물을 조절할 수 있다.', a: true, exp: '센서로 온도, 습도, 물을 자동으로 맞춰요.' } },
  { id: 'doctor', name: '의사', icon: '🩺', type: '탐구형', main: 'inquiry', sub: 'care',
    desc: '아픈 사람을 진찰하고 치료해요.', good: '아픈 사람이 낫는 모습을 봐요.', hard: '긴 수련과 밤샘 당직',
    road: ['과학 탐구 습관', '봉사로 사람 돕기', '생명과학 깊이 공부', '의과대학 진학', '의사 국가시험'],
    quiz: { q: '의사가 되려면 의과대학을 졸업하고 국가시험에 합격해야 한다.', a: true, exp: '그 뒤에도 전문 분야를 수련하는 기간이 있어요.' } },
  { id: 'biologist', name: '생명과학자', icon: '🧬', type: '탐구형', main: 'inquiry', sub: 'detail',
    desc: '생명의 비밀을 연구해 질병 치료나 식량 문제를 해결해요.', good: '세상에 없던 사실을 발견해요.', hard: '실험 실패의 반복',
    road: ['관찰 일기 쓰기', '과학 대회 도전', '실험 동아리', '생명과학 학과 진학', '연구소 연구원'],
    quiz: { q: '과학자는 실험에 한 번 실패하면 연구를 그만둔다.', a: false, exp: '실패를 분석하고 다시 도전하는 것이 연구예요.' } },
  { id: 'ai', name: 'AI 개발자', icon: '🤖', type: '탐구형', main: 'inquiry', sub: 'creative',
    desc: '사람을 돕는 인공지능 프로그램을 만들어요.', good: '내가 만든 기술이 많은 사람을 도와요.', hard: '빠른 기술 변화',
    road: ['코딩 시작', '나만의 프로그램 만들기', '정보 올림피아드·동아리', '컴퓨터 관련 학과', 'AI 회사 입사'],
    quiz: { q: 'AI 개발자는 AI가 공정하게 작동하는지도 고민한다.', a: true, exp: 'AI가 누군가를 차별하지 않게 만드는 것도 중요한 일이에요.' } },
  { id: 'gamer', name: '프로게이머', icon: '🎮', type: '탐구형', main: 'inquiry', sub: 'body',
    desc: 'e스포츠 대회에서 전략과 팀워크로 경기를 해요.', good: '많은 팬 앞에서 실력을 보여 줘요.', hard: '짧은 선수 생활과 손목 통증',
    road: ['게임 시간 약속 지키기', '아마추어 대회', '프로팀 연습생 선발', '프로팀 입단', '선수 은퇴 후 두 번째 진로'],
    quiz: { q: '프로게이머는 게임만 하고 다른 훈련은 하지 않는다.', a: false, exp: '체력 훈련, 팀 소통, 경기 분석도 해요.' } },
  { id: 'creator', name: '크리에이터', icon: '🎬', type: '예술형', main: 'creative', sub: 'lead',
    desc: '영상이나 콘텐츠를 기획하고 만들어 사람들과 나눠요.', good: '내 아이디어가 많은 사람에게 닿아요.', hard: '불안정한 수입과 속상한 댓글',
    road: ['기록하고 찍어 보기', '짧은 영상 만들기', '방송 동아리', '영상 관련 학과·독학', '나만의 채널 운영'],
    quiz: { q: '크리에이터는 다른 사람의 음악이나 영상을 마음대로 써도 된다.', a: false, exp: '저작권을 지켜야 해요.' } },
  { id: 'webtoon', name: '웹툰 작가', icon: '✏️', type: '예술형', main: 'creative', sub: 'detail',
    desc: '이야기와 그림으로 웹툰을 만들어요.', good: '내가 만든 이야기를 독자가 기다려요.', hard: '마감과 오래 앉아 있는 생활',
    road: ['그림 그리기 습관', '네 컷 만화 그리기', '공모전 도전', '만화 관련 학과', '웹툰 연재'],
    quiz: { q: '웹툰 작가는 그림만 그리고 이야기는 꼭 다른 사람이 만든다.', a: false, exp: '이야기와 그림을 함께 만드는 작가가 많아요.' } },
  { id: 'chef', name: '요리사', icon: '👩‍🍳', type: '예술형', main: 'creative', sub: 'body',
    desc: '맛있고 건강한 음식을 만들어 사람들에게 대접해요.', good: '손님이 맛있게 먹는 모습을 봐요.', hard: '오래 서서 일하고 명절에도 일함',
    road: ['요리 돕기', '나만의 레시피', '조리 체험·대회', '조리 학과·자격증', '식당 요리사'],
    quiz: { q: '요리사는 위생과 안전을 꼼꼼히 지켜야 한다.', a: true, exp: '음식은 사람의 건강과 바로 이어지기 때문이에요.' } },
  { id: 'teacher', name: '교사', icon: '🧑‍🏫', type: '사회형', main: 'care', sub: 'inquiry',
    desc: '학생들이 배우고 성장하도록 가르치고 도와요.', good: '학생이 성장하는 모습을 봐요.', hard: '많은 업무와 다양한 학생 지도',
    road: ['친구에게 설명해 주기', '동생 공부 돕기', '멘토링 봉사', '교육대학교·사범대학 진학', '임용시험'],
    quiz: { q: '초등학교 교사가 되려면 교육대학교 등에서 공부한다.', a: true, exp: '졸업 뒤 임용시험을 거쳐 선생님이 돼요.' } },
  { id: 'nurse', name: '간호사', icon: '💉', type: '사회형', main: 'care', sub: 'detail',
    desc: '환자를 돌보고 의사와 함께 치료를 도와요.', good: '환자 곁에서 회복을 함께해요.', hard: '교대 근무와 체력 소모',
    road: ['아픈 가족 돌보기', '응급처치 배우기', '병원 봉사', '간호학과 진학', '간호사 국가시험'],
    quiz: { q: '간호사는 환자를 돌보고 의사와 함께 치료를 돕는다.', a: true, exp: '환자의 상태를 꼼꼼히 살피는 것도 중요한 일이에요.' } },
  { id: 'socialworker', name: '사회복지사', icon: '🤲', type: '사회형', main: 'care', sub: 'lead',
    desc: '도움이 필요한 사람과 복지 제도를 연결해 줘요.', good: '어려운 이웃의 삶이 나아져요.', hard: '많은 사례와 마음의 지침',
    road: ['이웃 돕기', '봉사 동아리', '지역 복지관 봉사', '사회복지학과 진학', '사회복지사 자격'],
    quiz: { q: '사회복지사는 도움이 필요한 사람과 복지 제도를 연결해 준다.', a: true, exp: '어르신, 아동, 장애인 등 여러 사람을 도와요.' } },
  { id: 'ceo', name: '창업가(CEO)', icon: '🚀', type: '진취형', main: 'lead', sub: 'creative',
    desc: '새로운 아이디어로 회사를 만들고 이끌어요.', good: '내 아이디어가 세상을 바꿔요.', hard: '실패 위험과 무거운 책임',
    road: ['아이디어 노트', '알뜰시장 장사 체험', '창업 동아리', '경영·기술 공부', '회사 창업'],
    quiz: { q: '창업가는 처음부터 반드시 성공한다.', a: false, exp: '여러 번 실패하고 고치면서 성공하는 경우가 많아요.' } },
  { id: 'lawyer', name: '변호사', icon: '⚖️', type: '진취형', main: 'lead', sub: 'inquiry',
    desc: '법을 바탕으로 사람들의 권리를 지켜 줘요.', good: '억울한 사람을 도울 수 있어요.', hard: '긴 준비 기간과 긴 근무 시간',
    road: ['토론하기', '독서와 글쓰기', '모의재판 활동', '법학전문대학원 진학', '변호사시험'],
    quiz: { q: '변호사는 법을 바탕으로 사람들의 권리를 지켜 준다.', a: true, exp: '재판뿐 아니라 법률 상담도 해요.' } },
  { id: 'travel', name: '공정여행 기획자', icon: '🧭', type: '진취형', main: 'lead', sub: 'care',
    desc: '여행지 주민과 자연을 존중하는 여행을 기획해요.', good: '여행으로 지역과 사람을 이어요.', hard: '계절에 따라 일이 달라지고 출장이 많음',
    road: ['우리 동네 탐방', '여행 계획 세우기', '외국어·문화 공부', '관광 관련 학과', '여행 회사 기획자'],
    quiz: { q: '공정여행은 여행지 주민과 자연을 존중하는 여행이다.', a: true, exp: '지역 가게를 이용하고 자연을 지키는 여행이에요.' } },
  { id: 'politician', name: '정치인', icon: '🏛️', type: '진취형', main: 'lead', sub: 'care',
    desc: '주민의 의견을 듣고 법과 정책을 만들어요. 최종 단계는 대통령이에요.', good: '더 좋은 사회를 만드는 데 힘을 보태요.', hard: '비판과 바쁜 일정, 낙선',
    road: ['학급 임원', '전교 학생회', '다른 직업으로 경력 쌓기', '지역 의원 선거', '국회의원·대통령'],
    quiz: { q: '정치인은 주민의 의견을 듣고 법과 정책을 만든다.', a: true, exp: '서로 다른 의견을 듣고 조정하는 일이 중요해요.' } },
  { id: 'civil', name: '공무원', icon: '🗂️', type: '관습형', main: 'detail', sub: 'care',
    desc: '나라와 지역을 위해 행정 일을 해요.', good: '많은 사람의 생활을 편하게 해요.', hard: '반복 업무와 민원',
    road: ['계획표 지키기', '학급 도우미', '지역 행사 봉사', '공무원 시험 공부', '공무원 임용'],
    quiz: { q: '공무원은 나라와 지역을 위해 일한다.', a: true, exp: '주민센터, 시청, 정부 부처 등 여러 곳에서 일해요.' } },
  { id: 'librarian', name: '사서', icon: '📚', type: '관습형', main: 'detail', sub: 'inquiry',
    desc: '도서관 자료를 관리하고 독서 프로그램을 만들어요.', good: '사람들이 좋은 책을 만나게 도와요.', hard: '행사와 정리로 많은 일, 디지털 변화',
    road: ['독서 기록장', '도서부 활동', '도서관 봉사', '문헌정보학과 진학', '사서 자격'],
    quiz: { q: '사서는 책을 빌려주는 일만 한다.', a: false, exp: '자료 정리, 독서 프로그램 기획, 정보 찾기를 도와요.' } },
  { id: 'drone', name: '드론 조종사·물류 관리자', icon: '🚁', type: '관습형', main: 'detail', sub: 'body',
    desc: '드론으로 촬영하거나 물건을 안전하게 배송하고 관리해요.', good: '새로운 기술로 사람들에게 물건을 전해요.', hard: '날씨와 규정 변화',
    road: ['조립·만들기', '드론 체험', '드론 동아리', '드론 자격증', '드론·물류 회사'],
    quiz: { q: '드론은 아무 곳에서나 자유롭게 날려도 된다.', a: false, exp: '비행 금지 구역과 안전 규칙을 지켜야 해요.' } },
];

// 숨은 직업: 처음엔 도감에서 ???로 보여요
const HIDDEN_JOBS = [
  { id: 'sportsdoc', name: '스포츠의학 의사', icon: '🏥', desc: '운동선수의 부상을 치료하고 재활을 도와요.' },
  { id: 'sportsdata', name: '스포츠 데이터 분석가', icon: '📊', desc: '경기 기록을 분석해 전략을 세워요.' },
  { id: 'aqua', name: '수산양식 기술자', icon: '🐟', desc: '바다 생물을 건강하게 기르는 기술을 연구해요.' },
  { id: 'forest', name: '산림치유사', icon: '🌲', desc: '숲을 활용해 사람들의 몸과 마음을 건강하게 해요.' },
  { id: 'foodstylist', name: '푸드스타일리스트', icon: '🍱', desc: '음식을 보기 좋고 맛있어 보이게 꾸며요.' },
  { id: 'translator', name: '통역사', icon: '🌏', desc: '다른 언어를 쓰는 사람들의 말을 이어 줘요.' },
  { id: 'vet', name: '수의사', icon: '🐾', desc: '동물의 병을 치료하고 건강을 지켜요.' },
  { id: 'gameplanner', name: '게임 기획자', icon: '🕹️', desc: '게임의 규칙과 재미를 설계해요.' },
];

// 꿈과 행동이 다를 때 "둘 다 하는 길"로 이어지는 숨은 직업
const BRIDGE_JOBS = {
  'athlete+inquiry': 'sportsdoc', 'athlete+detail': 'sportsdata', 'chef+detail': 'foodstylist',
  'gamer+creative': 'gameplanner', 'doctor+body': 'sportsdoc', 'chef+creative': 'foodstylist',
};

// ---------- 활동 ----------
// st: 능력치 변화, life: 삶의 지표 변화, rest: 쉬는 활동(행복 감소를 막음)
// bore: 연달아 하면 질리는 활동, story: 인생 피드에 쌓이는 문장 (하나를 무작위로 고름)
const ACTIVITIES = [
  { id: 'sport', name: '축구·야구 하기', icon: '⚽', st: { body: 4 }, life: { health: 2, happy: 2, social: 1 }, rest: true,
    story: ['운동장에서 친구들과 공을 찼다.', '점심시간마다 야구공을 던지며 놀았다.', '경기에서 골을 넣고 하이파이브를 했다.'] },
  { id: 'run', name: '달리기·줄넘기', icon: '🏃', st: { body: 3 }, life: { health: 3 },
    story: ['아침마다 동네를 한 바퀴씩 달렸다.', '줄넘기 2단 뛰기에 성공했다.'] },
  { id: 'make', name: '만들기·조립', icon: '🔧', st: { body: 3, creative: 1 }, life: { happy: 1 },
    story: ['상자로 로봇을 만들었다.', '조립 블록으로 다리를 세웠다.'] },
  { id: 'garden', name: '텃밭 가꾸기', icon: '🌱', st: { body: 2, inquiry: 1, care: 1 }, life: { health: 1 },
    story: ['방울토마토가 빨갛게 익었다.', '상추 씨앗이 싹을 틔웠다.'] },
  { id: 'science', name: '과학 실험', icon: '🔬', st: { inquiry: 4 }, life: { happy: 1 },
    story: ['식초와 베이킹소다로 화산을 터뜨렸다.', '현미경으로 양파 세포를 관찰했다.', '자석이 왜 붙는지 실험해 봤다.'] },
  { id: 'read', name: '독서', icon: '📖', st: { inquiry: 3, creative: 1 }, life: {},
    story: ['도서관에서 책을 세 권 빌려 다 읽었다.', '위인전을 읽고 독서 기록장을 썼다.'] },
  { id: 'coding', name: '코딩', icon: '💻', minAge: 9, st: { inquiry: 3, creative: 2 }, life: {},
    story: ['블록 코딩으로 미로 게임을 만들었다.', '처음으로 프로그램이 오류 없이 돌아갔다.'] },
  { id: 'draw', name: '그림 그리기', icon: '🎨', st: { creative: 4 }, life: { happy: 1 },
    story: ['스케치북 한 권을 그림으로 가득 채웠다.', '창밖 풍경을 수채화로 그렸다.'] },
  { id: 'music', name: '악기 연주', icon: '🎹', st: { creative: 3, detail: 1 }, life: { happy: 1 },
    story: ['피아노로 좋아하는 노래를 끝까지 쳤다.', '리코더 합주에서 내 파트를 맡았다.'] },
  { id: 'cook', name: '요리 돕기', icon: '🍳', minAge: 9, st: { creative: 2, body: 1, care: 1 }, life: { happy: 1 },
    story: ['가족에게 계란말이를 만들어 줬다.', '김밥 재료를 썰고 돌돌 말았다.'] },
  { id: 'video', name: '영상 만들기', icon: '🎬', minAge: 11, st: { creative: 3, lead: 1 }, life: { happy: 1 },
    story: ['학교생활 브이로그를 찍어 편집했다.', '친구들과 짧은 영화를 찍었다.'] },
  { id: 'volunteer', name: '봉사활동', icon: '🤲', minAge: 9, st: { care: 4 }, life: { social: 1 },
    story: ['동네 공원 쓰레기를 주웠다.', '복지관 어르신께 말벗이 되어 드렸다.'] },
  { id: 'help', name: '친구·동생 돕기', icon: '💗', st: { care: 3 }, life: { social: 2 },
    story: ['수학을 어려워하는 친구에게 풀이를 알려 줬다.', '동생 숙제를 봐 줬다.'] },
  { id: 'speech', name: '발표 연습', icon: '🎤', st: { lead: 4 }, life: { happy: -1 },
    story: ['거울 앞에서 발표를 연습했다.', '수업 시간에 손을 들고 발표했다.'] },
  { id: 'council', name: '학급 임원 활동', icon: '📣', minAge: 10, st: { lead: 3, care: 1 }, life: { social: 1 },
    story: ['학급 회의를 진행했다.', '반 친구들의 의견을 모아 선생님께 전했다.'] },
  { id: 'diary', name: '일기 쓰기', icon: '📝', st: { detail: 3, creative: 1 }, life: {},
    story: ['하루도 빠짐없이 일기를 썼다.', '일기장에 꿈에 대한 생각을 적었다.'] },
  { id: 'budget', name: '용돈기입장 쓰기', icon: '💰', st: { detail: 3 }, life: {}, budget: true,
    story: ['용돈기입장을 쓰며 군것질을 줄였다.', '용돈기입장으로 한 달 지출을 정리했다.'] },
  { id: 'tidy', name: '정리정돈', icon: '🧹', st: { detail: 3 }, life: { happy: 1 },
    story: ['책상 서랍을 깔끔하게 정리했다.', '방 청소를 하다가 잃어버린 물건을 찾았다.'] },
  { id: 'study', name: '학원·문제집 공부', icon: '✏️', st: { inquiry: 2, detail: 2 }, life: { happy: -3 },
    story: ['문제집 한 권을 끝까지 풀었다.', '학원에서 늦게까지 공부했다.'] },
  { id: 'game', name: '게임하기', icon: '🎮', st: { inquiry: 1, body: 1 }, life: { happy: 4, health: -2 }, rest: true, bore: true,
    story: ['좋아하는 게임에서 새 단계를 깼다.', '친구들과 게임 대결을 했다.'] },
  { id: 'play', name: '친구와 놀기', icon: '🛝', st: {}, life: { social: 3, happy: 3 }, rest: true, bore: true, friend: true,
    story: ['{friend}와 해가 질 때까지 놀았다.', '{friend}와 분식집에서 떡볶이를 먹었다.', '{friend}와 자전거를 타고 동네를 돌았다.'] },
  { id: 'rest', name: '푹 쉬기', icon: '😴', st: {}, life: { health: 5, happy: 3 }, rest: true, bore: true,
    story: ['주말 내내 푹 쉬었다.', '늦잠을 자고 나니 몸이 가벼워졌다.'] },
  { id: 'walkpet', name: '반려동물 산책', icon: '🐕', needPet: true, st: { body: 1, care: 2 }, life: { happy: 3, health: 2 }, rest: true,
    story: ['{pet}와(과) 강가를 산책했다.', '{pet}에게 새 장난감을 사 줬다.'] },
];

// ---------- 한정 카드 (계절·학년·지역·희귀) ----------
// when(s, age, sem): 손패에 들어올 수 있는 조건, p: 들어올 확률(1이면 꼭), tag: 카드 위 표시
const LIMITED = [
  { id: 'newClass', name: '새 학년 친구 사귀기', icon: '🌸', tag: '새 학기', p: 0.6, when: (s, a, m) => m === 1,
    st: { lead: 1 }, life: { social: 5, happy: 2 }, story: ['새 반에서 처음 보는 친구에게 먼저 인사했다.'] },
  { id: 'scienceMonth', name: '과학의 달 행사', icon: '🚀', tag: '4월', p: 0.4, when: (s, a, m) => m === 1,
    st: { inquiry: 4, creative: 1 }, life: { happy: 1 }, story: ['과학의 달 행사에서 물로켓을 쏘아 올렸다.'] },
  { id: 'sportsDay', name: '운동회', icon: '🏁', tag: '가을', p: 0.7, when: (s, a, m) => m === 2 && a <= 13,
    st: { body: 4 }, life: { social: 2, happy: 3 }, story: ['운동회 계주에서 바통을 이어받아 힘껏 달렸다.'] },
  { id: 'festival', name: '학교 축제 무대', icon: '🎭', tag: '축제', p: 0.6, when: (s, a, m) => m === 2 && a >= 11,
    st: { creative: 3, lead: 3 }, life: { happy: 2 }, story: ['학교 축제 무대에서 친구들과 공연을 했다.'] },
  { id: 'schoolTrip', name: '수학여행', icon: '🚌', tag: '수학여행', p: 1, when: (s, a, m) => m === 1 && (a === 13 || a === 16 || a === 18),
    st: { inquiry: 2 }, life: { social: 4, happy: 6 }, story: ['수학여행에서 친구들과 밤새 이야기를 나눴다.'] },
  { id: 'jobTour', name: '직업 체험 학습', icon: '🏢', tag: '자유학기제', p: 1, n: 2, when: (s, a) => a === 14,
    special: 'jobTour', story: ['자유학기제 직업 체험으로 {job} 일터에 다녀왔다.'] },
  { id: 'counselRoom', name: '진로 상담실 방문', icon: '🧭', tag: '고3', p: 1, when: (s, a) => a === 19,
    special: 'dreamBoost', st: { detail: 2 }, story: ['진로 선생님과 꿈을 이루는 방법을 상담했다.'] },
  { id: 'mockInterview', name: '모의 면접', icon: '👔', tag: '고3', p: 0.7, when: (s, a) => a >= 18,
    st: { lead: 3, detail: 2 }, life: { happy: -1 }, story: ['모의 면접에서 떨리지만 끝까지 대답했다.'] },
  { id: 'summerCamp', name: '여름 캠프', icon: '⛺', tag: '여름방학', p: 0.4, when: (s, a, m) => m === 1,
    special: 'topStat5', life: { happy: 3 }, story: ['여름 캠프에서 좋아하는 분야를 실컷 배웠다.'] },
  { id: 'winterVolunteer', name: '겨울 연탄 봉사', icon: '🧤', tag: '겨울방학', p: 0.4, when: (s, a, m) => m === 2 && a >= 12,
    st: { care: 5, body: 1 }, story: ['추운 날 이웃집에 연탄을 날랐다.'] },
  { id: 'seaExplore', name: '갯벌 탐사', icon: '🦀', tag: '어촌', p: 0.35, when: s => s.region === 'sea',
    st: { inquiry: 3, body: 2 }, story: ['갯벌에서 게와 조개를 관찰했다.'] },
  { id: 'forestWalk', name: '숲길 탐험', icon: '🌲', tag: '산골', p: 0.35, when: s => s.region === 'mountain',
    st: { care: 2, body: 2 }, life: { health: 3 }, story: ['숲길을 걸으며 나무 이름을 외웠다.'] },
  { id: 'farmHelp', name: '모내기 돕기', icon: '🌾', tag: '농촌', p: 0.35, when: s => s.region === 'farm',
    st: { body: 3, care: 2 }, story: ['마을 어른들과 함께 모내기를 했다.'] },
  { id: 'museumTrip', name: '박물관 견학', icon: '🏛️', tag: '도시', p: 0.35, when: s => s.region === 'city',
    st: { inquiry: 3, creative: 2 }, story: ['박물관에서 옛날 사람들의 물건을 구경했다.'] },
  { id: 'talkShow', name: '유명인 강연 듣기', icon: '🎙️', tag: '희귀', rare: true, p: 0.08, when: (s, a) => a >= 11,
    st: { lead: 3, inquiry: 3 }, life: { happy: 2 }, story: ['유명한 과학자의 강연을 듣고 질문까지 했다.'] },
  { id: 'regionContest', name: '지역 대회 출전', icon: '🥇', tag: '희귀', rare: true, p: 0.08, when: s => !!s.dream,
    special: 'dreamBig', life: { happy: 3 }, story: ['꿈과 관련된 지역 대회에 나가 값진 경험을 했다.'] },
  { id: 'mentorDay', name: '현직자 멘토링', icon: '🤝', tag: '희귀', rare: true, p: 0.07, when: (s, a) => !!s.dream && a >= 12,
    special: 'dreamBoost', life: { happy: 2 }, story: ['{dream}으로 일하는 분께 직접 이야기를 들었다.'] },
];

// ---------- 행운 카드 (일반 80%, 희귀 18%, 전설 2%) ----------
const LUCK = {
  common: [
    { name: '용돈이 생겼어요', icon: '🪙', life: { money: 10 } },
    { name: '좋은 책을 선물 받았어요', icon: '📕', st: { inquiry: 3 } },
    { name: '맛있는 저녁을 먹었어요', icon: '🍲', life: { happy: 5 } },
    { name: '새 운동화가 생겼어요', icon: '👟', st: { body: 3 } },
    { name: '칭찬 스티커를 받았어요', icon: '⭐', st: { detail: 1 }, life: { happy: 3 } },
    { name: '친구에게 편지를 받았어요', icon: '💌', life: { social: 4 } },
    { name: '그림 도구를 선물 받았어요', icon: '🖍️', st: { creative: 3 } },
    { name: '할머니가 응원해 주셨어요', icon: '👵', st: { care: 2 }, life: { happy: 2 } },
  ],
  rare: [
    { name: '영재캠프 초대장', icon: '🎟️', st: { inquiry: 6 } },
    { name: '해외 펜팔 친구', icon: '✉️', st: { lead: 2 }, life: { social: 5 } },
    { name: '직업 체험 특별 초대', icon: '🎫', special: 'jobInvite' },
    { name: '에너지 충전', icon: '🔋', special: 'energy' },
    { name: '멋진 코치님을 만났어요', icon: '🧢', st: { body: 6 } },
  ],
  legend: [
    { name: '꿈의 멘토를 만났어요', icon: '🌟', special: 'mentor' },
    { name: '재능이 깨어났어요', icon: '💎', special: 'awaken' },
    { name: '세계 대회에 초청받았어요', icon: '🏆', special: 'world' },
  ],
};

// ---------- 친구 ----------
const FRIEND_NAMES = ['민준', '서연', '지호', '하윤', '도윤', '지우', '시우', '서아', '예준', '하은', '주원', '수아', '은우', '지안', '건우', '유나'];

// ---------- 칭호 도감 (기획서 11-7, 47개) ----------
// proto: 성장기 시제품에서 얻을 수 있는 칭호
const TITLES = [
  { id: 'dreamDone', name: '꿈을 이룬 사람', g: '일반', hint: '11살에 고른 꿈 직업을 가짐' },
  { id: 'childPromise', name: '어릴 적 약속', g: '희귀', hint: '어릴 적 꿈과 최종 직업이 같음' },
  { id: 'dreamChange', name: '꿈은 바뀌어도', g: '일반', hint: '꿈을 3번 이상 바꿈', proto: true },
  { id: 'newPath', name: '새로운 길의 발견자', g: '일반', hint: '대안 직업으로 가서 만족도가 높음' },
  { id: 'challenger', name: '평생 도전자', g: '희귀', hint: '직업을 3번 바꿈' },
  { id: 'lateBloom', name: '늦게 핀 꽃', g: '희귀', hint: '50살 이후에 꿈을 이룸' },
  { id: 'hiddenPath', name: '숨은 길 탐험가', g: '희귀', hint: '숨은 직업을 가짐' },
  { id: 'master', name: '한 우물 장인', g: '일반', hint: '한 직업을 30년 이상 함' },
  { id: 'top', name: '최고의 자리', g: '희귀', hint: '직업에서 최고 단계까지 승진' },
  { id: 'future', name: '미래를 준비한 사람', g: '일반', hint: '시대 변화 이벤트에서 모두 배우기를 선택' },
  { id: 'senior', name: '좋은 선배', g: '일반', hint: '후배를 5번 이상 가르침' },
  { id: 'national', name: '국가대표', g: '희귀', hint: '올림픽이나 아시안게임에 출전' },
  { id: 'gold', name: '금빛 영광', g: '전설', hint: '올림픽 금메달' },
  { id: 'president', name: '나라의 일꾼', g: '전설', hint: '대통령이 됨' },
  { id: 'hexagon', name: '육각형 인재', g: '희귀', hint: '능력치 6개 모두 60 이상', proto: true },
  { id: 'expert', name: '한 분야의 달인', g: '일반', hint: '능력치 하나가 100', proto: true },
  { id: 'steady', name: '꾸준함의 힘', g: '일반', hint: '같은 활동을 10학기 연속 함', proto: true },
  { id: 'comeback', name: '실패는 성공의 어머니', g: '일반', hint: '떨어진 뒤 다시 도전해 성공', proto: true },
  { id: 'grow', name: '성격도 자란다', g: '일반', hint: '살면서 성격 카드를 2장 이상 더 얻음', proto: true },
  { id: 'genius', name: '빛나는 재능', g: '전설', hint: '천재로 태어남', proto: true },
  { id: 'hardGenius', name: '노력하는 천재', g: '전설', hint: '천재로 태어나 재능을 끝까지 키움', proto: true },
  { id: 'loyal', name: '의리의 친구', g: '일반', hint: '친구 1명과 우정을 끝까지 지킴', proto: true },
  { id: 'insider', name: '인싸 중의 인싸', g: '희귀', hint: '친구 모두와 우정 점수가 높음', proto: true },
  { id: 'reunion', name: '다시 만난 인연', g: '일반', hint: '전학 간 친구와 다시 만남', proto: true },
  { id: 'peace', name: '화해의 달인', g: '일반', hint: '다툼 이벤트에서 모두 화해함', proto: true },
  { id: 'teacherRespect', name: '존경받는 스승', g: '희귀', hint: '제자가 마지막에 말을 남김' },
  { id: 'smile', name: '웃음 부자', g: '일반', hint: '행복 지표가 계속 높음', proto: true },
  { id: 'strong', name: '튼튼한 몸', g: '일반', hint: '건강 지표가 계속 높음', proto: true },
  { id: 'saver', name: '알뜰살뜰', g: '일반', hint: '19살까지 100만 원 넘게 모음', proto: true },
  { id: 'goalGetter', name: '목표 달성', g: '일반', hint: '저축 목표를 세우고 모아서 삼', proto: true },
  { id: 'giver', name: '나눔의 손', g: '일반', hint: '기부를 3번 이상 함', proto: true },
  { id: 'balance', name: '균형의 달인', g: '전설', hint: '삶의 지표 4개가 모두 높음' },
  { id: 'lamp', name: '마을의 등불', g: '일반', hint: '봉사를 많이 함' },
  { id: 'student', name: '평생 학생', g: '일반', hint: '은퇴 후에도 배움을 계속함' },
  { id: 'donor', name: '재능 나눔꾼', g: '일반', hint: '은퇴 후 재능기부를 함' },
  { id: 'secondSpring', name: '두 번째 봄', g: '희귀', hint: '은퇴 후 제2의 직업을 가짐' },
  { id: 'hundred', name: '100세 인생', g: '전설', hint: '100살까지 삶' },
  { id: 'warmHome', name: '따뜻한 우리 집', g: '일반', hint: '가족과 행복 지표가 높음' },
  { id: 'together', name: '함께 키운 아이', g: '일반', hint: '육아와 집안일을 나눔' },
  { id: 'myWay', name: '나만의 길', g: '일반', hint: '혼자서도 행복 지표가 높은 삶' },
  { id: 'filial', name: '효도왕', g: '일반', hint: '부모님 이벤트에서 늘 함께함' },
  { id: 'rebloom', name: '다시 피어난 꽃', g: '희귀', hint: '일을 쉬다가 다시 일하기에 성공' },
  { id: 'family', name: '가업 잇기', g: '희귀', hint: '자녀가 내 직업을 이어받음' },
  { id: 'bridge', name: '두 나라의 다리', g: '희귀', hint: '다문화 가족 출신으로 통역·외교 직업을 가짐' },
  { id: 'petLover', name: '멍냥 집사', g: '일반', hint: '반려동물을 입양해 함께함', proto: true },
  { id: 'quizKing', name: '직업 박사', g: '일반', hint: '직업 퀴즈를 10개 이상 맞힘 (여러 판 합산)', proto: true },
  { id: 'hometown', name: '고향으로', g: '일반', hint: '은퇴 후 태어난 곳으로 돌아감' },
  { id: 'lucky', name: '행운아', g: '희귀', hint: '행운 카드에서 전설을 뽑음', proto: true },
  { id: 'capsule', name: '타임캡슐의 약속', g: '희귀', hint: '10살에 쓴 편지 속 꿈을 이룸' },
];

// ---------- 돈 (기획서 12장) ----------
// 금액은 게임용 대략값이에요. 실제 통계를 확인해 고쳐 쓰세요.
// 용돈: 나이별 한 달 용돈(원). 한 학기 = 6개월
const ALLOWANCE = [
  { maxAge: 10, monthly: 15000 },
  { maxAge: 13, monthly: 30000 },
  { maxAge: 16, monthly: 50000 },
  { maxAge: 19, monthly: 70000 },
];
const SPEND_RATE = 0.7;        // 용돈 중 간식·준비물 등으로 저절로 쓰는 비율
const SPEND_RATE_BUDGET = 0.5; // 용돈기입장을 쓴 학기의 비율
const BANK_RATE = 0.02;        // 어린이 통장 1년 이자율 (2학기마다 붙어요)
const LIFE_MONEY_WON = 2000;   // 이벤트의 돈 +1 = 2,000원

// 사고 싶은 물건 (나이에 맞는 것만 나와요)
const WANT_ITEMS = [
  { name: '만화책 세트', icon: '📚', price: 30000, minAge: 8, maxAge: 13 },
  { name: '캐릭터 필통', icon: '✏️', price: 15000, minAge: 8, maxAge: 11 },
  { name: '조립 블록 세트', icon: '🧱', price: 60000, minAge: 8, maxAge: 12 },
  { name: '새 운동화', icon: '👟', price: 80000, minAge: 9, maxAge: 19 },
  { name: '자전거', icon: '🚲', price: 200000, minAge: 9, maxAge: 15 },
  { name: '게임기', icon: '🎮', price: 350000, minAge: 10, maxAge: 19 },
  { name: '블루투스 이어폰', icon: '🎧', price: 120000, minAge: 13, maxAge: 19 },
  { name: '좋아하는 가수 콘서트 표', icon: '🎤', price: 110000, minAge: 14, maxAge: 19 },
  { name: '태블릿', icon: '📱', price: 500000, minAge: 13, maxAge: 19 },
];
