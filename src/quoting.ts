/**
 * Vòng báo giá đối tác.
 *
 * Khách gửi một yêu cầu sửa xe. Hệ thống gửi yêu cầu báo giá tới nhiều garage
 * trong mạng lưới, thu về các mức giá, rồi chọn một garage để giao việc.
 *
 * Bài toán khó không phải là so giá. Nó là: **rẻ nhất thường không phải tốt
 * nhất**. Một garage báo rẻ hơn 15% nhưng cách xa 30km, đang quá tải, và điểm
 * chất lượng thấp thì tổng chi phí thật cao hơn nhiều — khách phải chờ lâu, có
 * khả năng phải làm lại, và người điều phối tốn thời gian theo dõi.
 *
 * Nhưng cũng không thể chọn bằng cảm tính, vì người điều phối phải giải thích
 * được với khách và với garage bị loại. Nên chọn bằng **điểm tổng hợp có trọng
 * số**, mọi thành phần đều hiện ra để đọc.
 */

import type { BaoGiaDoiTac, Garage, MucUuTien } from './types.js';

export class QuotingError extends Error {}

/** Trọng số các yếu tố khi chấm điểm một báo giá. Cộng lại bằng 1. */
export interface TrongSoChon {
  gia: number;
  chatLuong: number;
  thoiGian: number;
  khoangCach: number;
}

export const TRONG_SO_MAC_DINH: TrongSoChon = {
  gia: 0.4,
  chatLuong: 0.3,
  thoiGian: 0.2,
  khoangCach: 0.1,
};

/**
 * Yêu cầu khẩn đảo trọng số: thời gian quan trọng hơn giá.
 *
 * Xe hỏng giữa đường thì khách cần xe chạy được, không cần rẻ hơn 300 nghìn.
 * Dùng cùng một bộ trọng số cho mọi mức ưu tiên là bỏ qua chính lý do người
 * điều phối đánh dấu một yêu cầu là khẩn.
 */
export const TRONG_SO_KHAN: TrongSoChon = {
  gia: 0.2,
  chatLuong: 0.3,
  thoiGian: 0.4,
  khoangCach: 0.1,
};

export function trongSoTheoUuTien(uuTien: MucUuTien): TrongSoChon {
  return uuTien === 'khan' ? TRONG_SO_KHAN : TRONG_SO_MAC_DINH;
}

/** Tỷ lệ lấp đầy của một garage, 0–1. */
export function tyLeTai(g: Garage): number {
  if (g.sucChua <= 0) return 1;
  return Math.min(1, g.dangNhan / g.sucChua);
}

/**
 * Garage đủ điều kiện nhận yêu cầu này.
 *
 * Ba điều kiện loại thẳng, không cho điểm bù:
 *   - đang ngừng hoạt động;
 *   - đã kín chỗ — nhận thêm chỉ để xe nằm chờ;
 *   - không làm được hạng mục cần sửa.
 *
 * Chuyên môn là ràng buộc cứng vì gửi một xe hộp số tự động tới garage chỉ làm
 * đồng sơn thì họ sẽ nhận rồi thuê ngoài, và chất lượng ra khỏi tầm kiểm soát.
 */
export function garageDuDieuKien(all: Garage[], hangMuc: string): Garage[] {
  return all.filter(
    (g) => g.dangHoatDong && tyLeTai(g) < 1 && (hangMuc === '' || g.chuyenMon.includes(hangMuc))
  );
}

export interface DiemBaoGia {
  baoGiaId: string;
  garageId: string;
  tenGarage: string;
  diem: number;
  /** Điểm từng thành phần, 0–100 — hiện ra để người điều phối đọc được. */
  thanhPhan: { gia: number; chatLuong: number; thoiGian: number; khoangCach: number };
  giaTruocThue: number;
  /** Chênh so với báo giá rẻ nhất, tính bằng phần trăm. */
  datHonReNhat: number;
}

/**
 * Chấm điểm và xếp hạng các báo giá đã nhận.
 *
 * Mỗi thành phần chuẩn hoá về thang 100 **tương đối trong nhóm** chứ không theo
 * mốc tuyệt đối: "rẻ" chỉ có nghĩa khi so với các báo giá khác của cùng công
 * việc đó. Một mốc tuyệt đối kiểu "dưới 2 triệu là rẻ" sẽ sai ngay khi gặp một
 * ca sửa lớn.
 */
export function xepHangBaoGia(
  baoGia: BaoGiaDoiTac[],
  garages: Garage[],
  trongSo: TrongSoChon = TRONG_SO_MAC_DINH
): DiemBaoGia[] {
  const hopLe = baoGia.filter(
    (b) => b.trangThai === 'da_bao' && typeof b.giaTruocThue === 'number' && b.giaTruocThue > 0
  );
  if (!hopLe.length) return [];

  const theoId = new Map(garages.map((g) => [g.id, g]));
  const gia = hopLe.map((b) => b.giaTruocThue!);
  const gio = hopLe.map((b) => b.soGioUocTinh ?? 0);
  const km = hopLe.map((b) => theoId.get(b.garageId)?.khoangCachKm ?? 0);

  const reNhat = Math.min(...gia);

  /** Chuẩn hoá "càng nhỏ càng tốt" về thang 100. */
  const nhoLaTot = (v: number, xs: number[]) => {
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    // Mọi giá trị bằng nhau thì thành phần này không phân biệt được ai hơn ai —
    // cho tất cả điểm tối đa thay vì chia cho 0.
    if (max === min) return 100;
    return Math.round(((max - v) / (max - min)) * 100);
  };

  return hopLe
    .map((b) => {
      const g = theoId.get(b.garageId);
      const thanhPhan = {
        gia: nhoLaTot(b.giaTruocThue!, gia),
        chatLuong: g?.diemChatLuong ?? 0,
        thoiGian: nhoLaTot(b.soGioUocTinh ?? 0, gio),
        khoangCach: nhoLaTot(g?.khoangCachKm ?? 0, km),
      };
      const diem =
        thanhPhan.gia * trongSo.gia +
        thanhPhan.chatLuong * trongSo.chatLuong +
        thanhPhan.thoiGian * trongSo.thoiGian +
        thanhPhan.khoangCach * trongSo.khoangCach;

      return {
        baoGiaId: b.id,
        garageId: b.garageId,
        tenGarage: g?.ten ?? b.garageId,
        diem: Math.round(diem * 10) / 10,
        thanhPhan,
        giaTruocThue: b.giaTruocThue!,
        datHonReNhat: Math.round(((b.giaTruocThue! - reNhat) / reNhat) * 1000) / 10,
      };
    })
    .sort((a, b) => (b.diem !== a.diem ? b.diem - a.diem : a.baoGiaId.localeCompare(b.baoGiaId)));
}

export interface KetQuaChon {
  chon: DiemBaoGia | null;
  xepHang: DiemBaoGia[];
  /** Vì sao không chọn cái rẻ nhất — câu này người điều phối cần để giải thích. */
  giaiThich?: string;
}

/**
 * Chọn garage.
 *
 * Nếu garage thắng điểm không phải garage rẻ nhất, hệ thống sinh sẵn câu giải
 * thích. Người điều phối sẽ phải trả lời câu "sao không chọn chỗ rẻ hơn" —
 * từ khách, từ kế toán, hoặc từ chính garage bị loại — và câu trả lời phải dựa
 * trên số liệu chứ không phải cảm nhận.
 */
export function chonGarage(
  baoGia: BaoGiaDoiTac[],
  garages: Garage[],
  uuTien: MucUuTien = 'binh_thuong'
): KetQuaChon {
  const xepHang = xepHangBaoGia(baoGia, garages, trongSoTheoUuTien(uuTien));
  if (!xepHang.length) return { chon: null, xepHang: [] };

  const thang = xepHang[0];
  const reNhat = [...xepHang].sort((a, b) => a.giaTruocThue - b.giaTruocThue)[0];

  if (thang.baoGiaId === reNhat.baoGiaId) {
    return { chon: thang, xepHang, giaiThich: `${thang.tenGarage} vừa rẻ nhất vừa đạt điểm tổng cao nhất.` };
  }

  const ly: string[] = [];
  if (thang.thanhPhan.chatLuong > reNhat.thanhPhan.chatLuong)
    ly.push(`điểm chất lượng ${thang.thanhPhan.chatLuong} so với ${reNhat.thanhPhan.chatLuong}`);
  if (thang.thanhPhan.thoiGian > reNhat.thanhPhan.thoiGian) ly.push('hoàn thành nhanh hơn');
  if (thang.thanhPhan.khoangCach > reNhat.thanhPhan.khoangCach) ly.push('gần khách hơn');

  return {
    chon: thang,
    xepHang,
    giaiThich:
      `Chọn ${thang.tenGarage} dù đắt hơn ${thang.datHonReNhat}% so với ${reNhat.tenGarage}: ` +
      (ly.length ? ly.join(', ') : 'điểm tổng hợp cao hơn') + '.',
  };
}

/**
 * Đánh dấu báo giá quá hạn phản hồi.
 *
 * Garage không trả lời trong hạn không phải lỗi của họ — họ bận. Nhưng vòng
 * báo giá phải khép lại đúng hạn, nếu không một garage im lặng sẽ giữ xe của
 * khách nằm chờ vô thời hạn.
 */
export function danhDauHetHan(baoGia: BaoGiaDoiTac[], now = new Date()): BaoGiaDoiTac[] {
  return baoGia.map((b) =>
    b.trangThai === 'da_gui' && Date.parse(b.hanPhanHoi) < now.getTime()
      ? { ...b, trangThai: 'het_han' as const }
      : b
  );
}

export interface TinhTrangVong {
  daGui: number;
  daBao: number;
  tuChoi: number;
  hetHan: number;
  choPhanHoi: number;
  /** Đã đủ báo giá để quyết định chưa. */
  duDeQuyetDinh: boolean;
}

/**
 * Tình trạng một vòng báo giá.
 *
 * `duDeQuyetDinh` cần **ít nhất hai** báo giá: một báo giá đơn độc thì không so
 * được với gì, và người điều phối không có cơ sở nào để bảo vệ lựa chọn đó.
 * Ngoại lệ là khi mọi garage khác đã từ chối hoặc hết hạn — lúc đó một báo giá
 * là tất cả những gì có.
 */
export function tinhTrangVong(baoGia: BaoGiaDoiTac[], toiThieu = 2): TinhTrangVong {
  const dem = (s: BaoGiaDoiTac['trangThai']) => baoGia.filter((b) => b.trangThai === s).length;
  const daBao = dem('da_bao');
  const choPhanHoi = dem('da_gui');

  return {
    daGui: baoGia.length,
    daBao,
    tuChoi: dem('tu_choi'),
    hetHan: dem('het_han'),
    choPhanHoi,
    duDeQuyetDinh: daBao >= toiThieu || (daBao >= 1 && choPhanHoi === 0),
  };
}
