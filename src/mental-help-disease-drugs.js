/**
 * Каталог препаратов для структурированного анамнеза заболевания (группы + молекула + примеры ТН).
 * @type {Array<{ title: string; drugs: Array<{ id: string; molecule: string; brands: string }> }>}
 */
export const DISEASE_DRUG_CATALOG = [
  {
    title: "Группа 1. Антидепрессанты",
    drugs: [
      { id: "ad_esc", molecule: "Эсциталопрам", brands: "Ципралекс, Лексапро, Элицея, Селектра" },
      { id: "ad_ser", molecule: "Сертралин", brands: "Золофт, Асентра, Серлифт, Торин, Стимулотон" },
      { id: "ad_par", molecule: "Пароксетин", brands: "Паксил, Рексетин, Адепресс, Плизил" },
      { id: "ad_fluox", molecule: "Флуоксетин", brands: "Прозак, Флуоксетин-Ланнахер, Флувал, Продеп" },
      { id: "ad_traz", molecule: "Тразодон", brands: "Триттико, Азона, Олептро" },
      { id: "ad_fluv", molecule: "Флувоксамин", brands: "Феварин, Лювокс" },
      { id: "ad_ven", molecule: "Венлафаксин", brands: "Велаксин, Эфевелон, Венлаксор, Ньювелонг" },
      { id: "ad_dul", molecule: "Дулоксетин", brands: "Симбалта, Дулоксетин-Канон, Дульта" },
      { id: "ad_aza", molecule: "Азафен", brands: "Азафен, Пиразидол" },
      { id: "ad_amit", molecule: "Амитриптилин", brands: "Амитриптилин, Амитриптилин-ЛекТ" },
      { id: "ad_vald", molecule: "Агомелатин (Вальдоксан)", brands: "Вальдоксан, Агомелатин" },
      { id: "ad_mirt", molecule: "Миртазапин", brands: "Ремерон, Миртазон, Эспритал, Миразапин" },
      { id: "ad_bup", molecule: "Бупропион", brands: "Веллбутрин, Зибан, Воксра" },
      { id: "ad_cit", molecule: "Циталопрам", brands: "Ципрамил, Опра, Сиотам" },
      { id: "ad_vor", molecule: "Вортиоксетин", brands: "Бринтелликс, Тринтилликс" },
      { id: "ad_desv", molecule: "Десвенлафаксин", brands: "Десвелаксин, Пристик" },
    ],
  },
  {
    title: "Группа 2. Анксиолитики (противотревожные, снотворные)",
    drugs: [
      { id: "anx_hydr", molecule: "Гидроксизин", brands: "Атаракс, Гидроксизин" },
      { id: "anx_tof", molecule: "Тофизопам", brands: "Грандаксин" },
      { id: "anx_etif", molecule: "Этифоксин", brands: "Стрезам" },
      { id: "anx_phen", molecule: "Феназепам", brands: "Феназепам, Феназепам-Реневал" },
      { id: "anx_alp", molecule: "Алпразолам", brands: "Ксанакс, Алзолам, Хелекс" },
      { id: "anx_diaz", molecule: "Диазепам", brands: "Реланиум, Седуксен, Диазепам" },
      { id: "anx_clon", molecule: "Клоназепам", brands: "Клонекс, Ривотрил" },
      { id: "anx_lor", molecule: "Лоразепам", brands: "Лорафен, Мерлит" },
      { id: "anx_brom", molecule: "Бромазепам", brands: "Лексотан, Бромазепам" },
      { id: "anx_med", molecule: "Медазепам", brands: "Рудотель, Мезапам" },
      { id: "anx_zop", molecule: "Зопиклон", brands: "Имован, Соннат, Зопиклон" },
      { id: "anx_zol", molecule: "Золпидем", brands: "Санвал, Ивадал" },
    ],
  },
  {
    title: "Группа 3. Нормотимики (стабилизаторы настроения)",
    drugs: [
      { id: "nm_lam", molecule: "Ламотриджин", brands: "Ламиктал, Ламотриджин, Ламитра" },
      { id: "nm_carb", molecule: "Карбамазепин", brands: "Финлепсин, Тегретол, Карбамазепин" },
      { id: "nm_li", molecule: "Лития карбонат", brands: "Литий, Литосан, Литий-карбонат" },
      { id: "nm_val", molecule: "Вальпроаты", brands: "Депакин, Конвулекс, Вальпроксин" },
      { id: "nm_oxc", molecule: "Окскарбазепин", brands: "Трилептал, Окскарбазепин" },
    ],
  },
  {
    title: "Группа 4. Нейролептики (антипсихотики)",
    drugs: [
      { id: "ap_qu", molecule: "Кветиапин", brands: "Сероквель, Кветиапин, Квентиакс, Кетилепт" },
      { id: "ap_ris", molecule: "Рисперидон", brands: "Рисполепт, Рисперидон, Рилептид" },
      { id: "ap_olz", molecule: "Оланзапин", brands: "Зипрекса, Оланзапин, Эголанза" },
      { id: "ap_ami", molecule: "Амисульприд", brands: "Солиан, Амисульприд" },
      { id: "ap_ari", molecule: "Арипипразол", brands: "Абилифай, Арипризол, Зилаксера" },
      { id: "ap_zuc", molecule: "Зуклопентиксол", brands: "Клопиксол" },
      { id: "ap_flup", molecule: "Флупентиксол", brands: "Флюанксол, Флупентиксол" },
      { id: "ap_hal", molecule: "Галоперидол", brands: "Галоперидол, Сенорм" },
      { id: "ap_ser", molecule: "Сертиндол", brands: "Сердолект" },
      { id: "ap_pal", molecule: "Палиперидон", brands: "Инвега, Ксеплион" },
      { id: "ap_clo", molecule: "Клозапин", brands: "Азалептин, Лепонекс" },
    ],
  },
];

/** @returns {string[]} */
export function allDiseaseDrugIds() {
  const out = [];
  for (const g of DISEASE_DRUG_CATALOG) {
    for (const d of g.drugs) out.push(d.id);
  }
  return out;
}
