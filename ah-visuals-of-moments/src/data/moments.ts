import { Locale, defaultLocale } from "@/i18n/config";
import { RawMoment, Moment } from "@/types/moment";

export const RAW_MOMENTS: RawMoment[] = [
  {
    id: "AH001",
    productCode: "MOM-001",
    slug: "moment-001",
    status: "published",
    createdAt: "2026-08-01T10:00:00.000Z",
    dateLabel: {
      fr: "Été 2019",
      en: "Summer 2019",
      uk: "Літо 2019",
      ru: "Лето 2019",
    },
    location: {
      city: {
        fr: "Kyiv",
        en: "Kyiv",
        uk: "Київ",
        ru: "Киев",
      },
      country: {
        fr: "Ukraine",
        en: "Ukraine",
        uk: "Україна",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 50.451974,
        longitude: 30.526393,
      },
      mapUrl: "https://maps.google.com/?q=50.451974,30.526393",
      visibility: "exact",
    },
    mainImage: {
      id: "AH001-main",
      src: "/moments/moment-001/moment-001-2.webp",
      alt: {
        fr: "T-shirt unisexe AH Visuals of Moments avec impression photo du Moment 001 porté par des modèles",
        en: "AH Visuals of Moments unisex T-shirt featuring Moment 001 photograph print on models",
        uk: "Унісекс-футболка AH Visuals of Moments із фотопринтом Моменту 001 на моделях",
        ru: "Унисекс-футболка AH Visuals of Moments с принтом Момента 001 на моделях",
      },
      width: 1280,
      height: 1017,
    },
    heroImage: {
      id: "AH001-hero",
      src: "/moments/moment-001/moment-001-2.webp",
      alt: {
        fr: "Présentation lookbook du t-shirt Moment 001 avec photographie de coucher de soleil à Kyiv",
        en: "Lookbook presentation of Moment 001 T-shirt featuring sunset photograph taken in Kyiv",
        uk: "Презентація футболки Момент 001 із заходом сонця в Києві на моделях",
        ru: "Презентация футболки Момент 001 с закатной фотографией Киева на моделях",
      },
      width: 1280,
      height: 1017,
    },
    cardImage: {
      id: "AH001-card",
      src: "/moments/moment-001/moment-001-2.webp",
      alt: {
        fr: "Présentation du design du t-shirt Moment 001",
        en: "Moment 001 T-shirt design presentation",
        uk: "Презентація дизайну футболки Момент 001",
        ru: "Презентация дизайна футболки Момент 001",
      },
      width: 1280,
      height: 1017,
    },
    gallery: [
      {
        id: "AH001-gallery-1",
        src: "/moments/moment-001/moment-001-2.webp",
        alt: {
          fr: "Vue de face et de dos du t-shirt unisexe Moment 001 sur modèles",
          en: "Front and back view of Moment 001 unisex T-shirt on models",
          uk: "Вигляд спереду та ззаду унісекс-футболки Момент 001 на моделях",
          ru: "Вид спереди и сзади унисекс-футболки Момент 001 на моделях",
        },
        width: 1280,
        height: 1017,
      },
      {
        id: "AH001-gallery-2",
        src: "/moments/moment-001/moment-001-1.webp",
        alt: {
          fr: "Aperçu des déclinaisons de couleur pour le t-shirt Moment 001",
          en: "Color variants overview for Moment 001 T-shirt",
          uk: "Огляд колірних варіантів футболки Момент 001",
          ru: "Обзор цветовых вариантов футболки Момент 001",
        },
        width: 1280,
        height: 1024,
      },
    ],
    mockups: [
      {
        id: "AH001-mockup-lineup",
        image: {
          id: "AH001-mockup-1",
          src: "/moments/moment-001/moment-001-1.webp",
          alt: {
            fr: "Quatre coloris de t-shirt (noir profond, taupe poudré, sable chaud, prune vintage) avec logo devant et photo de coucher de soleil au dos",
            en: "Four T-shirt color variants (black, taupe, sand, vintage plum) with front logo and back sunset photo print",
            uk: "Чотири колірні варіанти футболки (глибокий чорний, графітово-бежевий, пісочний, винний) з логотипом спереду та принтом заходу сонця на спині",
            ru: "Четыре цветовых варианта футболки (чёрный, графитово-бежевый, песчаный, сливовый) с логотипом и принтом заката",
          },
          width: 1280,
          height: 1024,
        },
      },
    ],
    availableColors: [
      {
        id: "black",
        name: {
          fr: "Noir profond",
          en: "Deep Black",
          uk: "Глибокий чорний",
          ru: "Глубокий чёрный",
        },
        hex: "#1c1c1e",
      },
      {
        id: "taupe",
        name: {
          fr: "Taupe poudré",
          en: "Muted Taupe",
          uk: "Графітово-бежевий",
          ru: "Графитово-бежевый",
        },
        hex: "#5a544f",
      },
      {
        id: "sand",
        name: {
          fr: "Sable chaud",
          en: "Warm Sand",
          uk: "Теплий пісочний",
          ru: "Песчаный",
        },
        hex: "#9e8869",
      },
      {
        id: "plum",
        name: {
          fr: "Prune vintage",
          en: "Vintage Plum",
          uk: "Вінтажний винний",
          ru: "Винный",
        },
        hex: "#583f4b",
      },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrId: "AH001",
    qrPath: "/q/AH001",
    isIndexable: true,
    translations: {
      fr: {
        title: "Moment 001",
        shortDescription:
          "Une soirée ordinaire s'est gravée dans les mémoires lorsque le ciel de Kyiv s'est embrasé de nuances roses, pourpres et dorées.",
        story:
          "Je rentrais chez moi après le travail. C'était une soirée ordinaire, semblable à tant d'autres. Je marchais le long des rues familières, absorbée par mes pensées, sans prêter attention à ce qui m'entourait. Puis, à un instant précis, j'ai levé les yeux vers le ciel.\n\nC'était saisissant. Des teintes de rose, de pourpre et d'or semblaient avoir suspendu la ville entière pendant quelques minutes. Les voitures continuaient de rouler, les passants se hâtaient vers chez eux, alors que je sortais simplement mon téléphone pour capturer cet instant.\n\nÀ cette époque, j'ignorais qu'années plus tard, cette photographie ferait partie de mon histoire. Parfois, les plus beaux moments surviennent précisément quand on s'y attend le moins.",
        seoTitle: "Moment 001",
        seoDescription:
          "Découvrez l'histoire d'une photographie capturée lors d'une soirée d'été à Kyiv en 2019 et le t-shirt unisexe né de cet instant.",
      },
      en: {
        title: "Moment 001",
        shortDescription:
          "An ordinary evening became a lasting memory when the sky over Kyiv illuminated in pink, purple, and gold.",
        story:
          "I was walking home after work. It was an ordinary evening, no different from hundreds of others. I walked down familiar streets, lost in my thoughts, barely paying attention to what was happening around me. But at some point, I looked up and saw the sky.\n\nIt was incredible. Pink, purple, and golden shades seemed to stop the entire city for a few minutes. Cars kept driving, people hurried home, while I simply took out my phone and captured this shot.\n\nBack then, I didn't know that years later this photograph would become a part of my story. Sometimes the most beautiful moments happen right when you least expect them.",
        seoTitle: "Moment 001",
        seoDescription:
          "Discover the story behind a summer evening photograph taken in Kyiv in 2019 and the unisex T-shirt created from that moment.",
      },
      uk: {
        title: "Момент 001",
        shortDescription:
          "Звичайний вечір став частиною історії, коли небо над Києвом засяяло рожевими, фіолетовими та золотими відтінками.",
        story:
          "Я поверталася додому після роботи. Це був звичайний вечір, нічим не особливий з-поміж сотень інших. Я йшла знайомими вулицями, поринувши у власні думки, і майже не помічала того, що відбувалося довкола. Та в якусь мить підвела погляд і побачила небо.\n\nВоно було неймовірним. Рожеві, фіолетові та золоті кольори немов на кілька хвилин зупинили все місто. Машини продовжували рух, люди поспішали додому, а я просто дістала телефон і зробила цей кадр.\n\nТоді я ще не знала, що через роки ця світлина стане частиною моєї історії. Іноді найкрасивіші моменти трапляються саме тоді, коли на них зовсім не чекаєш.",
        seoTitle: "Момент 001",
        seoDescription:
          "Історія фотографії літнього вечірнього неба, зробленої в Києві у 2019 році, та створеної на її основі унісекс-футболки.",
      },
      ru: {
        title: "Момент 001",
        shortDescription:
          "Обычный вечер стал частью истории, когда небо над Киевом окрасилось в розовые, фиолетовые и золотые оттенки.",
        story:
          "Я возвращалась домой после работы. Это был обычный вечер, ничем не отличавшийся от сотен других. Я шла по знакомым улицам, думала о своём и почти не обращала внимания на то, что происходит вокруг. Но в какой-то момент подняла глаза и увидела небо.\n\nОно было невероятным. Розовые, фиолетовые и золотые оттенки словно на несколько минут остановили весь город. Машины продолжали ехать, люди спешили домой, а я просто достала телефон и сделала этот снимок.\n\nТогда я ещё не знала, что спустя годы эта фотография станет частью моей истории. Иногда самые красивые моменты случаются именно тогда, когда ты меньше всего этого ожидаешь.",
        seoTitle: "Момент 001",
        seoDescription:
          "История фотографии летнего вечернего неба, сделанной в Киеве в 2019 году, и созданной на её основе унисекс-футболки.",
      },
    },
  },
  {
    id: "AH002",
    productCode: "MOM-002",
    slug: "moment-002",
    status: "published",
    createdAt: "2026-08-02T12:00:00.000Z",
    dateLabel: {
      fr: "Été 2019",
      en: "Summer 2019",
      uk: "Літо 2019",
      ru: "Лето 2019",
    },
    location: {
      city: {
        fr: "Vychhorod",
        en: "Vyshhorod",
        uk: "Вишгород",
        ru: "Вышгород",
      },
      country: {
        fr: "Ukraine",
        en: "Ukraine",
        uk: "Україна",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 50.58565,
        longitude: 30.486364,
      },
      mapUrl: "https://maps.google.com/?q=50.585650,30.486364",
      visibility: "exact",
    },
    mainImage: {
      id: "AH002-main",
      src: "/moments/moment-002/moment-002-2.webp",
      alt: {
        fr: "T-shirt unisexe AH Visuals of Moments avec impression photo du Moment 002 porté par des modèles",
        en: "AH Visuals of Moments unisex T-shirt featuring Moment 002 photograph print on models",
        uk: "Унісекс-футболка AH Visuals of Moments із фотопринтом Моменту 002 на моделях",
        ru: "Унисекс-футболка AH Visuals of Moments с принтом Момента 002 на моделях",
      },
      width: 1280,
      height: 1018,
    },
    heroImage: {
      id: "AH002-hero",
      src: "/moments/moment-002/moment-002-2.webp",
      alt: {
        fr: "Présentation lookbook du t-shirt Moment 002 avec photographie de soirée à Vychhorod",
        en: "Lookbook presentation of Moment 002 T-shirt featuring evening photograph taken in Vyshhorod",
        uk: "Презентація футболки Момент 002 із вечірньою фотографією Вишгорода на моделях",
        ru: "Презентация футболки Момент 002 с вечерней фотографией Вышгорода на моделях",
      },
      width: 1280,
      height: 1018,
    },
    cardImage: {
      id: "AH002-card",
      src: "/moments/moment-002/moment-002-2.webp",
      alt: {
        fr: "Présentation du design du t-shirt Moment 002",
        en: "Moment 002 T-shirt design presentation",
        uk: "Презентація дизайну футболки Момент 002",
        ru: "Презентация дизайна футболки Момент 002",
      },
      width: 1280,
      height: 1018,
    },
    gallery: [
      {
        id: "AH002-gallery-1",
        src: "/moments/moment-002/moment-002-2.webp",
        alt: {
          fr: "Vue de face et de dos du t-shirt unisexe Moment 002 sur modèles",
          en: "Front and back view of Moment 002 unisex T-shirt on models",
          uk: "Вигляд спереду та ззаду унісекс-футболки Момент 002 на моделях",
          ru: "Вид спереди и сзади унисекс-футболки Момент 002 на моделях",
        },
        width: 1280,
        height: 1018,
      },
      {
        id: "AH002-gallery-2",
        src: "/moments/moment-002/moment-002-1.webp",
        alt: {
          fr: "Aperçu des déclinaisons de couleur pour le t-shirt Moment 002",
          en: "Color variants overview for Moment 002 T-shirt",
          uk: "Огляд колірних варіантів футболки Момент 002",
          ru: "Обзор цветовых вариантов футболки Момент 002",
        },
        width: 1280,
        height: 1024,
      },
    ],
    mockups: [
      {
        id: "AH002-mockup-lineup",
        image: {
          id: "AH002-mockup-1",
          src: "/moments/moment-002/moment-002-1.webp",
          alt: {
            fr: "Quatre déclinaisons de couleur avec logo devant et photo de soirée au dos",
            en: "Four T-shirt color variants with front logo and back evening photo print",
            uk: "Чотири колірні варіанти футболки з логотипом спереду та вечірнім фотопринтом на спині",
            ru: "Четыре цветовых варианта футболки с логотипом и принтом заката",
          },
          width: 1280,
          height: 1024,
        },
      },
    ],
    availableColors: [
      {
        id: "black",
        name: {
          fr: "Noir profond",
          en: "Deep Black",
          uk: "Глибокий чорний",
          ru: "Глубокий чёрный",
        },
        hex: "#1c1c1e",
      },
      {
        id: "taupe",
        name: {
          fr: "Taupe poudré",
          en: "Muted Taupe",
          uk: "Графітово-бежевий",
          ru: "Графитово-бежевый",
        },
        hex: "#5a544f",
      },
      {
        id: "sand",
        name: {
          fr: "Sable chaud",
          en: "Warm Sand",
          uk: "Теплий пісочний",
          ru: "Песчаный",
        },
        hex: "#9e8869",
      },
      {
        id: "plum",
        name: {
          fr: "Prune vintage",
          en: "Vintage Plum",
          uk: "Вінтажний винний",
          ru: "Винный",
        },
        hex: "#583f4b",
      },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrId: "AH002",
    qrPath: "/q/AH002",
    isIndexable: true,
    translations: {
      fr: {
        title: "Moment 002",
        shortDescription:
          "Une attente ordinaire est devenue un souvenir durable lorsqu'une douce soirée d'été à Vychhorod a teinté le ciel d'or et de rose.",
        story:
          "C'était une douce soirée d'été à Vychhorod. J'étais assise devant la maison en attendant un ami. Il me suffisait de sonner à l'interphone pour qu'il descende, mais à la place, je me suis simplement arrêtée quelques minutes.\n\nIl n'y avait presque personne dans la rue calme. Tout semblait serein. Rien que la douceur de l'air vespéral, les derniers reflets du soleil et le ciel qui se nuançait peu à peu de rose et d'or. J'ai réalisé que cet instant ne durerait que quelques minutes, alors j'ai sorti mon téléphone et j'ai pris cette photo.\n\nEn la regardant aujourd'hui, je me souviens non seulement de ce magnifique coucher de soleil, mais aussi du profond apaisement de cette soirée. Parfois, il ne faut rien d'extraordinaire pour qu'un instant devienne un précieux souvenir. Ce sont sans doute ces soirées paisibles qui restent le plus longtemps en nous.",
        seoTitle: "Moment 002",
        seoDescription:
          "Découvrez l'histoire d'une photographie de soirée d'été prise à Vychhorod en 2019 et le t-shirt conçu à partir de cet instant.",
      },
      en: {
        title: "Moment 002",
        shortDescription:
          "An ordinary wait turned into a lasting memory when a warm summer evening in Vyshhorod painted the sky in pink and gold.",
        story:
          "It was a warm summer evening in Vyshhorod. I was sitting outside the house waiting for a friend. All I needed to do was ring the intercom for him to come down, but instead, I simply paused for a few minutes.\n\nThere was hardly anyone on the quiet street. Everything around felt serene. Just the soft evening air, the last rays of the sun, and the sky gradually turning pink and gold. I realized that this moment would only last a few minutes, so I pulled out my phone and took this photograph.\n\nWhen I look at it now, I remember not only that beautiful sunset, but also the deep calm of that evening. Sometimes it takes nothing extraordinary for a moment to become a cherished memory. Perhaps it is these quiet evenings that stay with us the longest.",
        seoTitle: "Moment 002",
        seoDescription:
          "Discover the story behind a summer evening photograph taken in Vyshhorod in 2019 and the T-shirt created from that moment.",
      },
      uk: {
        title: "Момент 002",
        shortDescription:
          "Звичайне очікування перетворилося на спогад, коли теплий літній вечір у Вишгороді забарвив небо в рожеві та золоті тони.",
        story:
          "Це був теплий літній вечір у Вишгороді. Я сиділа біля будинку й чекала на друга. Треба було просто зателефонувати в домофон, щоб він вийшов, але натомість я на кілька хвилин просто завмерла.\n\nНа тихій вулиці майже нікого не було. Усе навколо дихало спокоєм. Лише легке вечірнє повітря, останні промені сонця і небо, що повільно набувало рожевих та золотих відтінків. Я відчула, що ця мить триватиме лічені хвилини. Тому дістала телефон і зробила цю фотографію.\n\nКоли дивлюся на неї зараз, згадую не лише цей красивий захід сонця, а й той глибокий спокій, яким був сповнений той вечір. Іноді не потрібно нічого надзвичайного, аби мить стала дорогим серцю спогадом. Напевно, саме такі тихі вечори залишаються з нами найдовше.",
        seoTitle: "Момент 002",
        seoDescription:
          "Історія фотографії літнього вечора у Вишгороді, зробленої у 2019 році, та створеної на її основі унісекс-футболки.",
      },
      ru: {
        title: "Момент 002",
        shortDescription:
          "Обычное ожидание превратилось в воспоминание, когда тёплый летний вечер в Вышгороде окрасил небо в розовые и золотые тона.",
        story:
          "Это был тёплый летний вечер в Вышгороде. Я сидела возле дома и ждала друга. Нужно было просто позвонить в домофон, чтобы он спустился, но вместо этого я на несколько минут просто остановилась.\n\nНа тихой улице почти никого не было. Всё вокруг было спокойно. Только лёгкий вечерний воздух, последние лучи солнца и небо, которое постепенно окрашивалось в розовые и золотые оттенки. Я поняла, что этот момент продлится всего несколько минут. Поэтому достала телефон и сделала эту фотографию.\n\nКогда смотрю на неё сейчас, вспоминаю не только этот красивый закат, но и то спокойствие, которое было в тот вечер. Иногда не нужно ничего особенного, чтобы момент стал дорогим воспоминанием. Наверное, именно такие вечера остаются с нами дольше всего.",
        seoTitle: "Момент 002",
        seoDescription:
          "История фотографии летнего вечера в Вышгороде, сделанной в 2019 году, и созданной на её основе унисекс-футболки.",
      },
    },
  },
  {
    id: "AH003",
    productCode: "MOM-003",
    slug: "moment-003",
    status: "published",
    createdAt: "2026-08-03T15:00:00.000Z",
    dateLabel: {
      fr: "Été 2019",
      en: "Summer 2019",
      uk: "Літо 2019",
      ru: "Лето 2019",
    },
    location: {
      city: {
        fr: "Vychhorod (quai Chaïka)",
        en: "Vyshhorod (Chaika Embankment)",
        uk: "Вишгород (набережна «Чайка»)",
        ru: "Вышгород (набережная «Чайка»)",
      },
      country: {
        fr: "Ukraine",
        en: "Ukraine",
        uk: "Україна",
        ru: "Украина",
      },
      countryCode: "UA",
      coordinates: {
        latitude: 50.590618,
        longitude: 30.505032,
      },
      mapUrl: "https://maps.google.com/?q=50.590618,30.505032",
      visibility: "exact",
    },
    mainImage: {
      id: "AH003-main",
      src: "/moments/moment-003/moment-003-2.webp",
      alt: {
        fr: "T-shirt unisexe AH Visuals of Moments avec impression photo du Moment 003 porté par des modèles",
        en: "AH Visuals of Moments unisex T-shirt featuring Moment 003 photograph print on models",
        uk: "Унісекс-футболка AH Visuals of Moments із фотопринтом Моменту 003 на моделях",
        ru: "Унисекс-футболка AH Visuals of Moments с принтом Момента 003 на моделях",
      },
      width: 1280,
      height: 1022,
    },
    heroImage: {
      id: "AH003-hero",
      src: "/moments/moment-003/moment-003-2.webp",
      alt: {
        fr: "Présentation lookbook du t-shirt Moment 003 avec coucher de soleil au quai Chaïka",
        en: "Lookbook presentation of Moment 003 T-shirt featuring sunset photograph taken at Chaika Embankment",
        uk: "Презентація футболки Момент 003 із заходом сонця на набережній «Чайка» на моделях",
        ru: "Презентация футболки Момент 003 с закатом на набережной «Чайка» на моделях",
      },
      width: 1280,
      height: 1022,
    },
    cardImage: {
      id: "AH003-card",
      src: "/moments/moment-003/moment-003-2.webp",
      alt: {
        fr: "Présentation du design du t-shirt Moment 003",
        en: "Moment 003 T-shirt design presentation",
        uk: "Презентація дизайну футболки Момент 003",
        ru: "Презентация дизайна футболки Момент 003",
      },
      width: 1280,
      height: 1022,
    },
    gallery: [
      {
        id: "AH003-gallery-1",
        src: "/moments/moment-003/moment-003-2.webp",
        alt: {
          fr: "Vue de face et de dos du t-shirt unisexe Moment 003 sur modèles",
          en: "Front and back view of Moment 003 unisex T-shirt on models",
          uk: "Вигляд спереду та ззаду унісекс-футболки Момент 003 на моделях",
          ru: "Вид спереди и сзади унисекс-футболки Момент 003 на моделях",
        },
        width: 1280,
        height: 1022,
      },
      {
        id: "AH003-gallery-2",
        src: "/moments/moment-003/moment-003-1.webp",
        alt: {
          fr: "Aperçu des déclinaisons de couleur pour le t-shirt Moment 003",
          en: "Color variants overview for Moment 003 T-shirt",
          uk: "Огляд колірних варіантів футболки Момент 003",
          ru: "Обзор цветовых вариантов футболки Момент 003",
        },
        width: 1280,
        height: 1024,
      },
    ],
    mockups: [
      {
        id: "AH003-mockup-lineup",
        image: {
          id: "AH003-mockup-1",
          src: "/moments/moment-003/moment-003-1.webp",
          alt: {
            fr: "Quatre déclinaisons de couleur avec logo devant et photo de coucher de soleil au dos",
            en: "Four T-shirt color variants with front logo and back sunset photo print",
            uk: "Чотири колірні варіанти футболки з логотипом спереду та фотопринтом заходу сонця на спині",
            ru: "Четыре цветовых варианта футболки с логотипом и принтом заката",
          },
          width: 1280,
          height: 1024,
        },
      },
    ],
    availableColors: [
      {
        id: "black",
        name: {
          fr: "Noir profond",
          en: "Deep Black",
          uk: "Глибокий чорний",
          ru: "Глубокий чёрный",
        },
        hex: "#1c1c1e",
      },
      {
        id: "taupe",
        name: {
          fr: "Taupe poudré",
          en: "Muted Taupe",
          uk: "Графітово-бежевий",
          ru: "Графитово-бежевый",
        },
        hex: "#5a544f",
      },
      {
        id: "sand",
        name: {
          fr: "Sable chaud",
          en: "Warm Sand",
          uk: "Теплий пісочний",
          ru: "Песчаный",
        },
        hex: "#9e8869",
      },
      {
        id: "plum",
        name: {
          fr: "Prune vintage",
          en: "Vintage Plum",
          uk: "Вінтажний винний",
          ru: "Винный",
        },
        hex: "#583f4b",
      },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    videoUrl: null,
    externalPurchaseUrl: null,
    qrId: "AH003",
    qrPath: "/q/AH003",
    isIndexable: true,
    translations: {
      fr: {
        title: "Moment 003",
        shortDescription:
          "Coucher de soleil sur le fleuve Dnipro au quai Chaïka — un havre de paix où l'on revient pour contempler et se ressourcer.",
        story:
          "Ce lieu a toujours eu une résonance particulière pour moi. Le quai Chaïka à Vychhorod est un endroit où je revenais inlassablement pour contempler le crépuscule. Non pas parce que chaque soirée était différente, mais parce qu'aucun coucher de soleil n'y était jamais semblable à un autre.\n\nJe pouvais rester assise au bord de l'eau, à regarder le soleil disparaître lentement sous l'horizon tandis que le Dnipro reflétait ses derniers éclats de lumière. Dans ces instants, le temps semblait suspendu.\n\nJ'ai souvent tenté d'immortaliser cette beauté à travers l'objectif. Aucune photographie ne peut égaler ce que le regard a ressenti, mais chacune conserve l'émotion exacte de cet instant. C'est pourquoi ce cliché a rejoint ma collection. Pour certains, ce n'est qu'un beau coucher de soleil. Pour moi, c'est l'endroit où j'ai toujours désiré revenir.",
        seoTitle: "Moment 003",
        seoDescription:
          "Découvrez l'histoire d'un coucher de soleil photographié au quai Chaïka à Vychhorod et le t-shirt unisexe né de cet instant.",
      },
      en: {
        title: "Moment 003",
        shortDescription:
          "Sunset over the Dnipro River at Chaika Embankment — a place to return for peace and reflection.",
        story:
          "This place has always been special to me. Chaika Embankment in Vyshhorod is a place where I returned again and again to watch the sunset. Not because every evening was different, but because no two sunsets here were ever the same.\n\nI could simply sit by the water, watching the sun slowly sink below the horizon while the Dnipro reflected its final rays of light. In those moments, time felt like it stood still.\n\nI tried to capture this beauty through the camera lens many times. No photograph can fully express what my eyes saw, but each one holds the feeling I experienced at that exact moment. That is why this shot became a part of my collection. To some, it is just a beautiful sunset. To me, it is a place I always wanted to return to.",
        seoTitle: "Moment 003",
        seoDescription:
          "Discover the story behind a sunset photograph taken at Chaika Embankment in Vyshhorod and the T-shirt created from that moment.",
      },
      uk: {
        title: "Момент 003",
        shortDescription:
          "Захід сонця над Дніпром на набережній «Чайка» — місце, куди завжди хочеться повертатися за внутрішнім спокоєм.",
        story:
          "Це місце завжди було для мене особливим. Набережна «Чайка» у Вишгороді — простір, куди я знову і знову приходила проводжати сонце. Не тому, що кожен вечір був якимось іншим, а тому, що однакових заходів сонця тут просто ніколи не існувало.\n\nЯ могла годинами сидіти біля води, спостерігаючи, як сонце повільно занурюється за обрій, а Дніпро віддзеркалює останні промені світла. У такі хвилини здавалося, ніби час зупинився.\n\nЯ багато разів намагалася вловити цю красу через об'єктив камери. Жодна світлина не здатна повністю передати те, що бачили очі, але кожна з них береже відчуття, яке я переживала в ту саму мить. Саме тому цей кадр став частиною моєї колекції. Для когось це просто гарний захід сонця. Для мене — місце, куди завжди хотілося повертатися.",
        seoTitle: "Момент 003",
        seoDescription:
          "Історія фотографії заходу сонця на набережній «Чайка» у Вишгороді та створеної на її основі унісекс-футболки.",
      },
      ru: {
        title: "Момент 003",
        shortDescription:
          "Закат над Днепром на набережной «Чайка» — место, куда всегда хочется возвращаться за умиротворением.",
        story:
          "Это место всегда было для меня особенным. Набережная «Чайка» в Вышгороде — место, куда я снова и снова приходила встречать закат. Не потому что каждый вечер был разным, а потому что одинаковых закатов здесь никогда не существовало.\n\nЯ могла просто сидеть у воды, смотреть, как солнце медленно опускается за горизонт, а Днепр отражает последние лучи света. В такие моменты казалось, что время останавливается.\n\nЯ много раз пыталась передать эту красоту через объектив камеры. Ни одна фотография не способна полностью показать то, что видели мои глаза, но каждая из них хранит чувство, которое я испытывала в тот момент. Именно поэтому этот снимок стал частью моей коллекции. Для кого-то это просто красивый закат. Для меня — место, куда всегда хотелось возвращаться.",
        seoTitle: "Момент 003",
        seoDescription:
          "История фотографии заката на набережной «Чайка» в Вышгороде и созданной на её основе унисекс-футболки.",
      },
    },
  },
];

export function resolveMoment(raw: RawMoment, locale: Locale): Moment {
  const trans = raw.translations[locale] || raw.translations[defaultLocale];
  const dateLabel = raw.dateLabel[locale] || raw.dateLabel[defaultLocale];
  const city = raw.location.city[locale] || raw.location.city[defaultLocale];
  const country =
    raw.location.country[locale] || raw.location.country[defaultLocale];

  return {
    id: raw.id,
    productCode: raw.productCode,
    slug: raw.slug,
    title: trans.title,
    shortDescription: trans.shortDescription,
    story: trans.story,
    seoTitle: trans.seoTitle,
    seoDescription: trans.seoDescription,
    location: {
      city,
      country,
      countryCode: raw.location.countryCode,
      coordinates: raw.location.coordinates,
      mapUrl: raw.location.mapUrl,
      visibility: raw.location.visibility,
    },
    mainImage: {
      id: raw.mainImage.id,
      src: raw.mainImage.src,
      alt: raw.mainImage.alt[locale] || raw.mainImage.alt[defaultLocale],
      width: raw.mainImage.width,
      height: raw.mainImage.height,
    },
    heroImage: raw.heroImage
      ? {
          id: raw.heroImage.id,
          src: raw.heroImage.src,
          alt: raw.heroImage.alt[locale] || raw.heroImage.alt[defaultLocale],
          width: raw.heroImage.width,
          height: raw.heroImage.height,
        }
      : undefined,
    cardImage: raw.cardImage
      ? {
          id: raw.cardImage.id,
          src: raw.cardImage.src,
          alt: raw.cardImage.alt[locale] || raw.cardImage.alt[defaultLocale],
          width: raw.cardImage.width,
          height: raw.cardImage.height,
        }
      : undefined,
    gallery: raw.gallery
      ? raw.gallery.map((img) => ({
          id: img.id,
          src: img.src,
          alt: img.alt[locale] || img.alt[defaultLocale],
          width: img.width,
          height: img.height,
        }))
      : undefined,
    mockups: raw.mockups.map((m) => ({
      id: m.id,
      image: {
        id: m.image.id,
        src: m.image.src,
        alt: m.image.alt[locale] || m.image.alt[defaultLocale],
        width: m.image.width,
        height: m.image.height,
      },
      color: m.color
        ? {
            id: m.color.id,
            name: m.color.name[locale] || m.color.name[defaultLocale],
            hex: m.color.hex,
          }
        : undefined,
    })),
    availableColors: raw.availableColors.map((c) => ({
      id: c.id,
      name: c.name[locale] || c.name[defaultLocale],
      hex: c.hex,
    })),
    availableSizes: raw.availableSizes,
    status: raw.status,
    createdAt: raw.createdAt,
    dateLabel,
    videoUrl: raw.videoUrl,
    externalPurchaseUrl: raw.externalPurchaseUrl,
    qrId: raw.qrId,
    qrPath: raw.qrPath,
    isIndexable: raw.isIndexable,
  };
}

/**
 * Returns published moments for public storefront gallery and collection showcase.
 * Archived, draft, and review stories are excluded.
 */
export function getPublishedMoments(locale: Locale = defaultLocale): Moment[] {
  return RAW_MOMENTS.filter((m) => m.status === "published").map((m) =>
    resolveMoment(m, locale)
  );
}

/**
 * Returns indexable public moments for XML sitemap.
 * Requires: status === "published" AND isIndexable === true.
 */
export function getIndexableMoments(locale: Locale = defaultLocale): Moment[] {
  return RAW_MOMENTS.filter(
    (m) => m.status === "published" && m.isIndexable === true
  ).map((m) => resolveMoment(m, locale));
}

/**
 * Retrieves a moment by its human-readable slug.
 * Accessible for: "published" and "archived" (archived ≠ deleted).
 * Draft and review stories return undefined.
 */
export function getMomentBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Moment | undefined {
  const raw = RAW_MOMENTS.find((m) => m.slug === slug);
  if (!raw || (raw.status !== "published" && raw.status !== "archived")) {
    return undefined;
  }
  return resolveMoment(raw, locale);
}

/**
 * Retrieves a moment strictly by its permanent public QR identifier (e.g. "AH001").
 * Lookup is strictly by qrId. slug and productCode are NOT alternative QR identifiers.
 * Accessible for: "published" and "archived" moments.
 */
export function getMomentByQrId(
  qrId: string,
  locale: Locale = defaultLocale
): Moment | undefined {
  const raw = RAW_MOMENTS.find((m) => m.qrId === qrId);
  if (!raw || (raw.status !== "published" && raw.status !== "archived")) {
    return undefined;
  }
  return resolveMoment(raw, locale);
}

export function getMomentByProductCode(
  productCode: string,
  locale: Locale = defaultLocale
): Moment | undefined {
  const raw = RAW_MOMENTS.find((m) => m.productCode === productCode);
  if (!raw || (raw.status !== "published" && raw.status !== "archived")) {
    return undefined;
  }
  return resolveMoment(raw, locale);
}

export function getAllMoments(locale: Locale = defaultLocale): Moment[] {
  return RAW_MOMENTS.map((m) => resolveMoment(m, locale));
}
