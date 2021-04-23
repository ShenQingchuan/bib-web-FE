import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'; // 导入本地化语言

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

export function useDayjs(timestamp: number) {
  return dayjs(timestamp);
}
