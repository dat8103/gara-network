/**
 * Dữ liệu mẫu — BỊA HOÀN TOÀN.
 *
 * Tên garage, tên khách, biển số, giá sửa chữa đều là hư cấu. Không có dữ liệu
 * của garage hay khách hàng thật.
 */

import type { BanGiao, BaoGiaDoiTac, Garage, QuyetToan, YeuCauDichVu } from '../src/index.js';

export const NOW = new Date('2026-03-10T09:00:00.000Z');
const gio = (n: number) => new Date(NOW.getTime() + n * 3_600_000).toISOString();

export const YEU_CAU: YeuCauDichVu = {
  id: 'YC-2026-0312',
  ma: 'YC-2026-0312',
  khachHang: 'Anh Trần Minh',
  bienSo: '30A-123.45',
  hangXe: 'Toyota',
  dongXe: 'Camry 2.0',
  moTaVanDe: 'Máy kêu lạ khi tăng tốc, đèn báo động cơ sáng',
  trangThai: 'da_hen',
  uuTien: 'binh_thuong',
  taoLuc: gio(-72),
  lienHeLuc: gio(-70),
};

export const MANG_LUOI: Garage[] = [
  { id: 'G-TC', ten: 'Garage Thành Công', khoangCachKm: 4, diemChatLuong: 92, dangNhan: 6, sucChua: 12, chuyenMon: ['dong_co', 'dien', 'hop_so'], dangHoatDong: true },
  { id: 'G-PL', ten: 'Garage Phú Lộc', khoangCachKm: 28, diemChatLuong: 58, dangNhan: 2, sucChua: 8, chuyenMon: ['dong_co', 'dong_son'], dangHoatDong: true },
  { id: 'G-HH', ten: 'Garage Hoàng Hà', khoangCachKm: 11, diemChatLuong: 78, dangNhan: 5, sucChua: 10, chuyenMon: ['dong_co', 'dien'], dangHoatDong: true },
  { id: 'G-DS', ten: 'Garage Đại Sơn', khoangCachKm: 7, diemChatLuong: 85, dangNhan: 9, sucChua: 9, chuyenMon: ['dong_co'], dangHoatDong: true },
  { id: 'G-NK', ten: 'Garage Ngọc Khánh', khoangCachKm: 15, diemChatLuong: 70, dangNhan: 1, sucChua: 6, chuyenMon: ['dong_son', 'gam'], dangHoatDong: true },
  { id: 'G-BT', ten: 'Garage Bình Tân', khoangCachKm: 9, diemChatLuong: 66, dangNhan: 0, sucChua: 5, chuyenMon: ['dong_co', 'dien'], dangHoatDong: false },
];

export const HANG_MUC = 'dong_co';

export const BAO_GIA: BaoGiaDoiTac[] = [
  { id: 'BG-1', yeuCauId: YEU_CAU.id, garageId: 'G-PL', trangThai: 'da_bao', giaTruocThue: 8_200_000, soGioUocTinh: 26, baoHanhThang: 3, guiLuc: gio(-48), baoLuc: gio(-40), hanPhanHoi: gio(-24) },
  { id: 'BG-2', yeuCauId: YEU_CAU.id, garageId: 'G-TC', trangThai: 'da_bao', giaTruocThue: 10_000_000, soGioUocTinh: 10, baoHanhThang: 12, guiLuc: gio(-48), baoLuc: gio(-44), hanPhanHoi: gio(-24) },
  { id: 'BG-3', yeuCauId: YEU_CAU.id, garageId: 'G-HH', trangThai: 'da_bao', giaTruocThue: 9_100_000, soGioUocTinh: 16, baoHanhThang: 6, guiLuc: gio(-48), baoLuc: gio(-38), hanPhanHoi: gio(-24) },
  { id: 'BG-4', yeuCauId: YEU_CAU.id, garageId: 'G-NK', trangThai: 'tu_choi', guiLuc: gio(-48), hanPhanHoi: gio(-24), ghiChu: 'Không nhận hạng mục động cơ' },
  { id: 'BG-5', yeuCauId: YEU_CAU.id, garageId: 'G-DS', trangThai: 'da_gui', guiLuc: gio(-48), hanPhanHoi: gio(-24) },
];

/** Chuỗi bàn giao có một hư hỏng mới phát sinh khi xe ở garage. */
export const CHUOI_BAN_GIAO: BanGiao[] = [
  { id: 'BG-A', yeuCauId: YEU_CAU.id, tu: 'khach_hang', den: 'dieu_phoi', soKm: 68_420, nhienLieu: 55, ghiNhanHuHong: ['xước nhẹ cản trước'], soAnh: 8, benGiaoKy: true, benNhanKy: true, luc: gio(-30) },
  { id: 'BG-B', yeuCauId: YEU_CAU.id, tu: 'dieu_phoi', den: 'garage', soKm: 68_426, nhienLieu: 54, ghiNhanHuHong: ['xước nhẹ cản trước'], soAnh: 6, benGiaoKy: true, benNhanKy: true, luc: gio(-28) },
  { id: 'BG-C', yeuCauId: YEU_CAU.id, tu: 'garage', den: 'dieu_phoi', soKm: 68_512, nhienLieu: 31, ghiNhanHuHong: ['xước nhẹ cản trước', 'nứt chân kính bên phải'], soAnh: 7, benGiaoKy: true, benNhanKy: true, luc: gio(-4) },
  { id: 'BG-D', yeuCauId: YEU_CAU.id, tu: 'dieu_phoi', den: 'khach_hang', soKm: 68_518, nhienLieu: 30, ghiNhanHuHong: ['xước nhẹ cản trước', 'nứt chân kính bên phải'], soAnh: 8, benGiaoKy: true, benNhanKy: true, luc: gio(-1) },
];

export const QUYET_TOAN: QuyetToan = {
  id: 'QT-2026-0088',
  ma: 'QT-2026-0088',
  yeuCauId: YEU_CAU.id,
  garageId: 'G-TC',
  cacDong: [
    { moTa: 'Công tháo lắp và kiểm tra động cơ', soLuong: 10, donGia: 250_000, chiuThue: false },
    { moTa: 'Bugi chính hãng (4 chiếc)', soLuong: 4, donGia: 320_000, chiuThue: true },
    { moTa: 'Cảm biến kích nổ', soLuong: 1, donGia: 2_400_000, chiuThue: true },
    { moTa: 'Dầu máy tổng hợp 5L', soLuong: 1, donGia: 1_150_000, chiuThue: true },
    { moTa: 'Công chạy thử và cân chỉnh', soLuong: 3, donGia: 250_000, chiuThue: false },
  ],
  thueSuat: 0.1,
  tyLeGiuLai: 0.1,
  baoHanhThang: 12,
  trangThai: 'da_duyet',
  taoLuc: gio(0),
  hoanThanhCongViecLuc: gio(-4),
};

/** Giá đã báo cho khách trước khi làm — để đối chiếu với quyết toán. */
export const GIA_DA_BAO_KHACH = 10_000_000;
