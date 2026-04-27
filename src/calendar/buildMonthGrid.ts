import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export type DateKey = string;

export interface CalendarCell {
  /** ISO YYYY-MM-DD, 로컬 타임존 기준 */
  key: DateKey;
  /** Date 객체 (UI 비교용) */
  date: Date;
  /** 달력의 일자 숫자 (1~31) */
  day: number;
  /** 표시 중인 달에 속하는 칸인지 */
  inCurrentMonth: boolean;
  /** 오늘 날짜인지 */
  isToday: boolean;
}

/** YYYY-MM-DD (로컬). DateKey 표준 포맷. */
export function toDateKey(date: Date): DateKey {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 주어진 anchor 가 속한 달의 7×N 그리드 셀을 반환한다.
 * - 일요일 시작 (TechSpec §6-1 기본 합의)
 * - 이전/다음 달 보충 칸은 inCurrentMonth=false
 * - today 비교는 호출자에게 명시적으로 받아 의존성을 주입하기 쉽게 한다.
 */
export function buildMonthGrid(anchor: Date, today: Date = new Date()): CalendarCell[] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  // 항상 6주(42칸) 고정 — 월별 길이 차이로 그리드 높이가 흔들리지 않도록.
  const gridEnd = addDays(gridStart, 41);

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    key: toDateKey(date),
    date,
    day: date.getDate(),
    inCurrentMonth: isSameMonth(date, monthStart) || isSameMonth(date, monthEnd),
    isToday: isSameDay(date, today),
  }));
}
