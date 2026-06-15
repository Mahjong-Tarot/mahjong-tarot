#!/usr/bin/env python3
"""
Build the 114-star auspiciousness matrix, PRE-FILLED with AI first-draft 1-4
ratings (star nature x palace domain). For Bill to verify/override — these are
heuristics from general Zi Wei Dou Shu principles, NOT his lineage or the book.

Output: working_files/purple-star-matrix-rated.csv
"""
import csv, json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
STARS = json.load(open(os.path.join(ROOT, "website/data/ps/stars.json")))
OUT = os.path.join(ROOT, "working_files")
os.makedirs(OUT, exist_ok=True)

PAL = ["Fate", "Siblings", "Marriage", "Children", "Wealth", "Health",
       "Travel", "Friends", "Career", "Property", "Wellbeing", "Parents"]
PI = {p: i for i, p in enumerate(PAL)}

# ── the 114 (standard ZWDS inventory: 14 major + 14 minor + 38 杂曜 + 4×12 神煞) ──
GROUPS = {
 "Major": ['紫微','天机','太阳','武曲','天同','廉贞','天府','太阴','贪狼','巨门','天相','天梁','七杀','破军'],
 "Minor": ['文昌','文曲','左辅','右弼','天魁','天钺','禄存','天马','擎羊','陀罗','火星','铃星','地空','地劫'],
 "Adjunct": ['天寿','天巫','孤辰','天伤','八座','恩光','天贵','龙池','红鸾','天官','月德','天使','封诰','天虚',
             '解神','天厨','截路','阴煞','华盖','空亡','天刑','天哭','天才','天福','天德','台辅','旬空','破碎',
             '天喜','天月','寡宿','天姚','三台','凤阁','年解','咸池','天空','蜚廉'],
 "ChangSheng-12": ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'],
 "Boshi-12": ['博士','力士','青龙','小耗','将军','奏书','飞廉','喜神','病符','大耗','伏兵','官府'],
 "SuiQian-12": ['岁建','晦气','丧门','贯索','官符','小耗','大耗','龙德','白虎','天德','吊客','病符'],
 "JiangQian-12": ['将星','攀鞍','岁驿','息神','华盖','劫煞','灾煞','天煞','指背','咸池','月煞','亡神'],
}
# Si-Hua catalysts (NOT among the 114 — transform a host star)
CATALYSTS = [('化禄','Transforming Salary'),('化权','Transforming Authority'),
             ('化科','Transforming Examination'),('化忌','Transforming Jealousy')]

# ── base rating by intrinsic nature (1 worst … 4 best) ────────────────────────
BASE = {}
def setb(score, names):
    for n in names: BASE[n] = score
setb(4, ['紫微','天府','禄存','化禄','化权','化科','天魁','天钺','左辅','右弼','文昌','文曲',
         '龙德','天德','月德','解神','帝旺','临官','长生'])
setb(3, ['太阳','太阴','天同','天梁','天相','武曲','天机','天马','红鸾','天喜','天福','天官','天贵',
         '恩光','天寿','天才','天厨','天巫','龙池','凤阁','八座','三台','台辅','封诰','华盖','年解',
         '博士','青龙','将星','喜神','奏书','将军','冠带','养'])
setb(2, ['贪狼','巨门','廉贞','沐浴','胎','攀鞍','岁驿','力士','伏兵','息神','岁建','天使',
         '蜚廉','飞廉','阴煞','指背','月煞','晦气','空亡','旬空','截路'])
setb(1, ['七杀','破军','火星','铃星','擎羊','陀罗','地空','地劫','化忌','大耗','小耗','破碎','天刑',
         '天虚','天哭','孤辰','寡宿','天月','天空','天伤','衰','病','死','墓','绝',
         '白虎','丧门','吊客','官符','官府','贯索','劫煞','灾煞','天煞','亡神','病符'])

# ── palace-specific overrides for well-known star × domain interactions ────────
OV = {
 '紫微': {p:4 for p in PAL},
 '太阳': {'Career':4,'Parents':4,'Fate':4,'Marriage':3,'Friends':4},
 '太阴': {'Wealth':4,'Property':4,'Parents':3,'Fate':3,'Marriage':3},
 '天府': {'Wealth':4,'Property':4,'Fate':4,'Career':3},
 '武曲': {'Wealth':4,'Career':4,'Marriage':2,'Siblings':3},
 '天梁': {'Health':4,'Parents':4,'Fate':3,'Wellbeing':4},
 '天同': {'Wellbeing':4,'Marriage':3,'Health':3,'Fate':3,'Children':3},
 '天相': {'Career':3,'Marriage':3,'Fate':3,'Friends':3},
 '天机': {'Fate':3,'Wellbeing':3,'Siblings':3,'Career':3},
 '贪狼': {'Marriage':1,'Health':2,'Travel':2,'Career':3,'Wealth':3,'Children':2,'Wellbeing':2},
 '巨门': {'Marriage':2,'Siblings':2,'Parents':2,'Friends':2,'Career':3,'Fate':2},
 '廉贞': {'Marriage':2,'Health':2,'Career':3,'Fate':2,'Wealth':3},
 '七杀': {'Marriage':1,'Health':2,'Children':2,'Career':3,'Wealth':2,'Fate':2},
 '破军': {'Marriage':1,'Children':2,'Health':2,'Property':2,'Career':3,'Fate':2},
 '文昌': {'Career':4,'Children':4,'Fate':3,'Parents':3},
 '文曲': {'Career':4,'Children':4,'Fate':3,'Marriage':2},
 '天马': {'Travel':4,'Career':3,'Wealth':3,'Fate':3},
 '禄存': {'Wealth':4,'Career':3,'Fate':3,'Property':3},
 '火星': {'Marriage':1,'Health':1,'Siblings':2,'Children':2},
 '铃星': {'Marriage':1,'Health':1,'Siblings':2,'Children':2},
 '擎羊': {'Marriage':1,'Health':1,'Wealth':2,'Travel':2},
 '陀罗': {'Marriage':1,'Health':1,'Wealth':2,'Siblings':2},
 '地空': {'Wealth':1,'Career':2,'Fate':2},
 '地劫': {'Wealth':1,'Career':2,'Fate':2},
 '大耗': {'Wealth':1,'Property':1},
 '小耗': {'Wealth':2,'Property':2},
 '红鸾': {'Marriage':4,'Children':3,'Travel':2},
 '天喜': {'Marriage':4,'Children':4,'Friends':3},
 '天姚': {'Marriage':2,'Travel':2,'Friends':3},
 '咸池': {'Marriage':1,'Travel':1,'Children':2,'Wellbeing':2,'Friends':2,'Fate':2},
 '天刑': {'Career':3,'Health':2,'Marriage':2,'Fate':2},
 '天月': {'Health':1},
 '天虚': {'Marriage':2,'Wealth':2,'Fate':2},
 '孤辰': {'Marriage':1,'Siblings':2,'Children':2},
 '寡宿': {'Marriage':1,'Siblings':2,'Children':2},
 '化禄': {p:4 for p in PAL}, '化权': {'Career':4,'Fate':4,'Wealth':4},
 '化科': {'Career':4,'Fate':4,'Parents':4}, '化忌': {p:1 for p in PAL},
 '白虎': {'Health':1,'Career':2}, '病符': {'Health':1}, '官符': {'Career':1,'Friends':2},
}

def rate(hz, pal):
    if hz in OV and pal in OV[hz]:
        return OV[hz][pal]
    return BASE.get(hz, 2)

# core map for English/pinyin/type
core = {s["hanzi"]: s for s in STARS if s.get("hanzi")}
GLOSS = {  # full descriptive notes for non-core stars (consistent with GLOSS_CORE)
 '天寿':'Longevity, health, steadiness, slow aging','天巫':'Intuition, promotion, spiritual aptitude',
 '孤辰':'Solitude, isolation, emotional distance','天伤':'Injury, loss, hardship, vulnerability',
 '八座':'Rank, honors, official standing','恩光':'Favor, recognition, awards, visibility',
 '天贵':'Nobility, status, respect, refinement','龙池':'Talent, skill, artistry, accomplishment',
 '天官':'Office, rank, authority, public service','月德':'Protection, kindness, quiet good fortune',
 '天使':'Omens, sudden news, signals of fate','封诰':'Titles, honors, formal recognition',
 '天虚':'Emptiness, depletion, instability','解神':'Relief, resolution, dissolving trouble',
 '天厨':'Food, comfort, hospitality, nourishment','截路':'Blockage, obstruction, dead ends',
 '阴煞':'Hidden harm, suspicion, unseen trouble','华盖':'Solitude, spirituality, art, detachment',
 '空亡':'Emptiness, loss, nullified plans','天哭':'Grief, sorrow, mourning, melancholy',
 '天才':'Talent, cleverness, quick wit','天福':'Blessing, comfort, ease, good fortune',
 '天德':'Protection, virtue, quiet support','台辅':'Support, status, dignified backing',
 '旬空':'Emptiness, timing gaps, nullified effect','破碎':'Fragmentation, breakage, scattered loss',
 '天月':'Illness, chronic weakness, fatigue','寡宿':'Isolation, loneliness, marital distance',
 '三台':'Rank, status, steady advancement','凤阁':'Refinement, beauty, taste, elegance',
 '年解':'Relief, reprieve, easing annual trouble','咸池':'Romance, charm, indulgence, temptation',
 '天空':'Emptiness, fantasy, impracticality, loss of substance','蜚廉':'Gossip, slander, backbiting',
 '长生':'Growth, vitality, fresh starts, ascent','沐浴':'Instability, indulgence, distraction',
 '冠带':'Maturing, preparation, rising competence','临官':'Ascendancy, capability, established standing',
 '帝旺':'Peak vitality, strength, full power','衰':'Waning, fatigue, fading strength',
 '病':'Illness, weakness, low energy','死':'Endings, stagnation, exhaustion',
 '墓':'Storage, withdrawal, accumulation, dormancy','绝':'Severance, cut-off, lowest ebb',
 '胎':'Beginnings, potential, gestation','养':'Nurture, recovery, steady support',
 '博士':'Learning, intelligence, credentials','力士':'Force, drive, brute effort',
 '青龙':'Luck, joy, auspicious momentum','小耗':'Small losses, leakage, minor waste',
 '将军':'Authority, command, boldness','奏书':'Documents, contracts, recognition',
 '飞廉':'Gossip, slander, sharp tongues','喜神':'Joy, celebration, happy events',
 '病符':'Illness, recurring ailments, health drains','伏兵':'Ambush, hidden setbacks, lurking obstacles',
 '官府':'Litigation, officialdom, legal entanglement','岁建':'Annual anchor, authority, standing',
 '晦气':'Bad luck, low spirits, murky fortune','丧门':'Mourning, loss, bereavement',
 '贯索':'Entanglement, restriction, legal binds','官符':'Litigation, official trouble, reprimand',
 '龙德':'Protection, relief, noble support','白虎':'Conflict, injury, aggression, accidents',
 '吊客':'Grief, condolence, exposure to loss','将星':'Leadership, command, authority',
 '攀鞍':'Advancement, promotion, seizing momentum','岁驿':'Travel, movement, relocation',
 '息神':'Dormancy, low energy, withdrawal','劫煞':'Loss, theft, sudden seizure',
 '灾煞':'Disaster, accidents, sudden harm','天煞':'Obstruction from above, harsh setbacks',
 '指背':'Gossip, criticism, blame behind your back','月煞':'Friction, domestic harm, monthly trouble',
 '亡神':'Loss, depletion, things slipping away',
}

# English names for the non-core stars (keyed by hanzi → consistent across cycles)
ENGLISH = {
 # 杂曜 adjuncts
 '天寿':'Longevity Star','天巫':'Heavenly Shaman','孤辰':'Lonesome Star','天伤':'Heavenly Injury',
 '八座':'Eight Seats','恩光':'Grace and Light','天贵':'Heavenly Nobility','龙池':'Dragon Pool',
 '天官':'Heavenly Official','月德':'Moon Virtue','天使':'Heavenly Messenger','封诰':'Imperial Edict',
 '天虚':'Heavenly Hollow','解神':'Dissolving Spirit','天厨':'Heavenly Kitchen','截路':'Severed Path',
 '阴煞':'Shadow Star','华盖':'Canopy Star','空亡':'Void and Emptiness','天哭':'Heavenly Weeping',
 '天才':'Heavenly Talent','天福':'Heavenly Blessing','天德':'Heavenly Virtue','台辅':'Pillar of State',
 '旬空':'Cyclic Void','破碎':'Shattering Star','天月':'Heavenly Ailment','寡宿':'Widow Star',
 '三台':'Three Terraces','凤阁':'Phoenix Pavilion','年解':'Annual Reliever','咸池':'Peach Blossom',
 '天空':'Sky Void','蜚廉':'Flying Slander',
 # 长生十二神
 '长生':'Birth','沐浴':'Bathing','冠带':'Coming of Age','临官':'Officialdom','帝旺':'Prime',
 '衰':'Decline','病':'Sickness','死':'Death','墓':'Tomb','绝':'Extinction','胎':'Conception','养':'Nurture',
 # 博士十二神
 '博士':'Scholar','力士':'Strongman','青龙':'Azure Dragon','小耗':'Minor Loss','将军':'General',
 '奏书':'Memorial','飞廉':'Flying Slander','喜神':'Joy Spirit','病符':'Sickness Token','伏兵':'Hidden Soldier',
 '官府':'The Magistrate',
 # 岁前十二神
 '岁建':'Year Establish','晦气':'Gloom','丧门':'Mourning Gate','贯索':'Binding Rope',
 '官符':'Official Reprimand','龙德':'Dragon Virtue','白虎':'White Tiger','吊客':'Mourning Guest',
 # 将前十二神
 '将星':'Commander Star','攀鞍':'Mounting the Saddle','岁驿':'Year Courier','息神':'Resting Spirit',
 '劫煞':'Robbery Star','灾煞':'Calamity Star','天煞':'Heaven Curse','指背':'Backbiting',
 '月煞':'Moon Curse','亡神':'Loss Spirit',
}

PINYIN = {
 '天寿':'Tiān Shòu','天巫':'Tiān Wū','孤辰':'Gū Chén','天伤':'Tiān Shāng','八座':'Bā Zuò','恩光':'Ēn Guāng',
 '天贵':'Tiān Guì','龙池':'Lóng Chí','天官':'Tiān Guān','月德':'Yuè Dé','天使':'Tiān Shǐ','封诰':'Fēng Gào',
 '天虚':'Tiān Xū','解神':'Jiě Shén','天厨':'Tiān Chú','截路':'Jié Lù','阴煞':'Yīn Shà','华盖':'Huá Gài',
 '空亡':'Kōng Wáng','天哭':'Tiān Kū','天才':'Tiān Cái','天福':'Tiān Fú','天德':'Tiān Dé','台辅':'Tái Fǔ',
 '旬空':'Xún Kōng','破碎':'Pò Suì','天月':'Tiān Yuè','寡宿':'Guǎ Sù','三台':'Sān Tái','凤阁':'Fèng Gé',
 '年解':'Nián Jiě','咸池':'Xián Chí','天空':'Tiān Kōng','蜚廉':'Fěi Lián',
 '长生':'Cháng Shēng','沐浴':'Mù Yù','冠带':'Guàn Dài','临官':'Lín Guān','帝旺':'Dì Wàng','衰':'Shuāi',
 '病':'Bìng','死':'Sǐ','墓':'Mù','绝':'Jué','胎':'Tāi','养':'Yǎng',
 '博士':'Bó Shì','力士':'Lì Shì','青龙':'Qīng Lóng','小耗':'Xiǎo Hào','将军':'Jiāng Jūn','奏书':'Zòu Shū',
 '飞廉':'Fēi Lián','喜神':'Xǐ Shén','病符':'Bìng Fú','伏兵':'Fú Bīng','官府':'Guān Fǔ',
 '岁建':'Suì Jiàn','晦气':'Huì Qì','丧门':'Sàng Mén','贯索':'Guàn Suǒ','官符':'Guān Fú','龙德':'Lóng Dé',
 '白虎':'Bái Hǔ','吊客':'Diào Kè',
 '将星':'Jiāng Xīng','攀鞍':'Pān Ān','岁驿':'Suì Yì','息神':'Xī Shén','劫煞':'Jié Shà','灾煞':'Zāi Shà',
 '天煞':'Tiān Shà','指背':'Zhǐ Bèi','月煞':'Yuè Shà','亡神':'Wáng Shén',
 '化禄':'Huà Lù','化权':'Huà Quán','化科':'Huà Kē','化忌':'Huà Jì',
}

# Glosses for the core stars (the additional stars already have their own gloss)
GLOSS_CORE = {
 '紫微':'Emperor - leadership, status, the controlling will','天机':'Intellect, strategy, change & movement',
 '太阳':'Energy, fame, father/men, public life','武曲':'Wealth, decisiveness, metal & action',
 '天同':'Comfort, harmony, leisure, emotional ease','廉贞':'Discipline, passion, politics & propriety',
 '天府':'Treasury - wealth, stability, conservation','太阴':'Assets, mother/women, privacy, intuition',
 '贪狼':'Desire, charm, ambition, indulgence','巨门':'Speech, debate, suspicion, hidden matters',
 '天相':'Service, diplomacy, contracts & the seal','天梁':'Protection, elders, mediation, longevity',
 '七杀':'Command, drive, upheaval, frontline force','破军':'Destruction & renewal, pioneering, volatility',
 '文昌':'Scholarship, writing, exams, reputation','文曲':'Arts, eloquence, charm, talent',
 '左辅':'Direct support, allies, loyal helpers','右弼':'Behind-the-scenes support, quiet helpers',
 '天魁':'Noble mentor (daytime), benefactors, patrons','天钺':'Noble mentor (nighttime), benefactors, patrons',
 '禄存':'Wealth store, savings, security','天马':'Movement, travel, momentum, drive',
 '擎羊':'Aggression, injury, sharp conflict','陀罗':'Drag, delay, entanglement, slow harm',
 '火星':'Sudden flare, temper, abrupt events','铃星':'Slow-burn trouble, hidden agitation',
 '地空':'Emptiness, lost plans, impracticality','地劫':'Sudden loss, drain, setbacks',
 '红鸾':'Romance, marriage, attraction, union','天刑':'Law, discipline, surgery, isolation',
 '天喜':'Joy, romance, children, celebration','天姚':'Charm, flirtation, social allure',
 '大耗':'Major loss, waste, heavy expenditure',
}
CAT_GLOSS = {'化禄':'Catalyst - prosperity, flow, opportunity','化权':'Catalyst - power, control, ambition',
 '化科':'Catalyst - fame, reputation, study','化忌':'Catalyst - obstruction, fixation, entanglement'}

rows = []
n = 1
for grp, names in GROUPS.items():
    for hz in names:
        c = core.get(hz)
        eng = (c["legacyEnglish"] or c["romanization"]) if c else ENGLISH.get(hz, "")
        pin = (c["pinyin"] if c else None) or PINYIN.get(hz, "")
        typ = c["billType"] if c else grp
        gloss = GLOSS_CORE.get(hz, "") if c else GLOSS.get(hz, "")
        rows.append([n, eng, hz, pin, typ, gloss] + [rate(hz, p) for p in PAL])
        n += 1
# catalysts appended, clearly separate
for hz, eng in CATALYSTS:
    rows.append([n, eng, hz, PINYIN.get(hz, ""), "Catalyst (Si Hua)", CAT_GLOSS.get(hz, "transforms its host star")] + [rate(hz, p) for p in PAL])
    n += 1

HEAD = ["ID", "Star (English)", "Hanzi", "Pinyin", "Type", "Gloss / note"] + PAL
with open(os.path.join(OUT, "purple-star-matrix-rated.csv"), "w", newline="") as f:
    w = csv.writer(f); w.writerow(HEAD)
    for r in rows: w.writerow(r)

stars_114 = sum(len(v) for v in GROUPS.values())
print(f"{stars_114} stars + {len(CATALYSTS)} catalysts = {len(rows)} rows × {len(PAL)} palaces, pre-rated")
print("wrote working_files/purple-star-matrix-rated.csv")
