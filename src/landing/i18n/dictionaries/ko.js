// 한국어. 환영 문구는 한글 점자로 표시합니다(초성·모음·받침이 각각 한 칸).
// 각 칸은 [점 번호 목록, 자모 이름]입니다.
export default {
    meta: {
        titles: {
            home: 'Braillearn — 나만의 속도로 배우는 점자',
            historia: '이야기 — Braillearn',
            tecnologia: '기술 — Braillearn',
            comunidad: '커뮤니티 — Braillearn',
        },
        descriptions: {
            home: 'Braillearn: 확대된 점을 가진 모듈식 점자 디스플레이와, 촉각 민감도가 낮은 분들을 위한 학습 플랫폼.',
            historia: 'Braillearn이 존재하는 이유: 일반 점자의 생리적·경제적 장벽, 그리고 이를 만드는 팀.',
            tecnologia: 'Braillearn 뒤의 공학: 솔레노이드, ESP8266, 수동 래칭, 비용, 소프트웨어.',
            comunidad: '캄페체의 시각장애인과 가족을 위한 기관과 지원 자료.',
        },
    },

    common: {
        skipToContent: '본문으로 건너뛰기',
        tryPlatform: '플랫폼 체험하기',
        placeholderPrefix: '자리 표시',
        mainNav: '주 메뉴',
        footerNav: '바닥글',
        openMenu: '메뉴 열기',
        closeMenu: '메뉴 닫기',
        previous: '이전',
        next: '다음',
    },

    nav: { producto: '제품', tecnologia: '기술', historia: '이야기', comunidad: '커뮤니티', contacto: '문의' },

    a11y: {
        label: '접근성 옵션',
        textSize: '글자 크기',
        sizes: { md: '보통', lg: '크게', xl: '매우 크게' },
        reduceMotion: '애니메이션 줄이기',
    },

    language: { label: '언어' },

    voice: {
        utterances: ['다음 페이지', '페이지 넘겨 줘'],
        result: '다음 페이지',
        intent: '같은 의도: 이동 → 다음',
    },

    hero: {
        tagline: '손과 목소리, 화면으로 나만의 속도에 맞춰 점자를 배워 보세요.',
        seeProduct: '제품 알아보기',
        words: [
            // 안녕
            [
                [[1, 2, 6], 'ㅏ'],
                [[2, 5], 'ㄴ'],
                [[1, 4], 'ㄴ'],
                [[1, 5, 6], 'ㅕ'],
                [[2, 3, 5, 6], 'ㅇ'],
            ],
            // 점자
            [
                [[4, 6], 'ㅈ'],
                [[2, 3, 4], 'ㅓ'],
                [[2, 6], 'ㅁ'],
                [[4, 6], 'ㅈ'],
            ],
        ],
    },

    statement: {
        aria: 'Braillearn이란',
        text: 'Braillearn은 큰 점으로 이루어진 점자 디스플레이이자, 손으로 읽는 법을 가르쳐 주는 플랫폼입니다. 한국어로, 나만의 속도로, 기술 지식 없이도 배울 수 있습니다.',
    },

    display: {
        eyebrow: '디스플레이',
        title: '8mm 점. 느끼도록 만들었습니다.',
        lead: '각 점은 일반 점자의 다섯 배가 넘는 크기여서 어떤 손끝으로도 구별할 수 있습니다.',
        highlights: [
            { value: '8 mm', label: '5mm 촉각 임계값을 훨씬 넘는 확대된 점.' },
            { value: '72 × 48 mm', label: '여섯 개의 점으로 이루어진 셀 하나의 크기. 도구 없이 연결됩니다.' },
            { value: '3,493 MXN', label: '최소 구성: 베이스와 셀 하나. 필요할 때 늘려 가세요.' },
        ],
    },

    platform: {
        eyebrow: '플랫폼',
        title: '나만의 속도로 배우세요.',
        lead: '매뉴얼도, 사전 교육도 필요 없이 나에게 맞춰지는 한국어 수업.',
        previewTitle: '학습 플랫폼 미리보기',
        previewNote: '플랫폼의 실제 메인 화면입니다. 전체 버전에는 강좌, 시뮬레이터 등이 포함되어 있습니다.',
        features: [
            {
                title: '알파벳에서 단어까지',
                text: '나와 함께 나아가는 학습 경로: 먼저 글자를 하나씩 익히고, 이어서 단어를 읽고 만들어 봅니다.',
            },
            {
                title: '디스플레이와 화면에서 동시에',
                text: '각 문자가 점과 화면에 동시에 나타나서, 곁에서 돕는 사람도 함께 따라올 수 있습니다.',
            },
            {
                title: '축하해 주는 소리',
                text: '다시 하고 싶게 만드는 소리 피드백과 작은 성취들.',
            },
        ],
    },

    bento: {
        aria: '음성과 접근성',
        voice: {
            eyebrow: '음성',
            title: '말을 걸어 보세요. 알아듣습니다.',
            text: '한국어 음성으로 탐색하세요. 어떻게 말하든 Braillearn이 하려는 일을 이해합니다.',
        },
        access: {
            eyebrow: '접근성',
            title: '모두를 위해 설계했습니다.',
            text: '스크린 리더와 호환되며, 플랫폼을 내게 맞게 조정하는 패널이 있습니다.',
            readersLabel: '호환되는 스크린 리더',
            settings: ['음성 속도', '시각 대비', '글자 크기', '디스플레이의 촉각 반응'],
        },
    },

    modular: {
        eyebrow: '모듈식',
        title: '셀 하나로 시작해 스무 개까지.',
        lead: '가족, 학교, 클리닉 모두 작게 시작해서 필요할 때 셀을 추가할 수 있습니다.',
        cellsLabel: '셀 개수',
        readout: (cells, dots) => `셀 ${cells}개 · 점 ${dots}개`,
        minimum: { label: '최소 구성', detail: '베이스 + 셀 1개' },
        complete: { label: '전체 구성', detail: '베이스 + 셀 20개 · 점 120개' },
        techLink: '기술 알아보기',
    },

    contact: {
        title: 'Braillearn을 학교, 클리닉, 가정에 도입하고 싶으신가요?',
        text: '오늘 플랫폼을 체험해 보시고 필요한 점을 알려 주세요. 셀 하나씩 시스템을 만들어 드립니다.',
        mail: '문의하기',
    },

    footer: { note: '검증 단계의 시제품입니다.' },

    problem: {
        eyebrow: '장벽',
        title: '더는 느끼지 못하는 손끝을 고려하지 않은 표준.',
        lead: '점자를 배우는 일이 돈이나 손가락의 민감도에 좌우되어서는 안 됩니다. 지금은 둘 모두에 달려 있습니다.',
        stat: {
            text: '멕시코 당뇨병 환자가 말초신경병증을 겪는 비율입니다.',
            before: '신경병증은 촉각 식별 임계값을',
            threshold: '5mm',
            after: ' 이상으로 높입니다. 이런 분들에게 1.5mm 점자를 읽는 일은 장갑을 끼고 읽는 것과 같습니다.',
            source: '출처',
            percentSpoken: ' 퍼센트',
        },
        photo: {
            label: '사용자 사진 또는 비교 이미지',
            hint: '일반 1.5mm 셀과 Braillearn 8mm 셀을 나란히',
        },
        context: [
            { value: '18.3%', label: '멕시코 성인 중 당뇨병을 앓는 비율', source: 'ENSANUT 2022' },
            {
                value: '26.9%',
                label: '멕시코 시각장애인 중 0~14세 아동이 차지하는 비율',
                source: 'INEGI, 2020',
            },
            {
                value: 'USD 899–5,495',
                label: '시중에서 판매되는 리프레시 점자 디스플레이의 가격 범위',
                source: 'Orbit Research, Humanware, Freedom Scientific, 2024–2025',
            },
        ],
        scale: {
            title: '해결은 점의 크기에서 시작됩니다.',
            lead: '세 원은 서로 실제 비율로 그려져 있습니다. 1mm의 길이는 세 원 모두 같습니다.',
            items: [
                {
                    display: '1.5 mm',
                    title: '일반 점자',
                    note: 'BANA / ONCE 규격으로, 정상적인 촉각 민감도를 기준으로 합니다.',
                    verdict: '신경병증이 있으면 읽기 어려움',
                },
                {
                    display: '> 5 mm',
                    title: '식별 임계값',
                    note: '이 거리를 넘으면 일반 점자를 유창하게 읽기가 불가능해집니다(Nakada & Dellon, 1989).',
                    verdict: '신경병증에서의 임계값',
                },
                {
                    display: '8 mm',
                    title: 'Braillearn',
                    note: '임계값을 넘는 확대된 점으로, 문자를 배우기 전의 아이들도 구별할 수 있습니다.',
                    verdict: '임계값 이상',
                },
            ],
        },
        bridge: {
            eyebrow: '우리의 해답',
            title: '8mm 점을 담은 72 × 48mm 매크로 셀.',
            text: '각 셀은 5mm 임계값을 훨씬 넘어서며, 아이의 손끝도 구별할 만큼 큽니다. 생리적 장벽과, 어떤 가정이나 학교, 클리닉도 셀 하나씩 조립할 수 있는 하드웨어 해법을 잇는 다리입니다.',
        },
        cell: {
            aria: '6점 대화형 점자 셀',
            dot: (n, raised) => `${n}번 점, ${raised ? '올라옴' : '내려감'}`,
            caption: '점을 눌러 보세요. 실제 디스플레이에서는 50ms 펄스가 각 점을 올리고, 기구가 그 상태를 유지합니다.',
        },
    },

    team: {
        eyebrow: '팀',
        title: '분명한 목적을 가진 공학.',
        lead: (faculty, university, advisor) => `${university} ${faculty} 학생들이 ${advisor}의 지도 아래 만들고 있습니다.`,
        photoAlt: 'Braillearn 팀 세 사람이 밤에 보행자 거리에서 함께 포즈를 취하고 있습니다.',
        hint: '각 팀원에 마우스를 올리거나 눌러서 이름과 전공 분야를 확인해 보세요.',
        together: '각자 전문 분야는 있지만, 프로젝트 전체를 함께 만들었습니다.',
        members: [
            {
                role: '컴퓨터 시스템 공학',
            },
            {
                role: '소프트웨어 기술 공학',
            },
            {
                role: '메카트로닉스 공학',
            },
        ],
    },

    architecture: {
        eyebrow: '아키텍처',
        title: '적게 들고 적게 쓰도록 설계한 모듈식 하드웨어.',
        lead: '모든 설계 결정은 현실의 제약에 답합니다. 손으로 느낄 수 있는 점, 하나씩 살 수 있는 셀, 작업실에서도 고칠 수 있는 전자회로.',
        chainTitle: '신호 체인',
        chain: [
            { tag: 'MCU', name: 'ESP8266 NodeMCU', note: 'HTTP로 점 정보로 변환된 텍스트를 받습니다.' },
            { tag: '레지스터', name: '74HC595 데이지 체인', note: '핀을 확장해 수백 개의 점을 구동합니다.' },
            { tag: '전력', name: 'MOSFET IRLZ44N', note: '2N2222A와 1N5408 플라이백 다이오드를 함께 쓰며, 반전 논리로 동작합니다.' },
            { tag: '액추에이터', name: '솔레노이드 Ø 8 mm', note: '50ms 펄스와 수동 래칭.' },
        ],
        specs: [
            {
                tag: '구동',
                title: '전자기 솔레노이드',
                metric: 'Ø 8 mm',
                text: '24 AWG 에나멜 구리선을 PETG로 출력한 코어에 손으로 감았습니다. 단가가 낮고 짧은 펄스로도 충분한 힘을 냅니다.',
            },
            {
                tag: '제어',
                title: 'ESP8266과 시프트 레지스터',
                metric: 'HTTP · Wi-Fi',
                text: '마이크로컨트롤러 하나가 셀 체인 전체를 제어합니다. 펌웨어가 연결된 셀 수에 맞춰 스캔을 조정합니다.',
            },
            {
                tag: '에너지',
                title: '수동 래칭',
                metric: '50 ms',
                text: '펄스 한 번으로 점을 올리면 리트랙터블 펜 기구가 지속적인 전력 소모 없이 그 상태를 유지합니다.',
            },
            {
                tag: '비용',
                title: '최적화된 제조',
                metric: '6,315 MXN',
                text: '셀 20개, 점 120개의 전체 시스템: 가장 저렴한 상용 디스플레이의 24.1%.',
            },
        ],
        cost: {
            eyebrow: '이용 비용 · MXN',
            title: '전체 시스템의 비용은 가장 저렴한 상용 디스플레이의 24.1%입니다.',
            rows: [
                { label: 'Braillearn · 최소 구성', detail: '베이스 + 셀 1개' },
                { label: 'Braillearn · 전체 구성', detail: '베이스 + 셀 20개' },
                { label: 'Orbit Reader 40', detail: '가장 저렴한 상용 디스플레이' },
                { label: '상용 제품 중앙값', detail: '15개 기기' },
                { label: '가장 비싼 상용 디스플레이', detail: '비교한 15개 중' },
            ],
            note: 'Braillearn: 도매 제조 원가(LCSC, Alibaba, 2026년 5월). 상용 제품: 15개 기기의 2024–2025년 정가.',
        },
        modular: {
            eyebrow: '모듈식 모델',
            text: '베이스는 한 번만 구입하고, 예산이 허락할 때마다 셀을 추가합니다.',
            base: { label: '베이스', note: '제어 전자회로와 구조물 전체. 일회성 결제.' },
            cell: { label: '셀', note: '6점 기계 모듈. 필요할 때 추가합니다.' },
        },
    },

    software: {
        eyebrow: '소프트웨어',
        title: '의도를 이해하는 플랫폼.',
        lead: '디스플레이는 절반일 뿐입니다. 나머지 절반은 한국어로 가르치고, 하드웨어와 실시간으로 대화하며, 명령어를 외우라고 요구하지 않는 웹 생태계입니다.',
        web: {
            label: '웹 생태계',
            title: '브라우저에서 솔레노이드까지',
            text: '각 문자가 물리 디스플레이와 화면에 동시에 표시되어, 시각장애가 없는 보호자나 교사도 함께할 수 있습니다. 자체 API가 텍스트를 점으로 변환해 HTTP로 ESP8266에 보냅니다.',
            techLabel: '기술 스택',
        },
        nlu: {
            label: 'NLU 모듈',
            title: '명령어가 아닌 의도',
            text: '코사인 유사도 분류는 정확한 단어가 아니라 의미 벡터가 향하는 방향에 따라 판단합니다.',
            illustrative: '설명용 예시',
            score: '50/50',
            scoreText: '통제된 테스트에서 의도를 정확히 분류했습니다(100%).',
        },
        access: {
            label: '접근성',
            title: '부가 기능이 아닌 핵심 요건',
            text: 'ARIA 시맨틱 레이블을 빠짐없이 적용해 스크린 리더와 호환되며, “다음”, “반복”, “선택” 같은 명령으로 한국어 음성 탐색을 지원합니다.',
            readersLabel: '호환되는 스크린 리더',
            panelLabel: '접근성 패널',
            settings: ['음성 속도', '시각 대비', '글꼴 크기', '하드웨어 촉각 설정'],
        },
        status: {
            label: '프로젝트 상태:',
            text: '기초~중급 수준의 동작하는 시제품.',
            next: '다음 단계: 최종 사용자 테스트.',
        },
    },

    history: {
        hero: {
            eyebrow: '우리의 이야기',
            title: '현실의 문제에서 금메달까지.',
            lead: 'Braillearn은 점자를 배우는 일이 돈이나 손가락의 민감도에 좌우되지 않도록 시작되었습니다. 여기까지 온 과정을 소개합니다.',
            videoAria: '영상: Braillearn, Infomatrix México 2026 금메달',
            caption: 'Infomatrix México 2026 금메달, 태국 국제 결선 진출.',
            fallback: '이 브라우저에서는 영상을 재생할 수 없습니다.',
        },
        labels: ['문제', '장벽', '우리의 해답', '만들기', '검증하기', '인정받다', '앞으로'],
        build: {
            title: '모든 셀을 손으로 만들었습니다.',
            text: '솔레노이드 120개를 손으로 감고, 기구를 3D로 출력해 셀 20개를 조립했습니다. 시제품에서는 13개를 작동시켜, 몇 개를 연결하든 시스템이 똑같이 동작함을 보여 줍니다.',
            stats: ['조립한 셀', '손으로 감은 솔레노이드', '독립적으로 작동하는 점'],
            galleryLabel: '제작 과정 사진',
            photos: [
                '조립 전에 3D 프린터로 출력한 기구 부품.',
                '손으로 감은 솔레노이드.',
                '열어 본 셀: 솔레노이드와 점을 움직이는 부품.',
                '배선까지 마친 3D 프린트 셀.',
                '셀을 올려 두는 모듈식 베이스.',
                '손으로 배선한 제어 보드와 마이크로컨트롤러.',
                '작업실: 보드, 코일, 화이트보드의 계산.',
                '셀 묶음을 조립하고 시험하는 모습.',
            ],
        },
        proof: {
            title: '작동한다는 것을 확인했습니다.',
            text: '플랫폼은 기초~중급 수준에서 탐색 오류 없이 동작하며, 자연어 모듈은 통제된 테스트의 의도 50개를 모두 맞혔습니다.',
            stats: [
                { value: '50/50', label: '통제된 테스트에서 정확히 분류한 의도' },
                { value: 'ARIA', label: 'NVDA, JAWS, VoiceOver와 호환' },
            ],
        },
        recognition: {
            title: '심사위원도 알아봤습니다.',
            text: 'Infomatrix 2025(지역)에서 은메달, Infomatrix México 2026(전국)에서 금메달을 받았고, 이제 국제 결선을 향해 갑니다.',
            items: [
                { when: '2025', title: 'Infomatrix 지역 대회', medal: '은메달' },
                { when: '2026', title: 'Infomatrix México(전국)', medal: '금메달' },
                { when: '다음', title: '국제 결선', medal: '태국' },
            ],
        },
        next: {
            title: '앞으로의 계획.',
            text: '시제품은 아직 검증 단계입니다. 다음 단계는 다음과 같습니다.',
            items: [
                '최종 사용자 임상 테스트',
                '고급 커리큘럼: 문법, 문장, 글',
                '납땜 없이 보드끼리 잇는 플러그 앤 플레이 커넥터',
                '확장을 위한 독립 서비스(마이크로서비스)',
            ],
        },
    },

    community: {
        eyebrow: '커뮤니티',
        title: '캄페체에서 도움을 받을 수 있는 곳.',
        lead: '장애가 있는 분들과 가족을 위한 기관과 자료입니다. 시각장애인 또는 저시력인 단체를 대표하신다면 꼭 만나 뵙고 싶습니다.',
        labels: { address: '주소', phone: '전화', email: '이메일', web: '웹사이트', hours: '운영 시간' },
        checked: (date) => `${date} 기준으로 확인한 정보입니다. 방문 전에 다시 확인해 주세요.`,
        orgs: {
            cree: {
                kind: '캄페체 DIF',
                description: '장애인을 위한 통원 종합 재활: 전문 진료, 물리·작업·언어 치료, 준의료 지원.',
                hours: '월~금, 오전 6시 30분~오후 8시',
            },
            seinclusion: {
                kind: '주 정부',
                description: '시각장애인과 가족, 교사를 위한 점자 강좌를 운영해 온 주 정부 기관.',
            },
        },
        cta: {
            title: '단체가 목록에 없나요?',
            text: '알려 주시면 기꺼이 추가하겠습니다.',
            button: '문의하기',
        },
    },

    tech: {
        solenoidPhoto: { label: '손으로 감은 우리의 솔레노이드를 분해한 모습: 막대, 구리 코일, 스프링이 든 하우징.' },
        pulse: {
            aria: '그래프: 50ms 전류 펄스가 점을 올리고, 점은 전력 소모 없이 올라간 상태를 유지합니다',
            current: '전류',
            dot: '점',
            raised: '올라옴',
            held: '지속적인 전력 소모 없음',
        },
    },

    models: {
        display: { alt: '완성된 Braillearn 디스플레이의 3D 모델입니다. 드래그해서 회전해 보세요.' },
        cell: { alt: 'Braillearn 셀의 3D 모델입니다. 드래그해서 회전해 보세요.' },
        solenoid: { alt: '솔레노이드와 래칭 기구의 3D 모델입니다. 드래그해서 회전해 보세요.' },
        loading: '3D 모델 불러오는 중…',
        error: '3D 모델을 불러오지 못했습니다.',
        tabs: { label: '보기', model: '3D', photo: '사진' },
    },

    backend: {
        title: '백엔드 아키텍처',
        lead: '하나의 FastAPI 서비스가 보안, 계정, 점자 변환, 디스플레이와의 통신을 맡습니다.',
        summary: '백엔드 아키텍처: API 클라이언트와 ESP 마이크로컨트롤러가 Braillearn API(FastAPI, SQLAlchemy)와 통신합니다. API에는 보안 미들웨어, 인증 관리, 기기 통신, 점자 변환, 학습 플랫폼, 전사, 카탈로그, 기기 페어링, 사용자, 문서 관리, 명령용 WebSocket이 포함되며, PostgreSQL 데이터베이스와 파일 저장 서버를 사용합니다.',
        client: { title: '클라이언트', text: 'API 소비자.' },
        esp: { title: 'ESP', text: '마이크로컨트롤러.' },
        api: { title: 'Braillearn API', text: 'FastAPI + SQLAlchemy' },
        database: { title: '데이터베이스', text: 'PostgreSQL.' },
        storage: { title: '파일 저장소', text: '서버.' },
        modules: {
            security: { title: '보안 미들웨어', text: '요청 속도 제한, JWT 검증, 봇 필터링.' },
            auth: { title: '인증 관리자', text: 'JWT 토큰.' },
            device: { title: '기기 통신', text: '설정 및 탐색.' },
            braille: { title: '점자 변환', text: '변환 및 점 위치로의 매핑.' },
            learning: { title: '학습 플랫폼', text: '수업.' },
            transcription: { title: '전사', text: '' },
            catalog: { title: '카탈로그', text: '공개 문서 접근.' },
            pairing: { title: '기기 페어링', text: '요청 및 확인.' },
            users: { title: '사용자', text: '회원 가입 및 로그인.' },
            documents: { title: '문서 관리', text: '' },
            websocket: { title: 'WebSocket /commands', text: '의도 분류.' },
        },
    },
};
