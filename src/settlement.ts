/**
 * Quyết toán với garage đối tác.
 *
 * Sau khi xe sửa xong, mạng lưới trả tiền cho garage đã làm. Nghe đơn giản,
 * nhưng có hai chi tiết định hình toàn bộ module này:
 *
 * **1. Không phải hạng mục nào cũng chịu thuế.** Phụ tùng có hoá đơn thì chịu
 * VAT; công thợ ở nhiều garage nhỏ thì không. Tính thuế trên tổng là tính sai,
 * và sai theo hướng mạng lưới trả thừa.
 *
 * **2. Giữ lại một phần cho tới hết hạn bảo hành.** Trả hết ngay thì khi xe
 * hỏng lại trong thời gian bảo hành, garage không còn động lực tài chính để
 * quay lại sửa — và mạng lưới là bên phải đứng ra chịu trách nhiệm với khách.
 */

import type { LanThanhToan, QuyetToan, TrangThaiQuyetToan } from './types.js';

export class SettlementError extends Error {}

export const THUE_SUAT_MAC_DINH = 0.1;

/** Tỷ lệ giữ lại mặc định cho tới hết hạn bảo hành. */
export const TY_LE_GIU_LAI_MAC_DINH = 0.1;

const CHUYEN_HOP_LE: Record<TrangThaiQuyetToan, TrangThaiQuyetToan[]> = {
  nhap: ['cho_duyet'],
  cho_duyet: ['da_duyet', 'tu_choi', 'nhap'],
  da_duyet: ['dang_tra'],
  dang_tra: ['da_tra'],
  da_tra: [],
  tu_choi: ['nhap'],
};

export function chuyenDuoc(tu: TrangThaiQuyetToan, den: TrangThaiQuyetToan): boolean {
  return CHUYEN_HOP_LE[tu]?.includes(den) ?? false;
}

export interface TinhToan {
  /** Tổng các hạng mục không chịu thuế. */
  khongChiuThue: number;
  /** Tổng các hạng mục chịu thuế, trước thuế. */
  chiuThue: number;
  thue: number;
  /** Tổng phải trả trước khi giữ lại. */
  tongCong: number;
  /** Phần giữ lại tới hết hạn bảo hành. */
  giuLai: number;
  /** Trả ngay sau khi nghiệm thu. */
  traNgay: number;
}

const lamTron = (n: number) => Math.round(n);

/**
 * Tính một phiếu quyết toán.
 *
 * Thuế chỉ tính trên phần chịu thuế. Phần giữ lại tính trên **tổng cộng gồm cả
 * thuế**, vì nếu garage phải quay lại sửa bảo hành thì chi phí họ bỏ ra cũng
 * gồm cả thuế.
 */
export function tinhQuyetToan(qt: QuyetToan): TinhToan {
  if (qt.thueSuat < 0 || qt.thueSuat > 1) throw new SettlementError('Thuế suất phải trong khoảng 0–1.');
  if (qt.tyLeGiuLai < 0 || qt.tyLeGiuLai > 1) throw new SettlementError('Tỷ lệ giữ lại phải trong khoảng 0–1.');

  let khongChiuThue = 0;
  let chiuThue = 0;

  for (const d of qt.cacDong) {
    if (d.soLuong < 0 || d.donGia < 0) {
      throw new SettlementError(`Dòng "${d.moTa}" có số lượng hoặc đơn giá âm.`);
    }
    const tien = d.soLuong * d.donGia;
    if (d.chiuThue) chiuThue += tien;
    else khongChiuThue += tien;
  }

  const thue = lamTron(chiuThue * qt.thueSuat);
  const tongCong = lamTron(khongChiuThue + chiuThue + thue);
  const giuLai = lamTron(tongCong * qt.tyLeGiuLai);

  return {
    khongChiuThue: lamTron(khongChiuThue),
    chiuThue: lamTron(chiuThue),
    thue,
    tongCong,
    giuLai,
    traNgay: tongCong - giuLai,
  };
}

/**
 * Ngày được phép trả nốt phần giữ lại.
 *
 * Tính từ **ngày hoàn thành công việc**, không phải ngày lập phiếu — bảo hành
 * bắt đầu chạy khi khách nhận xe, và hai mốc đó có thể cách nhau nhiều ngày nếu
 * bộ phận kế toán làm phiếu muộn.
 */
export function ngayTraPhanGiuLai(qt: QuyetToan): string | null {
  if (!qt.hoanThanhCongViecLuc) return null;
  const t = Date.parse(qt.hoanThanhCongViecLuc);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  d.setMonth(d.getMonth() + qt.baoHanhThang);
  return d.toISOString().slice(0, 10);
}

export function daHetBaoHanh(qt: QuyetToan, now = new Date()): boolean {
  const ngay = ngayTraPhanGiuLai(qt);
  if (!ngay) return false;
  return Date.parse(ngay) <= now.getTime();
}

export interface TinhTrangThanhToan {
  tongCong: number;
  daTra: number;
  giuLai: number;
  /** Còn phải trả ngay, chưa tính phần giữ lại. */
  conPhaiTraNgay: number;
  /** Phần giữ lại đã tới hạn trả chưa. */
  giuLaiDenHan: boolean;
  /** Đã tất toán hoàn toàn. */
  tatToan: boolean;
}

/**
 * Tình trạng thanh toán của một phiếu.
 *
 * Phần giữ lại **không** tính vào "còn phải trả ngay": nó là khoản có điều kiện,
 * và trộn nó vào số nợ hiện tại sẽ làm cả kế toán lẫn garage hiểu nhầm là mạng
 * lưới đang chậm trả.
 */
export function tinhTrangThanhToan(
  qt: QuyetToan,
  cacLanTra: LanThanhToan[],
  now = new Date()
): TinhTrangThanhToan {
  const t = tinhQuyetToan(qt);
  const daTra = cacLanTra
    .filter((p) => p.quyetToanId === qt.id)
    .reduce((s, p) => s + p.soTien, 0);

  const denHan = daHetBaoHanh(qt, now);
  const phaiTraTinhToiThoiDiem = denHan ? t.tongCong : t.traNgay;

  return {
    tongCong: t.tongCong,
    daTra: lamTron(daTra),
    giuLai: t.giuLai,
    conPhaiTraNgay: Math.max(0, lamTron(phaiTraTinhToiThoiDiem - daTra)),
    giuLaiDenHan: denHan,
    tatToan: daTra >= t.tongCong,
  };
}

/**
 * Ghi nhận một lần trả tiền.
 *
 * Chặn trả vượt tổng phải trả tại thời điểm đó — trả trước phần giữ lại khi bảo
 * hành chưa hết là làm mất chính cơ chế mà phần giữ lại sinh ra để bảo đảm.
 */
export function traTien(
  qt: QuyetToan,
  cacLanTra: LanThanhToan[],
  soTien: number,
  luc: string,
  now = new Date(),
  ghiChu?: string
): LanThanhToan[] {
  if (!Number.isFinite(soTien) || soTien <= 0) {
    throw new SettlementError('Số tiền thanh toán không hợp lệ.');
  }
  if (qt.trangThai !== 'da_duyet' && qt.trangThai !== 'dang_tra') {
    throw new SettlementError(`Phiếu ở trạng thái "${qt.trangThai}", chưa trả tiền được.`);
  }

  const tt = tinhTrangThanhToan(qt, cacLanTra, now);
  if (soTien > tt.conPhaiTraNgay) {
    const vi = tt.giuLaiDenHan
      ? 'vượt số còn phải trả'
      : `vượt số được trả lúc này — còn ${lamTron(tt.giuLai).toLocaleString('vi-VN')}đ giữ lại tới khi hết bảo hành`;
    throw new SettlementError(
      `Số tiền ${lamTron(soTien).toLocaleString('vi-VN')}đ ${vi} (${tt.conPhaiTraNgay.toLocaleString('vi-VN')}đ).`
    );
  }

  return [...cacLanTra, { quyetToanId: qt.id, soTien: lamTron(soTien), luc, ghiChu }];
}

/**
 * Đối chiếu quyết toán với báo giá đã chốt.
 *
 * Garage phát sinh thêm hạng mục trong lúc sửa là chuyện bình thường — mở máy
 * ra mới thấy hết. Nhưng phát sinh phải được duyệt trước khi làm, chứ không
 * xuất hiện lần đầu trên phiếu quyết toán.
 */
export interface DoiChieuBaoGia {
  giaBaoTruoc: number;
  giaQuyetToan: number;
  chenhLech: number;
  tyLeVuot: number;
  /** Vượt ngưỡng thì cần duyệt lại, không tự động thông qua. */
  canDuyetLai: boolean;
}

export const NGUONG_VUOT_BAO_GIA = 0.1;

export function doiChieuVoiBaoGia(
  qt: QuyetToan,
  giaBaoTruoc: number,
  nguong = NGUONG_VUOT_BAO_GIA
): DoiChieuBaoGia {
  const t = tinhQuyetToan(qt);
  const chenhLech = t.tongCong - giaBaoTruoc;
  const tyLeVuot = giaBaoTruoc > 0 ? chenhLech / giaBaoTruoc : 0;

  return {
    giaBaoTruoc,
    giaQuyetToan: t.tongCong,
    chenhLech,
    tyLeVuot: Math.round(tyLeVuot * 1000) / 10,
    canDuyetLai: tyLeVuot > nguong,
  };
}
