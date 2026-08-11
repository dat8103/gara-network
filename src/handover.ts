/**
 * Chuỗi bàn giao xe.
 *
 * Xe là tài sản đắt tiền của khách, và trong một mạng lưới nó đi qua nhiều tay:
 * khách → người điều phối → garage → điều phối → khách. Mỗi lần chuyển tay là
 * một lần có thể phát sinh tranh chấp: vết xước này có từ trước hay mới, xăng
 * đầy hay vơi, đồng hồ chạy thêm bao nhiêu km.
 *
 * Không có bằng chứng thì tranh chấp giải quyết bằng lời nói, và bên yếu thế
 * hơn — thường là khách — chịu thiệt. Điều đó giết niềm tin vào cả mạng lưới,
 * kể cả khi phần lớn garage làm ăn tử tế.
 *
 * Nên mỗi lần chuyển tay ghi lại **số km, mức nhiên liệu, hư hỏng nhìn thấy,
 * ảnh chụp và chữ ký hai bên**. Module này giữ phần quy tắc: chuỗi phải liền
 * mạch, không đứt đoạn, và mọi chênh lệch giữa hai lần bàn giao đều truy được
 * về đúng bên đang giữ xe.
 */

import type { BanGiao, BenGiuXe } from './types.js';

export class HandoverError extends Error {}

/** Số ảnh tối thiểu cho một lần bàn giao. */
export const SO_ANH_TOI_THIEU = 4;

/**
 * Bàn giao hợp lệ chưa.
 *
 * Yêu cầu **cả hai bên ký**. Chỉ một bên ký thì tờ biên bản chỉ là lời khai
 * một phía, và nó vô giá trị đúng vào lúc cần đến nhất.
 */
export function kiemTraBanGiao(bg: BanGiao): { hopLe: boolean; loi: string[] } {
  const loi: string[] = [];

  if (bg.tu === bg.den) loi.push('Bên giao và bên nhận trùng nhau.');
  if (!bg.benGiaoKy) loi.push('Bên giao chưa ký.');
  if (!bg.benNhanKy) loi.push('Bên nhận chưa ký.');
  if (bg.soAnh < SO_ANH_TOI_THIEU) loi.push(`Cần tối thiểu ${SO_ANH_TOI_THIEU} ảnh, hiện có ${bg.soAnh}.`);
  if (bg.soKm < 0) loi.push('Số km không hợp lệ.');
  if (bg.nhienLieu < 0 || bg.nhienLieu > 100) loi.push('Mức nhiên liệu phải trong khoảng 0–100%.');

  return { hopLe: loi.length === 0, loi };
}

export interface LoHongChuoi {
  viTri: number;
  moTa: string;
}

/**
 * Kiểm tra chuỗi bàn giao có liền mạch không.
 *
 * Bên nhận của lần trước phải là bên giao của lần sau. Đứt đoạn nghĩa là có một
 * lần chuyển tay không được ghi nhận — và đó chính là khoảng thời gian không ai
 * chịu trách nhiệm nếu xe hỏng.
 *
 * Xe cũng phải **quay về khách** ở cuối chuỗi khi công việc đã xong.
 */
export function kiemTraChuoi(chuoi: BanGiao[], daHoanThanh = false): LoHongChuoi[] {
  const loHong: LoHongChuoi[] = [];
  if (!chuoi.length) return loHong;

  const theoThoiGian = [...chuoi].sort((a, b) => a.luc.localeCompare(b.luc));

  if (theoThoiGian[0].tu !== 'khach_hang') {
    loHong.push({ viTri: 0, moTa: `Chuỗi bắt đầu từ "${theoThoiGian[0].tu}" thay vì khách hàng.` });
  }

  for (let i = 1; i < theoThoiGian.length; i++) {
    const truoc = theoThoiGian[i - 1];
    const nay = theoThoiGian[i];
    if (truoc.den !== nay.tu) {
      loHong.push({
        viTri: i,
        moTa: `Đứt đoạn: lần trước giao cho "${truoc.den}" nhưng lần này lại giao đi từ "${nay.tu}".`,
      });
    }
    if (nay.soKm < truoc.soKm) {
      // Đồng hồ km không lùi được. Lùi nghĩa là ghi sai, hoặc tệ hơn.
      loHong.push({ viTri: i, moTa: `Số km lùi từ ${truoc.soKm} xuống ${nay.soKm}.` });
    }
  }

  const cuoi = theoThoiGian[theoThoiGian.length - 1];
  if (daHoanThanh && cuoi.den !== 'khach_hang') {
    loHong.push({ viTri: theoThoiGian.length - 1, moTa: `Công việc đã xong nhưng xe đang ở "${cuoi.den}".` });
  }

  return loHong;
}

/** Ai đang giữ xe. */
export function aiDangGiu(chuoi: BanGiao[]): BenGiuXe {
  if (!chuoi.length) return 'khach_hang';
  return [...chuoi].sort((a, b) => a.luc.localeCompare(b.luc)).at(-1)!.den;
}

export interface ChenhLech {
  tuLan: number;
  denLan: number;
  benChiuTrachNhiem: BenGiuXe;
  kmTang: number;
  nhienLieuThayDoi: number;
  huHongMoi: string[];
}

/**
 * So sánh hai lần bàn giao liên tiếp để tìm chênh lệch.
 *
 * Bên chịu trách nhiệm là **bên nhận của lần trước** — tức là bên đã giữ xe
 * trong khoảng giữa hai lần bàn giao. Đây là toàn bộ giá trị của việc ghi chuỗi:
 * mọi thay đổi trên xe đều quy được về đúng một bên, và không ai phải tranh cãi
 * bằng trí nhớ.
 */
export function chenhLechGiuaCacLan(chuoi: BanGiao[]): ChenhLech[] {
  const theoThoiGian = [...chuoi].sort((a, b) => a.luc.localeCompare(b.luc));
  const out: ChenhLech[] = [];

  for (let i = 1; i < theoThoiGian.length; i++) {
    const truoc = theoThoiGian[i - 1];
    const nay = theoThoiGian[i];
    const cuHuHong = new Set(truoc.ghiNhanHuHong);

    out.push({
      tuLan: i - 1,
      denLan: i,
      benChiuTrachNhiem: truoc.den,
      kmTang: nay.soKm - truoc.soKm,
      nhienLieuThayDoi: nay.nhienLieu - truoc.nhienLieu,
      huHongMoi: nay.ghiNhanHuHong.filter((h) => !cuHuHong.has(h)),
    });
  }
  return out;
}

/** Km xe chạy vượt mức hợp lý khi ở garage — dấu hiệu xe bị dùng riêng. */
export const KM_CHAY_THU_HOP_LY = 30;

export interface CanhBaoBanGiao {
  muc: 'canh_bao' | 'nghiem_trong';
  noiDung: string;
  benLienQuan: BenGiuXe;
}

/**
 * Cảnh báo từ chuỗi bàn giao.
 *
 * Chạy thử xe sau sửa là bình thường và cần thiết. Nhưng vài chục km thì không
 * còn là chạy thử — và khách phát hiện ra qua đồng hồ km thì mất niềm tin vào
 * cả mạng lưới, không riêng garage đó.
 */
export function canhBaoTuChuoi(chuoi: BanGiao[], kmHopLy = KM_CHAY_THU_HOP_LY): CanhBaoBanGiao[] {
  const out: CanhBaoBanGiao[] = [];

  for (const c of chenhLechGiuaCacLan(chuoi)) {
    if (c.huHongMoi.length) {
      out.push({
        muc: 'nghiem_trong',
        noiDung: `Hư hỏng mới xuất hiện khi xe ở "${c.benChiuTrachNhiem}": ${c.huHongMoi.join(', ')}.`,
        benLienQuan: c.benChiuTrachNhiem,
      });
    }
    if (c.benChiuTrachNhiem === 'garage' && c.kmTang > kmHopLy) {
      out.push({
        muc: 'canh_bao',
        noiDung: `Xe chạy thêm ${c.kmTang} km khi ở garage, vượt mức chạy thử hợp lý ${kmHopLy} km.`,
        benLienQuan: 'garage',
      });
    }
    if (c.nhienLieuThayDoi < -25) {
      out.push({
        muc: 'canh_bao',
        noiDung: `Nhiên liệu giảm ${Math.abs(c.nhienLieuThayDoi)}% khi xe ở "${c.benChiuTrachNhiem}".`,
        benLienQuan: c.benChiuTrachNhiem,
      });
    }
  }
  return out;
}
