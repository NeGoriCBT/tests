/**
 * Генерирует src/mental-help-disease-drugs-catalog.js из встроенного списка молекул + ТН.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** @type {Array<{ title: string; drugs: Array<{ id: string; molecule: string; brands: string }> }>} */
const CATALOG = [
  {
    title: "1. Антидепрессанты",
    drugs: [
      { id: "ad_esc", molecule: "Эсциталопрам", brands: "Ципралекс, Лексапро, Элицея, Селектра, Ленуксин, Цивельт, Эсциталопрам Канон, Эсциталопрам Реневал, Эсциталопрам Фармасинтез, Эсциталопрам-АЛСИ, Эсциталопрам-СЗ" },
      { id: "ad_ser", molecule: "Сертралин", brands: "Золофт, Асентра, Серлифт, Торин, Стимулотон, Серената, Депрефолт" },
      { id: "ad_par", molecule: "Пароксетин", brands: "Паксил, Рексетин, Адепресс, Плизил, Пароксетин Канон" },
      { id: "ad_fluox", molecule: "Флуоксетин", brands: "Прозак, Флуоксетин-Ланнахер, Флувал, Продеп, Апо-Флуоксетин, Флунисан" },
      { id: "ad_fluv", molecule: "Флувоксамин", brands: "Феварин, Лювокс, Флувоксамин Кроно, Флувоксамин Органика, Флувоксамин Фармасинтез, Флувоксамин-СЗ" },
      { id: "ad_ven", molecule: "Венлафаксин", brands: "Велаксин, Эфевелон, Венлаксор, Ньювелонг, Венлафаксин Канон" },
      { id: "ad_dul", molecule: "Дулоксетин", brands: "Симбалта, Дулоксетин-Канон, Дульта" },
      { id: "ad_mirt", molecule: "Миртазапин", brands: "Ремерон, Миртазон, Эспритал, Миразапин, Мирзатен, Каликста" },
      { id: "ad_bup", molecule: "Бупропион", brands: "Веллбутрин, Зибан, Воксра" },
      { id: "ad_cit", molecule: "Циталопрам", brands: "Ципрамил, Опра, Сиотам" },
      { id: "ad_vor", molecule: "Вортиоксетин", brands: "Бринтелликс, Тринтилликс" },
      { id: "ad_desv", molecule: "Десвенлафаксин", brands: "Десвелаксин, Пристик" },
      { id: "ad_traz", molecule: "Тразодон", brands: "Триттико, Азона, Олептро" },
      { id: "ad_aza", molecule: "Азафен", brands: "Азафен, Пиразидол" },
      { id: "ad_amit", molecule: "Амитриптилин", brands: "Амитриптилин ЛекТ, Амитриптилин-Ферейн, Амизол, Триптизол" },
      { id: "ad_clom", molecule: "Кломипрамин", brands: "Анафранил, Клофранил" },
      { id: "ad_map", molecule: "Мапротилин", brands: "Людиомил" },
      { id: "ad_imi", molecule: "Имипрамин", brands: "Мелипрамин" },
      { id: "ad_agom", molecule: "Агомелатин", brands: "Вальдоксан" },
    ],
  },
  {
    title: "2. Анксиолитики (транквилизаторы)",
    drugs: [
      { id: "anx_phen", molecule: "Феназепам", brands: "Феназепам, Феназепам-Реневал, Феназипам" },
      { id: "anx_diaz", molecule: "Диазепам", brands: "Реланиум, Седуксен" },
      { id: "anx_lor", molecule: "Лоразепам", brands: "Лорафен, Мерлит" },
      { id: "anx_clon", molecule: "Клоназепам", brands: "Клонекс, Ривотрил" },
      { id: "anx_alp", molecule: "Алпразолам", brands: "Ксанакс, Алзолам, Хелекс, Фронтин" },
      { id: "anx_brom", molecule: "Бромазепам", brands: "Лексотан" },
      { id: "anx_med", molecule: "Медазепам", brands: "Рудотель, Мезапам" },
      { id: "anx_oxa", molecule: "Оксазепам", brands: "Тазепам" },
      { id: "anx_noz", molecule: "Нозепам", brands: "Нозепам" },
      { id: "anx_chlord", molecule: "Хлордиазепоксид", brands: "Элениум" },
      { id: "anx_tetra", molecule: "Тетразепам", brands: "Тетразепам" },
      { id: "anx_hydr", molecule: "Гидроксизин", brands: "Атаракс" },
      { id: "anx_tof", molecule: "Тофизопам", brands: "Грандаксин" },
      { id: "anx_etif", molecule: "Этифоксин", brands: "Стрезам" },
      { id: "anx_bus", molecule: "Буспирон", brands: "Спитомин, Буспинал" },
      { id: "anx_zop", molecule: "Зопиклон", brands: "Имован, Соннат, Релаксон" },
      { id: "anx_zol", molecule: "Золпидем", brands: "Санвал, Ивадал" },
      { id: "anx_zal", molecule: "Залеплон", brands: "Анданте" },
    ],
  },
  {
    title: "3. Нормотимики",
    drugs: [
      { id: "nm_lam", molecule: "Ламотриджин", brands: "Ламиктал, Ламотриджин Канон, Ламитра, Ламотриджин-СЗ" },
      { id: "nm_carb", molecule: "Карбамазепин", brands: "Финлепсин, Тегретол, Карбамазепин Канон" },
      { id: "nm_oxc", molecule: "Окскарбазепин", brands: "Трилептал" },
      { id: "nm_li", molecule: "Лития карбонат", brands: "Литий, Литосан, Литий-карбонат" },
      { id: "nm_val", molecule: "Вальпроаты", brands: "Депакин, Конвулекс, Вальпроксин, Энкорат, Вальпроат натрия, Дивалпроекс" },
      { id: "nm_gab", molecule: "Габапентин", brands: "Нейронтин, Габапентин Канон, Тебантин" },
    ],
  },
  {
    title: "4. Нейролептики",
    drugs: [
      { id: "ap_qu", molecule: "Кветиапин", brands: "Сероквель, Кветиапин Канон, Квентиакс, Кетилепт" },
      { id: "ap_ris", molecule: "Рисперидон", brands: "Рисполепт, Рилептид" },
      { id: "ap_olz", molecule: "Оланзапин", brands: "Зипрекса, Эголанза" },
      { id: "ap_ami", molecule: "Амисульприд", brands: "Солиан" },
      { id: "ap_ari", molecule: "Арипипразол", brands: "Абилифай, Арипризол, Зилаксера, Арипа" },
      { id: "ap_zuc", molecule: "Зуклопентиксол", brands: "Клопиксол" },
      { id: "ap_flup", molecule: "Флупентиксол", brands: "Флюанксол" },
      { id: "ap_ser", molecule: "Сертиндол", brands: "Сердолект" },
      { id: "ap_pal", molecule: "Палиперидон", brands: "Инвега, Ксеплион" },
      { id: "ap_clo", molecule: "Клозапин", brands: "Азалептин, Лепонекс" },
      { id: "ap_hal", molecule: "Галоперидол", brands: "Сенорм" },
      { id: "ap_chl", molecule: "Хлорпромазин", brands: "Аминазин" },
      { id: "ap_trif", molecule: "Трифлуоперазин", brands: "Трифтазин" },
      { id: "ap_thio", molecule: "Тиоридазин", brands: "Сонапакс" },
      { id: "ap_perf", molecule: "Перфеназин", brands: "Перфеназин" },
      { id: "ap_etap", molecule: "Этаперазин", brands: "Этаперазин" },
      { id: "ap_sulp", molecule: "Сульпирид", brands: "Эглонил, Бетамокс" },
      { id: "ap_pim", molecule: "Пимозид", brands: "Пимозид" },
      { id: "ap_flus", molecule: "Флушпирилен", brands: "Имап" },
      { id: "ap_drop", molecule: "Дроперидол", brands: "Дроперидол" },
    ],
  },
  {
    title: "5. Противосудорожные (в психиатрии)",
    drugs: [
      { id: "as_preg", molecule: "Прегабалин", brands: "Лирика, Прегабалин Канон, Альгерика" },
      { id: "as_top", molecule: "Топирамат", brands: "Топамакс" },
      { id: "as_lev", molecule: "Леветирацетам", brands: "Кеппра" },
      { id: "as_eth", molecule: "Этосуксимид", brands: "Суксилеп" },
      { id: "as_phen", molecule: "Фенитоин", brands: "Дифенин" },
      { id: "as_prim", molecule: "Примидон", brands: "Гексамидин" },
      { id: "as_tia", molecule: "Тиагабин", brands: "Габитрил" },
      { id: "as_zon", molecule: "Зонисамид", brands: "Зонегран" },
      { id: "as_lac", molecule: "Лакосамид", brands: "Вимпат" },
      { id: "as_per", molecule: "Перампанел", brands: "Файкомпа" },
      { id: "as_esl", molecule: "Эсликарбазепин", brands: "Зебиникс" },
      { id: "as_briv", molecule: "Бриварацетам", brands: "Бривиак" },
      { id: "as_ruf", molecule: "Руфинамид", brands: "Инвелон" },
      { id: "as_cen", molecule: "Ценобамат", brands: "Онтозри" },
    ],
  },
  {
    title: "6. Фенибут и ноофен",
    drugs: [
      { id: "ot_phen", molecule: "Фенибут", brands: "Фенибут, Фенибут-АНВИ, Фенибут-Латин" },
      { id: "ot_noo", molecule: "Ноофен", brands: "Ноофен" },
    ],
  },
  {
    title: "7. Растительные и адаптогены",
    drugs: [
      { id: "ph_pers", molecule: "Персен", brands: "Персен" },
      { id: "ph_novo", molecule: "Ново-Пассит", brands: "Ново-Пассит" },
      { id: "ph_sed", molecule: "Седавит", brands: "Седавит, Седасен" },
      { id: "ph_val", molecule: "Валериана", brands: "Валериана экстракт, Валериана форте" },
      { id: "ph_pust", molecule: "Пустырник", brands: "Пустырник экстракт, Пустырник форте" },
      { id: "ph_mel", molecule: "Мелисса", brands: "Мелисса экстракт" },
      { id: "ph_dep", molecule: "Деприм", brands: "Деприм, Негрустин, Гелариум Гиперикум" },
      { id: "ph_fit", molecule: "Фитоседан", brands: "Фитоседан, Сбор успокоительный №1, №2, №3" },
    ],
  },
  {
    title: "8. Успокоительные, БАДы, гомеопатия",
    drugs: [
      { id: "ad_afob", molecule: "Афобазол", brands: "Афобазол" },
      { id: "ad_ten", molecule: "Тенотен", brands: "Тенотен, Тенотен детский" },
      { id: "ad_adap", molecule: "Адаптол", brands: "Адаптол" },
      { id: "ad_meb", molecule: "Мебикар", brands: "Мебикар" },
      { id: "ad_gly", molecule: "Глицин", brands: "Глицин, Глицин форте" },
      { id: "ad_fez", molecule: "Фезам", brands: "Фезам" },
      { id: "ad_mel", molecule: "Мелатонин", brands: "Мелаксен, Меларена, Сонмил" },
      { id: "ad_mag", molecule: "Магне B6", brands: "Магне B6, Магний хелат, Цитрат магния, Глицинат магния" },
    ],
  },
  {
    title: "9. Корвалол и аналоги",
    drugs: [
      { id: "cv_kor", molecule: "Корвалол", brands: "Корвалол, Корвалол М" },
      { id: "cv_val", molecule: "Валокордин", brands: "Валокордин, Валокордин-Доппельгерц" },
      { id: "cv_valos", molecule: "Валосердин", brands: "Валосердин, Валоседан" },
      { id: "cv_zel", molecule: "Капли Зеленина", brands: "Капли Зеленина, Капли Морозова" },
    ],
  },
  {
    title: "10. Другие частые препараты",
    drugs: [
      { id: "ms_pir", molecule: "Пирацетам", brands: "Ноотропил" },
      { id: "ms_fen", molecule: "Фенотропил", brands: "Фенотропил" },
      { id: "ms_mex", molecule: "Мексидол", brands: "Мексидол, Мексиприм, Мексифин" },
      { id: "ms_neu", molecule: "Нейрокс", brands: "Нейрокс" },
      { id: "ms_cor", molecule: "Кортексин", brands: "Кортексин" },
      { id: "ms_act", molecule: "Актовегин", brands: "Актовегин" },
    ],
  },
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/mental-help-disease-drugs-catalog.js");
const body = `/** Автогенерация: npm run build:disease-drugs-catalog */\nexport const DISEASE_DRUG_CATALOG = ${JSON.stringify(CATALOG, null, 2)};\n`;
writeFileSync(outPath, body, "utf8");
console.log(`Wrote ${outPath} (${CATALOG.reduce((n, g) => n + g.drugs.length, 0)} drugs)`);
