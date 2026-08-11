/** Kiểu dữ liệu dùng chung cho mạng lưới garage. */

export type MucUuTien = 'thap' | 'binh_thuong' | 'cao' | 'khan';

export type TrangThaiYeuCau =
  | 'moi'          // khách vừa gửi
  | 'da_lien_he'   // tổng đài đã gọi xác nhận
  | 'da_hen'       // đã hẹn lịch
  | 'dang_sua'     // xe đang ở garage
  | 'hoan_thanh'
  | 'huy';

export interface YeuCauDichVu {
  id: string;
  ma: string;
  khachHang: string;
  bienSo: string;
  hangXe: string;
  dongXe: string;
  moTaVanDe: string;
  trangThai: TrangThaiYeuCau;
  uuTien: MucUuTien;
  taoLuc: string;
  lienHeLuc?: string;
  /** Garage đối tác đã chọn. */
  garageDaChon?: string;
}

/** Một garage trong mạng lưới. */
export interface Garage {
  id: string;
  ten: string;
  /** Khoảng cách tới chỗ khách, tính bằng km. */
  khoangCachKm: number;
  /** Điểm chất lượng tích luỹ 0–100 từ các lần làm trước. */
  diemChatLuong: number;
  /** Số xe đang nhận, so với sức chứa. */
  dangNhan: number;
  sucChua: number;
  /** Hạng mục garage này làm được. */
  chuyenMon: string[];
  dangHoatDong: boolean;
}

export type TrangThaiBaoGia =
  | 'da_gui'       // đã gửi yêu cầu, chờ garage báo
  | 'da_bao'       // garage đã gửi giá
  | 'tu_choi'      // garage từ chối nhận
  | 'het_han'      // quá hạn không phản hồi
  | 'duoc_chon'
  | 'khong_chon';

export interface BaoGiaDoiTac {
  id: string;
  yeuCauId: string;
  garageId: string;
  trangThai: TrangThaiBaoGia;
  /** Tiền công + phụ tùng, chưa thuế. */
  giaTruocThue?: number;
  /** Số giờ ước tính hoàn thành. */
  soGioUocTinh?: number;
  /** Bảo hành garage cam kết, tính bằng tháng. */
  baoHanhThang?: number;
  guiLuc: string;
  baoLuc?: string;
  hanPhanHoi: string;
  ghiChu?: string;
}

// ─── Bàn giao xe ──────────────────────────────────────────────────────────

export type BenGiuXe = 'khach_hang' | 'dieu_phoi' | 'garage';

/**
 * Một lần chuyển giao xe giữa hai bên.
 *
 * Xe là tài sản của khách; ai đang giữ nó phải luôn xác định được. Xem
 * `handover.ts`.
 */
export interface BanGiao {
  id: string;
  yeuCauId: string;
  tu: BenGiuXe;
  den: BenGiuXe;
  /** Số công-tơ-mét lúc bàn giao — cơ sở đối chiếu nếu có tranh chấp. */
  soKm: number;
  /** Mức nhiên liệu 0–100%. */
  nhienLieu: number;
  /** Hư hỏng ghi nhận tại thời điểm bàn giao. */
  ghiNhanHuHong: string[];
  /** Ảnh chụp làm bằng chứng — ở đây chỉ giữ số lượng, không giữ ảnh. */
  soAnh: number;
  /** Hai bên đã ký xác nhận chưa. */
  benGiaoKy: boolean;
  benNhanKy: boolean;
  luc: string;
}

// ─── Quyết toán ───────────────────────────────────────────────────────────

export type TrangThaiQuyetToan = 'nhap' | 'cho_duyet' | 'da_duyet' | 'dang_tra' | 'da_tra' | 'tu_choi';

export interface DongQuyetToan {
  moTa: string;
  soLuong: number;
  donGia: number;
  /** Hạng mục có chịu thuế không — phụ tùng và công thợ khác nhau ở một số hợp đồng. */
  chiuThue: boolean;
}

export interface QuyetToan {
  id: string;
  ma: string;
  yeuCauId: string;
  garageId: string;
  cacDong: DongQuyetToan[];
  thueSuat: number;
  /** Phần trăm giữ lại tới hết hạn bảo hành. */
  tyLeGiuLai: number;
  baoHanhThang: number;
  trangThai: TrangThaiQuyetToan;
  taoLuc: string;
  hoanThanhCongViecLuc?: string;
}

export interface LanThanhToan {
  quyetToanId: string;
  soTien: number;
  luc: string;
  ghiChu?: string;
}
