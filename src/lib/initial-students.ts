import type { Student } from "./types";

/** プログラミングのみの生徒（教材配布対象外） */
const EXCLUDED_NAMES = new Set([
  "中谷海翔",
  "吉田しゅん",
  "吉田なお",
  "和泉",
  "徳永志",
  "松口聡真",
  "清水晋吾",
  "片山寧々",
  "芦谷天眞",
]);

const ALL_STUDENTS: Student[] = [
  { id: "student-中垣心結", name: "中垣心結", grade: "中1" },
  { id: "student-井上丈", name: "井上丈", grade: "中1" },
  { id: "student-和田美倖", name: "和田美倖", grade: "中1" },
  { id: "student-大崎薫", name: "大崎薫", grade: "中1" },
  { id: "student-川辺詩月", name: "川辺詩月", grade: "中1" },
  { id: "student-片尾心音", name: "片尾心音", grade: "中1" },
  { id: "student-畑中結弦", name: "畑中結弦", grade: "中1" },
  { id: "student-石川栄人", name: "石川栄人", grade: "中1" },
  { id: "student-筒井結唯", name: "筒井結唯", grade: "中1" },
  { id: "student-高木佳希", name: "高木佳希", grade: "中1" },
  { id: "student-上西佑奈", name: "上西佑奈", grade: "中2" },
  { id: "student-北市渉", name: "北市渉", grade: "中2" },
  { id: "student-吉田尚仁", name: "吉田尚仁", grade: "中2" },
  { id: "student-川内慎司", name: "川内慎司", grade: "中2" },
  { id: "student-川村龍", name: "川村龍", grade: "中2" },
  { id: "student-戸田イゴル", name: "戸田イゴル", grade: "中2" },
  { id: "student-植盛倖多", name: "植盛倖多", grade: "中2" },
  { id: "student-横山将吾", name: "横山将吾", grade: "中2" },
  { id: "student-清水悠富", name: "清水悠富", grade: "中2" },
  { id: "student-篠崎晴輝", name: "篠崎晴輝", grade: "中2" },
  { id: "student-葛井優太", name: "葛井優太", grade: "中2" },
  { id: "student-中西奏羽", name: "中西奏羽", grade: "中3" },
  { id: "student-伊藤かほ", name: "伊藤かほ", grade: "中3" },
  { id: "student-古園井千晶", name: "古園井千晶", grade: "中3" },
  { id: "student-大塚五十楽", name: "大塚五十楽", grade: "中3" },
  { id: "student-岡彩乃", name: "岡彩乃", grade: "中3" },
  { id: "student-岡田命絆", name: "岡田命絆", grade: "中3" },
  { id: "student-林田朝香", name: "林田朝香", grade: "中3" },
  { id: "student-酒井紫えん", name: "酒井紫えん", grade: "中3" },
  { id: "student-野田柚花", name: "野田柚花", grade: "中3" },
  { id: "student-佐野楓真", name: "佐野楓真", grade: "小3" },
  { id: "student-松倉かほ", name: "松倉かほ", grade: "小3" },
  { id: "student-石司塁叶", name: "石司塁叶", grade: "小3" },
  { id: "student-鹿子希歩", name: "鹿子希歩", grade: "小3" },
  { id: "student-古庄統", name: "古庄統", grade: "小4" },
  { id: "student-浅野誠太", name: "浅野誠太", grade: "小4" },
  { id: "student-大辻倫太郎", name: "大辻倫太郎", grade: "小5" },
  { id: "student-本山大雅", name: "本山大雅", grade: "小5" },
  { id: "student-畑中八重乃", name: "畑中八重乃", grade: "小5" },
  { id: "student-重本悠月", name: "重本悠月", grade: "小5" },
  { id: "student-佐野楓一", name: "佐野楓一", grade: "小6" },
  { id: "student-大塚朔", name: "大塚朔", grade: "小6" },
  { id: "student-小川桐摩", name: "小川桐摩", grade: "小6" },
  { id: "student-小松英太", name: "小松英太", grade: "小6" },
  { id: "student-羽山央聖", name: "羽山央聖", grade: "小6" },
  { id: "student-西岡栞里", name: "西岡栞里", grade: "小6" },
  { id: "student-文平克乃新", name: "文平克乃新", grade: "高1" },
  { id: "student-伊藤希歩", name: "伊藤希歩", grade: "高2" },
  { id: "student-杉本理仁", name: "杉本理仁", grade: "高3" },
];

/** 個別授業_名簿まとめ_v4 から投入（プログラミングのみ除く49名） */
export function createInitialStudents(): Student[] {
  return ALL_STUDENTS.filter((s) => !EXCLUDED_NAMES.has(s.name));
}

export const ROSTER_STUDENT_COUNT = ALL_STUDENTS.filter(
  (s) => !EXCLUDED_NAMES.has(s.name),
).length;
